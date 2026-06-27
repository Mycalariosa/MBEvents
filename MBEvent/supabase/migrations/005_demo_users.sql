-- Demo accounts for MBEvents (safe to re-run; skips existing emails)
-- Run in Supabase SQL Editor after 004_fix_auth_and_security.sql

CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$
DECLARE
  v_user_id UUID;
  v_encrypted_pw TEXT;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'admin@mbevents.dev') THEN
    v_user_id := gen_random_uuid();
    v_encrypted_pw := crypt('admin123', gen_salt('bf'));

    INSERT INTO auth.users (
      id, instance_id, aud, role, email, encrypted_password,
      email_confirmed_at, recovery_sent_at, last_sign_in_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
      confirmation_token, email_change, email_change_token_new, recovery_token
    ) VALUES (
      v_user_id,
      '00000000-0000-0000-0000-000000000000',
      'authenticated', 'authenticated',
      'admin@mbevents.dev', v_encrypted_pw,
      NOW(), NOW(), NOW(),
      '{"provider":"email","providers":["email"]}',
      '{"full_name":"Demo Admin","username":"admin","phone":"09170000001"}'::jsonb,
      NOW(), NOW(),
      '', '', '', ''
    );

    INSERT INTO auth.identities (
      id, user_id, identity_data, provider, provider_id,
      last_sign_in_at, created_at, updated_at
    ) VALUES (
      v_user_id, v_user_id,
      format('{"sub":"%s","email":"admin@mbevents.dev"}', v_user_id)::jsonb,
      'email', v_user_id::text,
      NOW(), NOW(), NOW()
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'customer1@mbevents.dev') THEN
    v_user_id := gen_random_uuid();
    v_encrypted_pw := crypt('Customer123', gen_salt('bf'));

    INSERT INTO auth.users (
      id, instance_id, aud, role, email, encrypted_password,
      email_confirmed_at, recovery_sent_at, last_sign_in_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
      confirmation_token, email_change, email_change_token_new, recovery_token
    ) VALUES (
      v_user_id,
      '00000000-0000-0000-0000-000000000000',
      'authenticated', 'authenticated',
      'customer1@mbevents.dev', v_encrypted_pw,
      NOW(), NOW(), NOW(),
      '{"provider":"email","providers":["email"]}',
      '{"full_name":"Demo Customer One","username":"customer1","phone":"09171234567"}'::jsonb,
      NOW(), NOW(),
      '', '', '', ''
    );

    INSERT INTO auth.identities (
      id, user_id, identity_data, provider, provider_id,
      last_sign_in_at, created_at, updated_at
    ) VALUES (
      v_user_id, v_user_id,
      format('{"sub":"%s","email":"customer1@mbevents.dev"}', v_user_id)::jsonb,
      'email', v_user_id::text,
      NOW(), NOW(), NOW()
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'customer2@mbevents.dev') THEN
    v_user_id := gen_random_uuid();
    v_encrypted_pw := crypt('Customer123', gen_salt('bf'));

    INSERT INTO auth.users (
      id, instance_id, aud, role, email, encrypted_password,
      email_confirmed_at, recovery_sent_at, last_sign_in_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
      confirmation_token, email_change, email_change_token_new, recovery_token
    ) VALUES (
      v_user_id,
      '00000000-0000-0000-0000-000000000000',
      'authenticated', 'authenticated',
      'customer2@mbevents.dev', v_encrypted_pw,
      NOW(), NOW(), NOW(),
      '{"provider":"email","providers":["email"]}',
      '{"full_name":"Demo Customer Two","username":"customer2","phone":"09181234567"}'::jsonb,
      NOW(), NOW(),
      '', '', '', ''
    );

    INSERT INTO auth.identities (
      id, user_id, identity_data, provider, provider_id,
      last_sign_in_at, created_at, updated_at
    ) VALUES (
      v_user_id, v_user_id,
      format('{"sub":"%s","email":"customer2@mbevents.dev"}', v_user_id)::jsonb,
      'email', v_user_id::text,
      NOW(), NOW(), NOW()
    );
  END IF;
END $$;

-- handle_new_user trigger creates profiles; promote admin account
UPDATE profiles SET role = 'admin' WHERE username = 'admin';
