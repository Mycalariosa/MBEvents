-- Create bucket for customer profile avatars with safe RLS policies
INSERT INTO storage.buckets (id, name, public)
VALUES ('profile-avatars', 'profile-avatars', true)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    public = EXCLUDED.public;

DO $$
BEGIN
  DROP POLICY IF EXISTS "Profile avatar public read" ON storage.objects;
  DROP POLICY IF EXISTS "Customers upload profile avatars" ON storage.objects;
  DROP POLICY IF EXISTS "Customers update own profile avatars" ON storage.objects;
  DROP POLICY IF EXISTS "Customers delete own profile avatars" ON storage.objects;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND policyname = 'Profile avatar public read'
  ) THEN
    CREATE POLICY "Profile avatar public read" ON storage.objects
      FOR SELECT
      USING (bucket_id = 'profile-avatars');
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND policyname = 'Customers upload profile avatars'
  ) THEN
    CREATE POLICY "Customers upload profile avatars" ON storage.objects
      FOR INSERT
      TO authenticated
      WITH CHECK (
        bucket_id = 'profile-avatars'
        AND (storage.foldername(name))[1] = 'avatars'
        AND (storage.foldername(name))[2] = auth.uid()::text
        AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'customer')
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND policyname = 'Customers update own profile avatars'
  ) THEN
    CREATE POLICY "Customers update own profile avatars" ON storage.objects
      FOR UPDATE
      TO authenticated
      USING (
        bucket_id = 'profile-avatars'
        AND (storage.foldername(name))[1] = 'avatars'
        AND (storage.foldername(name))[2] = auth.uid()::text
        AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'customer')
      )
      WITH CHECK (
        bucket_id = 'profile-avatars'
        AND (storage.foldername(name))[1] = 'avatars'
        AND (storage.foldername(name))[2] = auth.uid()::text
        AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'customer')
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND policyname = 'Customers delete own profile avatars'
  ) THEN
    CREATE POLICY "Customers delete own profile avatars" ON storage.objects
      FOR DELETE
      TO authenticated
      USING (
        bucket_id = 'profile-avatars'
        AND (storage.foldername(name))[1] = 'avatars'
        AND (storage.foldername(name))[2] = auth.uid()::text
        AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'customer')
      );
  END IF;
END
$$;
