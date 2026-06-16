
-- Public read for all three buckets (via signed/public urls)
CREATE POLICY "Public read event-posters" ON storage.objects FOR SELECT TO anon, authenticated USING (bucket_id = 'event-posters');
CREATE POLICY "Public read club-logos"   ON storage.objects FOR SELECT TO anon, authenticated USING (bucket_id = 'club-logos');
CREATE POLICY "Public read profile-pictures" ON storage.objects FOR SELECT TO anon, authenticated USING (bucket_id = 'profile-pictures');

-- Admin writes for event-posters and club-logos
CREATE POLICY "Admins write event-posters" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'event-posters' AND public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins update event-posters" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'event-posters' AND public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins delete event-posters" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'event-posters' AND public.has_role(auth.uid(),'admin'));

CREATE POLICY "Admins write club-logos" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'club-logos' AND public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins update club-logos" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'club-logos' AND public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins delete club-logos" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'club-logos' AND public.has_role(auth.uid(),'admin'));

-- Profile pictures: users manage their own (first folder = user id)
CREATE POLICY "Users upload own profile pic" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'profile-pictures' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users update own profile pic" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'profile-pictures' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users delete own profile pic" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'profile-pictures' AND auth.uid()::text = (storage.foldername(name))[1]);
