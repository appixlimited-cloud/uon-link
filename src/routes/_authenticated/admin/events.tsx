import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { formatShortDate } from "@/lib/format";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/events")({
  component: AdminEventsPage,
});

function AdminEventsPage() {
  const qc = useQueryClient();
  const { data } = useQuery({
    queryKey: ["admin", "events"],
    queryFn: async () => (await supabase.from("events").select("*, event_tickets(price, is_enabled), registrations(count)").order("date", { ascending: false })).data ?? [],
  });

  async function del(id: string) {
    if (!confirm("Delete this event?")) return;
    const { error } = await supabase.from("events").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Deleted");
    qc.invalidateQueries({ queryKey: ["admin", "events"] });
  }
  async function togglePublish(id: string, cur: boolean) {
    await supabase.from("events").update({ is_published: !cur }).eq("id", id);
    qc.invalidateQueries({ queryKey: ["admin", "events"] });
  }

  return (
    <div className="max-w-6xl space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">All Events</h1>
        <Link to="/admin/create-event"><Button>+ New Event</Button></Link>
      </div>
      <div className="rounded-lg border border-border bg-card overflow-x-auto">
        {!data?.length ? <p className="p-8 text-center text-muted-foreground">No events yet.</p> : (
          <table className="w-full text-sm">
            <thead className="bg-secondary text-left">
              <tr><th className="p-3">Poster</th><th className="p-3">Title</th><th className="p-3">Date</th><th className="p-3">Category</th><th className="p-3">Regs</th><th className="p-3">Status</th><th className="p-3 text-right">Actions</th></tr>
            </thead>
            <tbody>
              {data.map((e: any) => (
                <tr key={e.id} className="border-t border-border">
                  <td className="p-3">{e.poster_url ? <img src={e.poster_url} alt="" className="h-10 w-16 object-cover rounded" /> : <div className="h-10 w-16 rounded bg-muted" />}</td>
                  <td className="p-3 font-medium">{e.title}</td>
                  <td className="p-3 text-muted-foreground">{formatShortDate(e.date)}</td>
                  <td className="p-3">{e.category}</td>
                  <td className="p-3">{e.registrations?.[0]?.count ?? 0}</td>
                  <td className="p-3"><span className={`rounded px-2 py-0.5 text-xs font-semibold ${e.is_published ? "bg-success text-success-foreground" : "bg-warning text-warning-foreground"}`}>{e.is_published ? "Live" : "Draft"}</span></td>
                  <td className="p-3 text-right space-x-1">
                    <Link to="/admin/events/$id" params={{ id: e.id }}><Button size="sm" variant="outline">Edit</Button></Link>
                    <Button size="sm" variant="outline" onClick={() => togglePublish(e.id, e.is_published)}>{e.is_published ? "Unpublish" : "Publish"}</Button>
                    <Button size="sm" variant="destructive" onClick={() => del(e.id)}>Delete</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
