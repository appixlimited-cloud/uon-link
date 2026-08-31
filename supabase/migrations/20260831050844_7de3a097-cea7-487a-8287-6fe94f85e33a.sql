-- 1. Remove blanket anon access to tickets; expose a narrow verification RPC instead
DROP POLICY IF EXISTS "Anyone can verify tickets" ON public.tickets;

CREATE OR REPLACE FUNCTION public.verify_ticket(_ticket_code text)
RETURNS TABLE (
  ticket_code text,
  ticket_tier text,
  status public.ticket_status,
  seat_number text,
  checked_in_at timestamptz,
  student_name text,
  event_title text,
  event_date date,
  event_time time,
  event_venue text,
  event_category text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT t.ticket_code, t.ticket_tier, t.status, t.seat_number, t.checked_in_at,
         r.student_name, e.title, e.date, e.time, e.venue, e.category
  FROM public.tickets t
  LEFT JOIN public.registrations r ON r.id = t.registration_id
  LEFT JOIN public.events e ON e.id = t.event_id
  WHERE _ticket_code IS NOT NULL
    AND length(_ticket_code) >= 16
    AND t.ticket_code = _ticket_code
  LIMIT 1
$$;

REVOKE ALL ON FUNCTION public.verify_ticket(text) FROM public;
GRANT EXECUTE ON FUNCTION public.verify_ticket(text) TO anon, authenticated;

-- 2. Drop unused is_private column so it cannot imply unenforced privacy
ALTER TABLE public.student_profiles DROP COLUMN IF EXISTS is_private;

-- 3. Revoke EXECUTE on SECURITY DEFINER trigger functions from API roles
REVOKE ALL ON FUNCTION public.auto_issue_ticket() FROM public, anon, authenticated;
REVOKE ALL ON FUNCTION public.handle_new_user() FROM public, anon, authenticated;
REVOKE ALL ON FUNCTION public.notify_admin_on_registration() FROM public, anon, authenticated;
REVOKE ALL ON FUNCTION public.tg_set_updated_at() FROM public, anon, authenticated;
REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;