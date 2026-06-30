-- Fix admin INSERT permissions under RLS (safe to run; does NOT delete any data)
--
-- Supabase may warn about "destructive operations" because this uses DROP POLICY.
-- That only removes and recreates security rules — your tables and rows are untouched.
--
-- What this does:
-- 1. Recreates "Admin write *" policies with explicit WITH CHECK (needed for INSERT)
-- 2. Restores public read access for service-images in storage

DO $$
DECLARE t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'event_types','packages','package_inclusions','venues','catering_options',
    'photographers','videographers','makeup_artists','wedding_dresses','groom_suits',
    'bridesmaids_dresses','groomsmen_suits','flower_girl_dresses','ring_bearer_outfits',
    'invitation_templates','decorations','entertainment_options','souvenirs','bridal_cars',
    'cakes','birthday_themes','mascots','clowns','hosts','photo_booths','candy_buffets',
    'giveaways','party_games','balloon_decorations'
  ] LOOP
    EXECUTE format('DROP POLICY IF EXISTS "Admin write %I" ON %I', t, t);
    EXECUTE format(
      'CREATE POLICY "Admin write %I" ON %I FOR ALL USING (is_admin()) WITH CHECK (is_admin())',
      t,
      t
    );
  END LOOP;
END $$;

-- Restore public read for service image objects (removed in 004; needed for direct object access)
DROP POLICY IF EXISTS "Public read service images" ON storage.objects;
CREATE POLICY "Public read service images"
ON storage.objects FOR SELECT
USING (bucket_id = 'service-images');
