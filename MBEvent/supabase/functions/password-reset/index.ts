// deno-lint-ignore-file no-explicit-any
// @ts-nocheck  (this file runs on Deno, not on the app's TypeScript project)
// Supabase Edge Function: self-managed password-reset OTP.
//
// Mirrors the PHP flow (password_reset_try_send_otp / validate_otp / apply):
//   action=send_otp        -> generate a 6-digit code, store it, email it via Gmail SMTP
//   action=validate_otp    -> check a code without consuming it (for the UI step)
//   action=reset_password  -> verify code, then set the new password via Admin API
//
// Secrets required (set with `supabase secrets set ...`):
//   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY  (auto-injected on deploy)
//   SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, MAIL_FROM_ADDR, MAIL_FROM_NAME
//
// Deploy with `--no-verify-jwt` because these calls come from unauthenticated
// users who forgot their password.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";
import nodemailer from "npm:nodemailer@6.9.14";

const OTP_MINUTES = 5; // matches PASSWORD_RESET_OTP_MINUTES
const MAX_PER_HOUR = 3; // matches PASSWORD_RESET_MAX_PER_HOUR
const MAX_ATTEMPTS = 5;

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, "Content-Type": "application/json" },
  });
}

function generateOtp(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function admin() {
  return createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
}

async function sendOtpEmail(to: string, code: string) {
  const transporter = nodemailer.createTransport({
    host: Deno.env.get("SMTP_HOST") ?? "smtp.gmail.com",
    port: Number(Deno.env.get("SMTP_PORT") ?? "587"),
    secure: false, // STARTTLS on 587
    auth: {
      user: Deno.env.get("SMTP_USER")!,
      pass: Deno.env.get("SMTP_PASS")!,
    },
  });

  const fromAddr = Deno.env.get("MAIL_FROM_ADDR") ?? Deno.env.get("SMTP_USER")!;
  const fromName = Deno.env.get("MAIL_FROM_NAME") ?? "MB Events";

  await transporter.sendMail({
    from: `${fromName} <${fromAddr}>`,
    to,
    subject: `Your ${fromName} password reset code`,
    text: `Your verification code is ${code}. It expires in ${OTP_MINUTES} minutes.`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:480px;margin:auto">
        <h2 style="color:#111">Reset your password</h2>
        <p>Use this verification code to continue:</p>
        <p style="font-size:32px;font-weight:bold;letter-spacing:8px;color:#111">${code}</p>
        <p style="color:#666">This code expires in ${OTP_MINUTES} minutes. If you didn't request it, you can ignore this email.</p>
      </div>`,
  });
}

// Resolve an email from either an email address or a username (like PHP does).
async function resolveEmail(
  db: ReturnType<typeof admin>,
  identifier: string,
): Promise<string | null> {
  const trimmed = identifier.trim();
  if (trimmed.includes("@")) {
    const { data } = await db
      .from("profiles")
      .select("email")
      .ilike("email", trimmed)
      .maybeSingle();
    return (data as { email?: string } | null)?.email ?? null;
  }
  const { data } = await db
    .from("profiles")
    .select("email")
    .ilike("username", trimmed)
    .maybeSingle();
  return (data as { email?: string } | null)?.email ?? null;
}

async function findUserIdByEmail(
  db: ReturnType<typeof admin>,
  email: string,
): Promise<string | null> {
  const { data } = await db
    .from("profiles")
    .select("id")
    .ilike("email", email)
    .maybeSingle();
  return (data as { id?: string } | null)?.id ?? null;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ ok: false, message: "Method not allowed" }, 405);

  let payload: Record<string, string> = {};
  try {
    payload = await req.json();
  } catch {
    return json({ ok: false, message: "Invalid request body" }, 400);
  }

  const action = String(payload.action ?? "");
  const db = admin();

  try {
    if (action === "send_otp") {
      const email = await resolveEmail(db, String(payload.identifier ?? ""));
      // Do not reveal whether the account exists.
      if (!email) {
        return json({ ok: true, message: "If that account exists, a code was sent." });
      }

      // Rate limit: max N codes per hour per email.
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
      const { count } = await db
        .from("password_reset_otps")
        .select("id", { count: "exact", head: true })
        .ilike("email", email)
        .gte("created_at", oneHourAgo);

      if ((count ?? 0) >= MAX_PER_HOUR) {
        return json(
          { ok: false, message: "Too many code requests. Please try again later." },
          429,
        );
      }

      const code = generateOtp();
      const expiresAt = new Date(Date.now() + OTP_MINUTES * 60 * 1000).toISOString();

      // Invalidate previous unconsumed codes for this email.
      await db
        .from("password_reset_otps")
        .update({ consumed_at: new Date().toISOString() })
        .ilike("email", email)
        .is("consumed_at", null);

      const { error: insertErr } = await db
        .from("password_reset_otps")
        .insert({ email, code, expires_at: expiresAt });

      if (insertErr) {
        return json({ ok: false, message: "Could not create reset code." }, 500);
      }

      try {
        await sendOtpEmail(email, code);
      } catch (mailErr) {
        console.error("SMTP send failed", mailErr);
        return json(
          { ok: false, message: "Could not send the email. Please try again later." },
          502,
        );
      }
      return json({ ok: true, message: "A verification code was sent to your email." });
    }

    if (action === "validate_otp" || action === "reset_password") {
      const email = await resolveEmail(db, String(payload.identifier ?? ""));
      const otp = String(payload.otp ?? "");
      if (!email || otp.length !== 6) {
        return json({ ok: false, message: "Invalid or expired code." }, 400);
      }

      const { data: record } = await db
        .from("password_reset_otps")
        .select("*")
        .ilike("email", email)
        .is("consumed_at", null)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!record) {
        return json({ ok: false, message: "Invalid or expired code." }, 400);
      }

      const rec = record as {
        id: string;
        code: string;
        expires_at: string;
        attempts: number;
      };

      if (new Date(rec.expires_at).getTime() < Date.now()) {
        return json({ ok: false, message: "This code has expired. Request a new one." }, 400);
      }

      if (rec.attempts >= MAX_ATTEMPTS) {
        return json({ ok: false, message: "Too many attempts. Request a new code." }, 400);
      }

      if (rec.code !== otp) {
        await db
          .from("password_reset_otps")
          .update({ attempts: rec.attempts + 1 })
          .eq("id", rec.id);
        return json({ ok: false, message: "Incorrect code. Please try again." }, 400);
      }

      // Code is correct.
      if (action === "validate_otp") {
        const secondsLeft = Math.max(
          0,
          Math.floor((new Date(rec.expires_at).getTime() - Date.now()) / 1000),
        );
        return json({ ok: true, message: "Code verified.", expires_in: secondsLeft });
      }

      // action === reset_password: enforce password rules then set it.
      const newPassword = String(payload.password ?? "");
      const strong =
        newPassword.length >= 8 &&
        /[A-Z]/.test(newPassword) &&
        /[a-z]/.test(newPassword) &&
        /[0-9]/.test(newPassword);
      if (!strong) {
        return json(
          {
            ok: false,
            message:
              "Password must be at least 8 characters with upper, lower, and a number.",
          },
          400,
        );
      }

      const userId = await findUserIdByEmail(db, email);
      if (!userId) {
        return json({ ok: false, message: "Account not found." }, 400);
      }

      const { error: updateErr } = await db.auth.admin.updateUserById(userId, {
        password: newPassword,
      });
      if (updateErr) {
        return json({ ok: false, message: "Could not update password." }, 500);
      }

      await db
        .from("password_reset_otps")
        .update({ consumed_at: new Date().toISOString() })
        .eq("id", rec.id);

      return json({ ok: true, message: "Password updated. You can now sign in." });
    }

    return json({ ok: false, message: "Unknown action." }, 400);
  } catch (err) {
    console.error("password-reset error", err);
    return json({ ok: false, message: "Something went wrong. Please try again." }, 500);
  }
});
