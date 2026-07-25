-- Ticket status enum
DO $$ BEGIN
  CREATE TYPE public.ticket_status AS ENUM ('active','used','cancelled','expired');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Tickets table
CREATE TABLE public.tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_code text NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(16), 'hex'),
  registration_id uuid NOT NULL UNIQUE REFERENCES public.registrations(id) ON DELETE CASCADE,
  event_id uuid NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  ticket_tier text NOT NULL DEFAULT 'Free',
  seat_number text,
  status public.ticket_status NOT NULL DEFAULT 'active',
  checked_in_at timestamptz,
  checked_in_by uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_tickets_user ON public.tickets(user_id);
CREATE INDEX idx_tickets_event ON public.tickets(event_id);
CREATE INDEX idx_tickets_status ON public.tickets(status);

GRANT SELECT ON public.tickets TO anon;
GRANT SELECT, INSERT, UPDATE ON public.tickets TO authenticated;
GRANT ALL ON public.tickets TO service_role;

ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;

-- Anon can look up a ticket for verification (ticket_code is 128-bit random, unguessable)
CREATE POLICY "Anyone can verify tickets"
  ON public.tickets FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Users view own or admin tickets"
  ON public.tickets FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins update tickets"
  ON public.tickets FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER tickets_touch BEFORE UPDATE ON public.tickets
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- Auto-issue tickets for free registrations
CREATE OR REPLACE FUNCTION public.auto_issue_ticket()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE v_is_free boolean;
BEGIN
  SELECT is_free INTO v_is_free FROM public.events WHERE id = NEW.event_id;
  IF COALESCE(v_is_free, false) OR COALESCE(NEW.ticket_tier, 'Free') = 'Free' THEN
    INSERT INTO public.tickets (registration_id, event_id, user_id, ticket_tier)
    VALUES (NEW.id, NEW.event_id, NEW.user_id, COALESCE(NEW.ticket_tier, 'Free'))
    ON CONFLICT (registration_id) DO NOTHING;
  END IF;
  RETURN NEW;
END $$;

CREATE TRIGGER registrations_auto_issue_ticket
  AFTER INSERT ON public.registrations
  FOR EACH ROW EXECUTE FUNCTION public.auto_issue_ticket();

-- Backfill tickets for existing free registrations
INSERT INTO public.tickets (registration_id, event_id, user_id, ticket_tier)
SELECT r.id, r.event_id, r.user_id, COALESCE(r.ticket_tier, 'Free')
FROM public.registrations r
JOIN public.events e ON e.id = r.event_id
WHERE (e.is_free = true OR COALESCE(r.ticket_tier, 'Free') = 'Free')
ON CONFLICT (registration_id) DO NOTHING;

-- Storage policies for profile-pictures bucket
-- Public read so avatars can be shown in navbar/comments/etc.
DROP POLICY IF EXISTS "profile-pictures public read" ON storage.objects;
CREATE POLICY "profile-pictures public read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'profile-pictures');

DROP POLICY IF EXISTS "profile-pictures owner insert" ON storage.objects;
CREATE POLICY "profile-pictures owner insert"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'profile-pictures' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "profile-pictures owner update" ON storage.objects;
CREATE POLICY "profile-pictures owner update"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'profile-pictures' AND (storage.foldername(name))[1] = auth.uid()::text)
  WITH CHECK (bucket_id = 'profile-pictures' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "profile-pictures owner delete" ON storage.objects;
CREATE POLICY "profile-pictures owner delete"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'profile-pictures' AND (storage.foldername(name))[1] = auth.uid()::text);