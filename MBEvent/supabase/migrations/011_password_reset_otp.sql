-- Self-managed password-reset OTP (replaces Supabase magic-link email).
-- Mirrors the PHP password_reset_* flow: generate a numeric code, store it with
-- an expiry + attempt/rate limits, then verify it and let the server set the
-- new password via the Admin API inside an Edge Function.
--
-- SECURITY: this table is only ever read/written by the Edge Function using the
-- service_role key. RLS is enabled with NO policies, so anon/authenticated
-- clients cannot read the codes.

CREATE TABLE IF NOT EXISTS password_reset_otps (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email        TEXT NOT NULL,
  code         TEXT NOT NULL,
  expires_at   TIMESTAMPTZ NOT NULL,
  consumed_at  TIMESTAMPTZ,
  attempts     INT NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_password_reset_otps_email
  ON password_reset_otps (lower(email));

CREATE INDEX IF NOT EXISTS idx_password_reset_otps_created_at
  ON password_reset_otps (created_at);

ALTER TABLE password_reset_otps ENABLE ROW LEVEL SECURITY;
-- No policies on purpose: only the service_role (Edge Function) bypasses RLS.
