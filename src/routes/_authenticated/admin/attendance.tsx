import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { RefreshCw, Users, CheckCircle2, Clock, Ban } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { formatShortDate } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/admin/attendance")({
  head: () => ({
    meta: [
      { title: "Live Attendance — UoN Link Admin" },
      { name: "description", content: "Real-time check-in counts by event and ticket status for UoN Link organisers." },
    ],
  }),
  component: AttendancePage,
});

type TicketRow = {
  id: string;
  event_id: string;
  status: string;
  checked_in_at: string | null;
  ticket_tier: string;
  events: { title: string; date: string; venue: string | null } | null;
};

function AttendancePage() {
  const [q, setQ] = useState("");

  const tickets = useQuery({
    queryKey: ["admin", "attendance"],
    refetchInterval: 5000,
    refetchOnWindowFocus: true,
    queryFn: async (): Promise<TicketRow[]> => {
      const { data, error } = await supabase
        .from("tickets")
        .select("id, event_id, status, checked_in_at, ticket_tier, events(title, date, venue)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as any;
    },
  });

  const rows = tickets.data ?? [];

  const byEvent = useMemo(() => {
    const map = new Map<string, { title: string; date: string; venue: string | null; total: number; used: number; active: number; cancelled: number; expired: number; last: string | null }>();
    for (const t of rows) {
      const key = t.event_id;
      const cur = map.get(key) ?? {
        title: t.events?.title ?? "Untitled event",
        date: t.events?.date ?? "",
        venue: t.events?.venue ?? null,
        total: 0, used: 0, active: 0, cancelled: 0, expired: 0, last: null as string | null,
      };
      cur.total++;
      if (t.status === "used") cur.used++;
      else if (t.status === "active") cur.active++;
      else if (t.status === "cancelled") cur.cancelled++;
      else if (t.status === "expired") cur.expired++;
      if (t.checked_in_at && (!cur.last || t.checked_in_at > cur.last)) cur.last = t.checked_in_at;
      map.set(key, cur);
    }
    const list = [...map.entries()].map(([id, v]) => ({ id, ...v }));
    const term = q.trim().toLowerCase();
    return list
      .filter((e) => !term || e.title.toLowerCase().includes(term))
      .sort((a, b) => (a.date < b.date ? 1 : -1));
  }, [rows, q]);

  const totals = useMemo(() => ({
    total: rows.length,
    used: rows.filter((r) => r.status === "used").length,
    active: rows.filter((r) => r.status === "active").length,
    cancelled: rows.filter((r) => r.status === "cancelled" || r.status === "expired").length,
  }), [rows]);

  const cards = [
    { label: "Tickets issued", value: totals.total, icon: Users, color: "text-primary" },
    { label: "Checked in", value: totals.used, icon: CheckCircle2, color: "text-success" },
    { label: "Awaiting check-in", value: totals.active, icon: Clock, color: "text-warning" },
    { label: "Cancelled / expired", value: totals.cancelled, icon: Ban, color: "text-destructive" },
  ];

  return (
    <div className="max-w-6xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Live Attendance</h1>
          <p className="text-sm text-muted-foreground">
            Check-ins refresh automatically every 5 seconds.
            {tickets.isFetching && <span className="ml-2 inline-flex items-center gap-1 text-primary"><RefreshCw className="h-3 w-3 animate-spin" />updating</span>}
          </p>
        </div>
        <div className="flex gap-2">
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search event…" className="w-52" />
          <Button variant="outline" size="icon" onClick={() => tickets.refetch()} aria-label="Refresh"><RefreshCw className="h-4 w-4" /></Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">{c.label}</p>
              <c.icon className={`h-4 w-4 ${c.color}`} />
            </div>
            <p className={`mt-2 text-3xl font-bold ${c.color}`}>{c.value}</p>
          </div>
        ))}
      </div>

      <section className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="border-b border-border p-4">
          <h2 className="font-semibold">By event</h2>
        </div>
        {tickets.isLoading ? (
          <p className="p-8 text-center text-sm text-muted-foreground">Loading attendance…</p>
        ) : !byEvent.length ? (
          <p className="p-8 text-center text-sm text-muted-foreground">No tickets issued yet.</p>
        ) : (
          <ul className="divide-y divide-border">
            {byEvent.map((e) => {
              const pct = e.total ? Math.round((e.used / e.total) * 100) : 0;
              return (
                <li key={e.id} className="p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-medium">{e.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {e.date ? formatShortDate(e.date) : "—"}{e.venue ? ` · ${e.venue}` : ""}
                        {e.last ? ` · last check-in ${new Date(e.last).toLocaleTimeString()}` : ""}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-success">{e.used}<span className="text-muted-foreground font-normal">/{e.total}</span></p>
                      <p className="text-xs text-muted-foreground">{pct}% checked in</p>
                    </div>
                  </div>
                  <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-secondary">
                    <div className="h-full rounded-full bg-success transition-all" style={{ width: `${pct}%` }} />
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2 text-xs">
                    <Badge label="Checked in" value={e.used} className="bg-success/10 text-success" />
                    <Badge label="Pending" value={e.active} className="bg-warning/15 text-warning-foreground" />
                    {e.cancelled > 0 && <Badge label="Cancelled" value={e.cancelled} className="bg-destructive/10 text-destructive" />}
                    {e.expired > 0 && <Badge label="Expired" value={e.expired} className="bg-muted text-muted-foreground" />}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}

function Badge({ label, value, className }: { label: string; value: number; className: string }) {
  return <span className={`rounded-full px-2.5 py-1 font-medium ${className}`}>{label}: {value}</span>;
}
