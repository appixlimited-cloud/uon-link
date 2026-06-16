import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export const Route = createFileRoute("/_authenticated/admin/analytics")({
  component: AdminAnalytics,
});

function AdminAnalytics() {
  const { data } = useQuery({
    queryKey: ["admin", "analytics"],
    queryFn: async () => {
      const since = new Date(Date.now() - 7 * 86400000).toISOString();
      const closingSoon = new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10);
      const [students, events, regsWeek, ops, allEvents, profiles, allRegs] = await Promise.all([
        supabase.from("student_profiles").select("user_id", { count: "exact", head: true }),
        supabase.from("events").select("id", { count: "exact", head: true }),
        supabase.from("registrations").select("id", { count: "exact", head: true }).gte("created_at", since),
        supabase.from("opportunities").select("id", { count: "exact", head: true }).lte("deadline", closingSoon).gte("deadline", new Date().toISOString().slice(0, 10)),
        supabase.from("events").select("id, title, registrations(count)").order("created_at", { ascending: false }).limit(5),
        supabase.from("student_profiles").select("faculty"),
        supabase.from("registrations").select("event_id, ticket_tier, events(title)"),
      ]);
      const facultyCounts: Record<string, number> = {};
      (profiles.data || []).forEach((p: any) => { if (p.faculty) facultyCounts[p.faculty] = (facultyCounts[p.faculty] || 0) + 1; });
      const topFaculties = Object.entries(facultyCounts).sort((a, b) => b[1] - a[1]).slice(0, 3);
      const tierBreakdown: Record<string, Record<string, number>> = {};
      (allRegs.data || []).forEach((r: any) => {
        const k = r.events?.title || "—";
        tierBreakdown[k] = tierBreakdown[k] || {};
        const t = r.ticket_tier || "Unknown";
        tierBreakdown[k][t] = (tierBreakdown[k][t] || 0) + 1;
      });
      const chart = (allEvents.data || []).map((e: any) => ({ name: e.title.slice(0, 16), regs: e.registrations?.[0]?.count ?? 0 }));
      return { students: students.count, events: events.count, regsWeek: regsWeek.count, ops: ops.count, topFaculties, tierBreakdown, chart };
    },
  });

  if (!data) return <p>Loading...</p>;

  return (
    <div className="max-w-6xl space-y-6">
      <h1 className="text-2xl font-bold">Analytics</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { l: "Students", v: data.students },
          { l: "Events", v: data.events },
          { l: "Regs (7d)", v: data.regsWeek },
          { l: "Opps closing", v: data.ops },
        ].map((c) => (
          <div key={c.l} className="rounded-lg border border-border bg-card p-5"><p className="text-sm text-muted-foreground">{c.l}</p><p className="mt-2 text-3xl font-bold text-primary">{c.v ?? 0}</p></div>
        ))}
      </div>
      <section className="rounded-lg border border-border bg-card p-6">
        <h2 className="font-semibold mb-4">Registrations — Last 5 Events</h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.chart}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="regs" fill="var(--primary)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>
      <section className="grid gap-4 md:grid-cols-2">
        <div className="rounded-lg border border-border bg-card p-6">
          <h2 className="font-semibold mb-3">Top Faculties</h2>
          {data.topFaculties.length === 0 ? <p className="text-sm text-muted-foreground">No data yet.</p> : (
            <ul className="space-y-2 text-sm">{data.topFaculties.map(([f, n]) => <li key={f} className="flex justify-between"><span>{f}</span><span className="font-semibold">{n}</span></li>)}</ul>
          )}
        </div>
        <div className="rounded-lg border border-border bg-card p-6">
          <h2 className="font-semibold mb-3">Ticket Tier Breakdown</h2>
          {Object.keys(data.tierBreakdown).length === 0 ? <p className="text-sm text-muted-foreground">No registrations yet.</p> : (
            <ul className="space-y-3 text-sm">{Object.entries(data.tierBreakdown).map(([title, tiers]) => (
              <li key={title}><p className="font-medium">{title}</p>
                <p className="text-xs text-muted-foreground">{Object.entries(tiers).map(([k, v]) => `${k}: ${v}`).join(" · ")}</p>
              </li>
            ))}</ul>
          )}
        </div>
      </section>
    </div>
  );
}
