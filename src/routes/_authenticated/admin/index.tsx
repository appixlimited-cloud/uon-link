import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { formatShortDate } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/admin/")({
  component: AdminDashboard,
});

function AdminDashboard() {
  const qc = useQueryClient();

  const stats = useQuery({
    queryKey: ["admin", "stats"],
    queryFn: async () => {
      const since = new Date(Date.now() - 7 * 86400000).toISOString();
      const [students, events, regs, ops] = await Promise.all([
        supabase.from("student_profiles").select("user_id", { count: "exact", head: true }),
        supabase.from("events").select("id", { count: "exact", head: true }),
        supabase.from("registrations").select("id", { count: "exact", head: true }).gte("created_at", since),
        supabase.from("opportunities").select("id", { count: "exact", head: true }).eq("is_published", true),
      ]);
      return { students: students.count ?? 0, events: events.count ?? 0, regs: regs.count ?? 0, ops: ops.count ?? 0 };
    },
  });
  const recent = useQuery({
    queryKey: ["admin", "recent-events"],
    queryFn: async () => {
      const { data } = await supabase.from("events").select("*, registrations(count)").order("created_at", { ascending: false }).limit(10);
      return data ?? [];
    },
  });

  useEffect(() => {
    const channel = supabase
      .channel("admin-dashboard-regs")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "registrations" }, () => {
        qc.invalidateQueries({ queryKey: ["admin", "stats"] });
        qc.invalidateQueries({ queryKey: ["admin", "recent-events"] });
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [qc]);

  const cards = [
    { label: "Total Students", value: stats.data?.students ?? 0, color: "text-primary" },
    { label: "Events Posted", value: stats.data?.events ?? 0, color: "text-cat-tech" },
    { label: "Registrations (7d)", value: stats.data?.regs ?? 0, color: "text-success" },
    { label: "Open Opportunities", value: stats.data?.ops ?? 0, color: "text-cat-entertainment" },
  ];

  return (
    <div className="space-y-6 max-w-6xl">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className="rounded-lg border border-border bg-card p-5">
            <p className="text-sm text-muted-foreground">{c.label}</p>
            <p className={`mt-2 text-3xl font-bold ${c.color}`}>{c.value}</p>
          </div>
        ))}
      </div>
      <section className="rounded-lg border border-border bg-card overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="font-semibold">Recent Events</h2>
          <Link to="/admin/create-event"><Button size="sm">+ New Event</Button></Link>
        </div>
        {!recent.data?.length ? (
          <p className="p-8 text-center text-sm text-muted-foreground">No events yet. Create your first one.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-secondary text-left">
              <tr><th className="p-3">Event</th><th className="p-3">Date</th><th className="p-3">Regs</th><th className="p-3">Status</th><th className="p-3 text-right">Actions</th></tr>
            </thead>
            <tbody>
              {recent.data.map((e: any) => (
                <tr key={e.id} className="border-t border-border">
                  <td className="p-3 font-medium">{e.title}</td>
                  <td className="p-3 text-muted-foreground">{formatShortDate(e.date)}</td>
                  <td className="p-3">{e.registrations?.[0]?.count ?? 0}</td>
                  <td className="p-3"><span className={`rounded px-2 py-0.5 text-xs font-semibold ${e.is_published ? "bg-success text-success-foreground" : "bg-warning text-warning-foreground"}`}>{e.is_published ? "Live" : "Draft"}</span></td>
                  <td className="p-3 text-right space-x-1"><Link to="/admin/events/$id" params={{ id: e.id }}><Button size="sm" variant="outline">Edit</Button></Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}
