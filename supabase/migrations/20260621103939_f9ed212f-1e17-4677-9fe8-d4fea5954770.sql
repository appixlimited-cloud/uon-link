
-- Allow public read of event poster images via the public object URL
DROP POLICY IF EXISTS "Public read event posters" ON storage.objects;
CREATE POLICY "Public read event posters"
ON storage.objects FOR SELECT
TO anon, authenticated
USING (bucket_id = 'event-posters');
