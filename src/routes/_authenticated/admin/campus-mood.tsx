import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/campus-mood")({
  head: () => ({ meta: [{ title: "Campus Mood — Admin" }] }),
  component: CampusMoodAdmin,
});

type Mood = {
  id: string;
  message: string;
  emoji: string;
  start_date: string | null;
  end_date: string | null;
  is_active: boolean;
};

function CampusMoodAdmin() {
  const qc = useQueryClient();
  const list = useQuery({
    queryKey: ["admin-moods"],
    queryFn: async () => (await supabase.from("campus_mood").select("*").order("created_at", { ascending: false })).data as Mood[] | null,
  });

  const [form, setForm] = useState({ message: "", emoji: "✨", start_date: "", end_date: "", is_active: false });

  async function create() {
    if (!form.message.trim()) return toast.error("Message is required");
    const { error } = await supabase.from("campus_mood").insert({
      message: form.message.trim(),
      emoji: form.emoji.trim() || "✨",
      start_date: form.start_date || null,
      end_date: form.end_date || null,
      is_active: form.is_active,
    });
    if (error) return toast.error(error.message);
    toast.success("Mood created");
    setForm({ message: "", emoji: "✨", start_date: "", end_date: "", is_active: false });
    qc.invalidateQueries({ queryKey: ["admin-moods"] });
    qc.invalidateQueries({ queryKey: ["campus-mood"] });
  }

  async function update(m: Mood, patch: Partial<Mood>) {
    const { error } = await supabase.from("campus_mood").update(patch).eq("id", m.id);
    if (error) return toast.error(error.message);
    qc.invalidateQueries({ queryKey: ["admin-moods"] });
    qc.invalidateQueries({ queryKey: ["campus-mood"] });
  }

  async function remove(id: string) {
    const { error } = await supabase.from("campus_mood").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Deleted");
    qc.invalidateQueries({ queryKey: ["admin-moods"] });
    qc.invalidateQueries({ queryKey: ["campus-mood"] });
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <header><h1 className="text-2xl font-bold">Campus Mood</h1><p className="text-sm text-muted-foreground">Only the active mood within today's date range is shown to users.</p></header>

      <section className="rounded-lg border border-border bg-card p-6 space-y-3">
        <h2 className="font-semibold">Create new mood</h2>
        <div className="grid gap-3 sm:grid-cols-[1fr_120px]">
          <div><Label>Message</Label><Input value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder="Mid-sem grind" /></div>
          <div><Label>Emoji</Label><Input value={form.emoji} onChange={(e) => setForm({ ...form, emoji: e.target.value })} /></div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div><Label>Start date</Label><Input type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} /></div>
          <div><Label>End date</Label><Input type="date" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} /></div>
        </div>
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 text-sm"><Switch checked={form.is_active} onCheckedChange={(v) => setForm({ ...form, is_active: v })} /> Active</label>
          <Button onClick={create}>Create</Button>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="font-semibold">All moods</h2>
        {!list.data?.length ? (
          <p className="text-sm text-muted-foreground">None yet.</p>
        ) : (
          <ul className="divide-y divide-border rounded-lg border border-border bg-card">
            {list.data.map((m) => (
              <li key={m.id} className="flex items-center justify-between gap-3 p-4">
                <div className="min-w-0 flex-1">
                  <p className="font-medium truncate">{m.emoji} {m.message}</p>
                  <p className="text-xs text-muted-foreground">{m.start_date ?? "anytime"} → {m.end_date ?? "no end"}</p>
                </div>
                <label className="flex items-center gap-2 text-xs"><Switch checked={m.is_active} onCheckedChange={(v) => update(m, { is_active: v })} /> Active</label>
                <Button size="icon" variant="ghost" onClick={() => remove(m.id)} aria-label="Delete"><Trash2 className="h-4 w-4" /></Button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
