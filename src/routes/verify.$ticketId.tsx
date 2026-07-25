import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle2, XCircle, AlertTriangle, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { formatEventDate } from "@/lib/format";

export const Route = createFileRoute("/verify/$ticketId")({
  head: () => ({ meta: [{ title: "Verify Ticket — UoN Link" }, { name: "robots", content: "noindex" }] }),
  component: VerifyPage,
});

type TicketRow = {
  id: string;
  ticket_code: string;
  ticket_tier: string;
  status: "active" | "used" | "cancelled" | "expired";
  seat_number: string | null;
  checked_in_at: string | null;
  events: { title: string; date: string; time: string | null; venue: string | null; category: string } | null;
  student_name?: string | null;
};

function VerifyPage() {
  const { ticketId } = Route.useParams();
  const { data, isLoading } = useQuery({
    queryKey: ["verify", ticketId],
    queryFn: async () => {
      const { data } = await (supabase as any)
        .from("tickets")
        .select("id, ticket_code, ticket_tier, status, seat_number, checked_in_at, events(title, date, time, venue, category), registrations(student_name)")
        .eq("ticket_code", ticketId)
        .maybeSingle();
      if (!data) return null;
      return { ...data, student_name: data.registrations?.student_name ?? null } as TicketRow;
    },
    staleTime: 30_000,
  });

  const eventDate = data?.events ? new Date(data.events.date + "T23:59:59") : null;
  const expired = eventDate ? eventDate < new Date() && data?.status === "active" : false;

  const state = !data
    ? "invalid"
    : data.status === "used"
    ? "used"
    : data.status === "cancelled"
    ? "invalid"
    : expired || data.status === "expired"
    ? "expired"
    : "valid";

  const config = {
    valid: { icon: CheckCircle2, bg: "bg-green-50", ring: "ring-green-500", text: "text-green-700", title: "Valid Ticket", sub: "This ticket is authentic and has not been used." },
    used: { icon: AlertTriangle, bg: "bg-orange-50", ring: "ring-orange-500", text: "text-orange-700", title: "Already Used", sub: "This ticket has already been checked in." },
    invalid: { icon: XCircle, bg: "bg-red-50", ring: "ring-red-500", text: "text-red-700", title: "Invalid Ticket", sub: "We can't find or verify this ticket." },
    expired: { icon: Clock, bg: "bg-slate-100", ring: "ring-slate-400", text: "text-slate-700", title: "Expired Ticket", sub: "This event has already passed." },
  }[state];
  const Icon = config.icon;

  return (
    <div className="min-h-screen bg-slate-50 grid place-items-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className={`rounded-3xl bg-white p-8 shadow-lg ring-2 ${config.ring}`}>
          {isLoading ? (
            <div className="text-center text-muted-foreground py-16">Verifying ticket…</div>
          ) : (
            <>
              <div className={`mx-auto grid h-20 w-20 place-items-center rounded-full ${config.bg}`}>
                <Icon className={`h-12 w-12 ${config.text}`} />
              </div>
              <h1 className={`mt-5 text-center text-2xl font-bold ${config.text}`}>{config.title}</h1>
              <p className="mt-1 text-center text-sm text-muted-foreground">{config.sub}</p>

              {data && (
                <dl className="mt-6 space-y-3 rounded-2xl bg-slate-50 p-4 text-sm">
                  {data.events && (
                    <>
                      <Row label="Event" value={data.events.title} />
                      <Row label="Date" value={formatEventDate(data.events.date)} />
                      {data.events.time && <Row label="Time" value={data.events.time} />}
                      {data.events.venue && <Row label="Venue" value={data.events.venue} />}
                    </>
                  )}
                  {data.student_name && <Row label="Attendee" value={data.student_name} />}
                  <Row label="Tier" value={data.ticket_tier} />
                  {data.seat_number && <Row label="Seat" value={data.seat_number} />}
                  <Row label="Ticket ID" value={<span className="font-mono text-[11px]">{data.ticket_code.slice(0, 12)}…</span>} />
                  {data.checked_in_at && <Row label="Checked in" value={new Date(data.checked_in_at).toLocaleString()} />}
                </dl>
              )}
            </>
          )}
          <div className="mt-6 text-center">
            <Link to="/" className="text-sm text-primary hover:underline">← Go to UoN Link</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-right">{value}</span>
    </div>
  );
}
