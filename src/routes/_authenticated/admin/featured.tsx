import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/featured")({
  component: AdminFeatured,
});

function AdminFeatured() {
  const qc = useQueryClient();
  const { data } = useQuery({
    queryKey: ["admin", "events", "all-published"],
    queryFn: async () => (await supabase.from("events").select("*").eq("is_published", true).order("date")).data ?? [],
  });

  async function toggle(id: string, cur: boolean) {
    await supabase.from("events").update({ is_featured: !cur }).eq("id", id);
    qc.invalidateQueries({ queryKey: ["admin", "events", "all-published"] });
    toast.success("Updated");
  }

  const featuredCount = (data ?? []).filter((e) => e.is_featured).length;

  return (
    <div className="max-w-3xl space-y-4">
      <h1 className="text-2xl font-bold">Featured Content</h1>
      <p className="text-sm text-muted-foreground">Mark up to 5 events as featured to highlight them on the homepage. Currently featured: <strong>{featuredCount}</strong></p>
      <div className="rounded-lg border border-border bg-card divide-y divide-border">
        {!data?.length ? <p className="p-8 text-center text-muted-foreground">No published events yet.</p> :
          data.map((e) => (
            <div key={e.id} className="flex items-center justify-between p-4">
              <div><p className="font-medium">{e.title}</p><p className="text-xs text-muted-foreground">{e.category} · {e.date}</p></div>
              <Switch checked={e.is_featured} onCheckedChange={() => toggle(e.id, e.is_featured)} disabled={!e.is_featured && featuredCount >= 5} />
            </div>
          ))
        }
      </div>
    </div>
  );
}
