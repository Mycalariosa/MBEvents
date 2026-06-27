/**
 * Seed demo accounts for MBEvents.
 *
 * Preferred: set SUPABASE_SERVICE_ROLE_KEY in .env (Settings → API → service_role).
 * Fallback: uses anon key + signUp (emails must be unconfirmed/disabled in Auth settings).
 *
 * Usage: node scripts/seed-demo-users.mjs
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = resolve(__dirname, '../.env');

function loadEnv() {
  if (!existsSync(envPath)) return;
  for (const line of readFileSync(envPath, 'utf8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim();
    if (!process.env[key]) process.env[key] = value;
  }
}

loadEnv();

const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const anonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !anonKey) {
  console.error('Missing EXPO_PUBLIC_SUPABASE_URL or EXPO_PUBLIC_SUPABASE_ANON_KEY in .env');
  process.exit(1);
}

const DEMO_USERS = [
  {
    email: 'admin@mbevents.dev',
    password: 'admin123',
    fullName: 'Demo Admin',
    username: 'admin',
    phone: '09170000001',
    role: 'admin',
  },
  {
    email: 'customer1@mbevents.dev',
    password: 'Customer123',
    fullName: 'Demo Customer One',
    username: 'customer1',
    phone: '09171234567',
    role: 'customer',
  },
  {
    email: 'customer2@mbevents.dev',
    password: 'Customer123',
    fullName: 'Demo Customer Two',
    username: 'customer2',
    phone: '09181234567',
    role: 'customer',
  },
];

async function createWithServiceRole(user) {
  const admin = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data, error } = await admin.auth.admin.createUser({
    email: user.email,
    password: user.password,
    email_confirm: true,
    user_metadata: {
      full_name: user.fullName,
      username: user.username,
      phone: user.phone,
    },
  });

  if (error) {
    if (error.message?.includes('already been registered')) {
      console.log(`  ↷ ${user.username} already exists`);
      return 'exists';
    }
    throw error;
  }

  if (user.role === 'admin') {
    const { error: roleError } = await admin
      .from('profiles')
      .update({ role: 'admin' })
      .eq('id', data.user.id);
    if (roleError) throw roleError;
  }

  console.log(`  ✓ ${user.username} created`);
  return 'created';
}

async function createWithAnonSignup(user) {
  const client = createClient(url, anonKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data, error } = await client.auth.signUp({
    email: user.email,
    password: user.password,
    options: {
      data: {
        full_name: user.fullName,
        username: user.username,
        phone: user.phone,
      },
    },
  });

  if (error) {
    if (error.message?.includes('already registered')) {
      console.log(`  ↷ ${user.username} already exists`);
      return 'exists';
    }
    throw error;
  }

  if (user.role === 'admin' && data.user?.id && serviceKey) {
    await createWithServiceRole({ ...user, email: user.email });
  }

  console.log(`  ✓ ${user.username} created (anon signup)`);
  return 'created';
}

async function main() {
  console.log('Seeding MBEvents demo users...\n');

  const useServiceRole = Boolean(serviceKey);
  if (!useServiceRole) {
    console.log(
      'Tip: add SUPABASE_SERVICE_ROLE_KEY to .env to auto-set admin role.\n' +
        'Without it, run supabase/migrations/005_demo_users.sql in the SQL Editor instead.\n'
    );
  }

  for (const user of DEMO_USERS) {
    try {
      if (useServiceRole) {
        await createWithServiceRole(user);
      } else {
        await createWithAnonSignup(user);
      }
    } catch (err) {
      console.error(`  ✗ ${user.username}: ${err.message ?? err}`);
    }
  }

  console.log('\n--- Demo login credentials ---');
  console.log('Admin:     username admin      / password admin123');
  console.log('Customer1: username customer1  / password Customer123');
  console.log('Customer2: username customer2  / password Customer123');
  console.log('\nYou can also log in with the @mbevents.dev emails.');
}

main();
