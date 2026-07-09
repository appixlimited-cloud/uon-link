
ALTER TABLE public.registrations
  ADD COLUMN IF NOT EXISTS checked_in boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS check_in_time timestamptz;

ALTER TABLE public.registrations REPLICA IDENTITY FULL;
ALTER TABLE public.admin_notifications REPLICA IDENTITY FULL;

DO $$ BEGIN
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.registrations;
  EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.admin_notifications;
  EXCEPTION WHEN duplicate_object THEN NULL; END;
END $$;

CREATE OR REPLACE FUNCTION public.notify_admin_on_registration()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  ev_title text;
BEGIN
  SELECT title INTO ev_title FROM public.events WHERE id = NEW.event_id;
  INSERT INTO public.admin_notifications (type, message)
  VALUES ('registration', 'New registration — ' || COALESCE(NEW.student_name, 'A student') || ' registered for ' || COALESCE(ev_title, 'an event'));
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_notify_admin_on_registration ON public.registrations;
CREATE TRIGGER trg_notify_admin_on_registration
AFTER INSERT ON public.registrations
FOR EACH ROW EXECUTE FUNCTION public.notify_admin_on_registration();
