import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/spotlight")({
  component: AdminSpotlight,
});

function AdminSpotlight() {
  const qc = useQueryClient();
  const { data } = useQuery({ queryKey: ["admin", "spotlights"], queryFn: async () => (await supabase.from("spotlights").select("*").order("created_at", { ascending: false })).data ?? [] });
  const [form, setForm] = useState({ name: "", faculty_or_club: "", headline: "", story: "", publish_date: "", photo_url: "" });
  const [file, setFile] = useState<File | null>(null);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    let photo_url = form.photo_url || null;
    if (file) {
      const ext = file.name.split(".").pop();
      const path = `spotlights/${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from("club-logos").upload(path, file);
      if (error) return toast.error(error.message);
      photo_url = supabase.storage.from("club-logos").getPublicUrl(path).data.publicUrl;
    }
    const { error } = await supabase.from("spotlights").insert({ ...form, photo_url, publish_date: form.publish_date || null, is_active: true });
    if (error) return toast.error(error.message);
    toast.success("Created");
    setForm({ name: "", faculty_or_club: "", headline: "", story: "", publish_date: "", photo_url: "" });
    setFile(null);
    qc.invalidateQueries({ queryKey: ["admin", "spotlights"] });
  }
  async function toggle(id: string, cur: boolean) { await supabase.from("spotlights").update({ is_active: !cur }).eq("id", id); qc.invalidateQueries({ queryKey: ["admin", "spotlights"] }); }
  async function del(id: string) { if (!confirm("Delete?")) return; await supabase.from("spotlights").delete().eq("id", id); qc.invalidateQueries({ queryKey: ["admin", "spotlights"] }); }

  return (
    <div className="max-w-4xl space-y-6">
      <h1 className="text-2xl font-bold">Student Spotlight</h1>
      <form onSubmit={create} className="rounded-lg border border-border bg-card p-6 space-y-3">
        <h2 className="font-semibold">New spotlight</h2>
        <div className="grid gap-3 md:grid-cols-2">
          <div><Label>Name</Label><Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
          <div><Label>Faculty / Club</Label><Input value={form.faculty_or_club} onChange={(e) => setForm({ ...form, faculty_or_club: e.target.value })} /></div>
          <div className="md:col-span-2"><Label>Headline</Label><Input value={form.headline} onChange={(e) => setForm({ ...form, headline: e.target.value })} /></div>
          <div className="md:col-span-2"><Label>Story</Label><Textarea rows={4} value={form.story} onChange={(e) => setForm({ ...form, story: e.target.value })} /></div>
          <div><Label>Publish date</Label><Input type="date" value={form.publish_date} onChange={(e) => setForm({ ...form, publish_date: e.target.value })} /></div>
          <div><Label>Photo (optional)</Label><input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} className="text-sm" /></div>
        </div>
        <Button type="submit">Create</Button>
      </form>
      <div className="rounded-lg border border-border bg-card divide-y divide-border">
        {!data?.length ? <p className="p-8 text-center text-muted-foreground">No spotlights yet.</p> :
          data.map((s) => (
            <div key={s.id} className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                {s.photo_url ? <img src={s.photo_url} alt="" className="h-10 w-10 rounded-full object-cover" /> : <div className="h-10 w-10 rounded-full bg-muted" />}
                <div><p className="font-medium">{s.name}</p><p className="text-xs text-muted-foreground">{s.faculty_or_club}</p></div>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={s.is_active} onCheckedChange={() => toggle(s.id, s.is_active)} />
                <Button size="sm" variant="destructive" onClick={() => del(s.id)}>Delete</Button>
              </div>
            </div>
          ))
        }
      </div>
    </div>
  );
}
