import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { formatShortDate } from "@/lib/format";
import { toCsv, downloadCsv } from "@/lib/csv";

export const Route = createFileRoute("/_authenticated/admin/registrations")({
  component: AdminRegs,
});

function AdminRegs() {
  const { data } = useQuery({
    queryKey: ["admin", "regs"],
    refetchInterval: 10000,
    queryFn: async () => {
      const { data: events } = await supabase.from("events").select("*, registrations(*)").order("date", { ascending: false });
      return events ?? [];
    },
  });


  function exportFor(event: any) {
    const rows = (event.registrations || []).map((r: any) => ({
      name: r.student_name, email: r.email, registration_number: r.registration_number || "",
      faculty: r.faculty || "", year: r.year_of_study || "", ticket_tier: r.ticket_tier || "",
      registered_at: formatShortDate(r.created_at),
    }));
    downloadCsv(`${event.slug}-registrations.csv`, toCsv(rows));
  }

  return (
    <div className="max-w-6xl space-y-6">
      <h1 className="text-2xl font-bold">Registrations</h1>
      {!data?.length ? <p className="text-muted-foreground">No events yet.</p> : data.map((ev: any) => (
        <section key={ev.id} className="rounded-lg border border-border bg-card overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-border">
            <div>
              <h2 className="font-semibold">{ev.title}</h2>
              <p className="text-xs text-muted-foreground">{formatShortDate(ev.date)} · {ev.registrations?.length || 0} registration{(ev.registrations?.length || 0) === 1 ? "" : "s"}</p>
            </div>
            <Button size="sm" variant="outline" onClick={() => exportFor(ev)} disabled={!ev.registrations?.length}>Export CSV</Button>
          </div>
          {!ev.registrations?.length ? <p className="p-6 text-center text-sm text-muted-foreground">No registrations yet.</p> : (
            <table className="w-full text-sm">
              <thead className="bg-secondary text-left"><tr><th className="p-3">Name</th><th className="p-3">Email</th><th className="p-3">Reg. Number</th><th className="p-3">Faculty</th><th className="p-3">Ticket</th></tr></thead>
              <tbody>{ev.registrations.map((r: any) => (
                <tr key={r.id} className="border-t border-border">
                  <td className="p-3">{r.student_name}</td><td className="p-3">{r.email}</td>
                  <td className="p-3">{r.registration_number || "—"}</td><td className="p-3">{r.faculty || "—"}</td>
                  <td className="p-3"><span className="rounded bg-accent px-2 py-0.5 text-xs">{r.ticket_tier}</span></td>
                </tr>
              ))}</tbody>
            </table>
          )}
        </section>
      ))}
    </div>
  );
}
