
DROP POLICY IF EXISTS "Public read minimal profile" ON public.student_profiles;
REVOKE SELECT ON public.student_profiles FROM anon;

ALTER PUBLICATION supabase_realtime DROP TABLE public.registrations;
