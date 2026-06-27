-- Storage bucket for service images
-- Files live in Supabase Storage; database `images` columns store paths only (e.g. venues/1234567890.jpg)

INSERT INTO storage.buckets (id, name, public)
VALUES ('service-images', 'service-images', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public read service images"
ON storage.objects FOR SELECT
USING (bucket_id = 'service-images');

CREATE POLICY "Admins upload service images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'service-images'
  AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Admins update service images"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'service-images'
  AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Admins delete service images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'service-images'
  AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
