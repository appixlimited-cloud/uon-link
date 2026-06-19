
-- ============ campus_mood ============
CREATE TABLE public.campus_mood (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  message text NOT NULL,
  emoji text NOT NULL DEFAULT '✨',
  start_date date,
  end_date date,
  is_active boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.campus_mood TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.campus_mood TO authenticated;
GRANT ALL ON public.campus_mood TO service_role;

ALTER TABLE public.campus_mood ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read active mood"
  ON public.campus_mood FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

CREATE POLICY "Admins read all mood"
  ON public.campus_mood FOR SELECT
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins write mood"
  ON public.campus_mood FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER trg_campus_mood_updated
  BEFORE UPDATE ON public.campus_mood
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

INSERT INTO public.campus_mood (message, emoji, is_active) VALUES
  ('Exam season — stay strong', '🔥', false),
  ('Fresher''s week — welcome to UoN', '🎉', false),
  ('Mid-sem grind', '💪', false),
  ('Holiday mode — see you next semester', '🌴', false);

-- ============ student_profiles customization columns ============
ALTER TABLE public.student_profiles
  ADD COLUMN IF NOT EXISTS banner_color text,
  ADD COLUMN IF NOT EXISTS avatar_style text,
  ADD COLUMN IF NOT EXISTS unlocked_frames text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS active_frame text,
  ADD COLUMN IF NOT EXISTS is_private boolean NOT NULL DEFAULT false;

-- Public read so "who's going" works. UI hides names where is_private=true.
GRANT SELECT ON public.student_profiles TO anon;

CREATE POLICY "Public read minimal profile"
  ON public.student_profiles FOR SELECT
  TO anon, authenticated
  USING (true);

-- ============ Realtime for registrations ============
ALTER PUBLICATION supabase_realtime ADD TABLE public.registrations;
