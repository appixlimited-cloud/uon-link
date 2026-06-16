import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { EVENT_CATEGORIES } from "@/lib/categories";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/events/$id")({
  component: EditEventPage,
});

type Tier = { id?: string; tier_name: string; price: string; description: string; quantity: string; is_enabled: boolean };

function EditEventPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["admin", "event", id],
    queryFn: async () => (await supabase.from("events").select("*, event_tickets(*)").eq("id", id).single()).data,
  });
  const [form, setForm] = useState<any>({});
  const [tiers, setTiers] = useState<Tier[]>([]);
  const [posterUrl, setPosterUrl] = useState("");

  useEffect(() => {
    if (!data) return;
    setForm(data);
    setPosterUrl(data.poster_url || "");
    const existing: Record<string, any> = {};
    (data.event_tickets || []).forEach((t: any) => { existing[t.tier_name] = t; });
    setTiers(["Regular", "VIP", "VVIP"].map((n) => {
      const t = existing[n];
      return t ? { id: t.id, tier_name: n, price: String(t.price), description: t.description || "", quantity: t.quantity_available ? String(t.quantity_available) : "", is_enabled: t.is_enabled } : { tier_name: n, price: "", description: "", quantity: "", is_enabled: false };
    }));
  }, [data]);

  async function save() {
    await supabase.from("events").update({
      title: form.title, description: form.description, category: form.category,
      venue: form.venue, date: form.date, time: form.time || null,
      is_free: form.is_free, is_published: form.is_published, is_featured: form.is_featured,
      poster_url: posterUrl || null,
    }).eq("id", id);
    // upsert tiers
    for (const t of tiers) {
      if (t.id) {
        await supabase.from("event_tickets").update({
          price: Number(t.price || 0), description: t.description || null,
          quantity_available: t.quantity ? Number(t.quantity) : null, is_enabled: t.is_enabled,
        }).eq("id", t.id);
      } else if (t.is_enabled) {
        await supabase.from("event_tickets").insert({
          event_id: id, tier_name: t.tier_name, price: Number(t.price || 0),
          description: t.description || null, quantity_available: t.quantity ? Number(t.quantity) : null, is_enabled: true,
        });
      }
    }
    toast.success("Saved");
    qc.invalidateQueries({ queryKey: ["admin", "event", id] });
    qc.invalidateQueries({ queryKey: ["admin", "events"] });
  }

  if (isLoading || !data) return <p>Loading...</p>;

  return (
    <div className="max-w-3xl space-y-6">
      <h1 className="text-2xl font-bold">Edit Event</h1>
      <div className="rounded-lg border border-border bg-card p-6 space-y-4">
        <div><Label>Title</Label><Input value={form.title || ""} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
        <div className="grid gap-4 md:grid-cols-2">
          <div><Label>Category</Label>
            <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{EVENT_CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div><Label>Venue</Label><Input value={form.venue || ""} onChange={(e) => setForm({ ...form, venue: e.target.value })} /></div>
          <div><Label>Date</Label><Input type="date" value={form.date || ""} onChange={(e) => setForm({ ...form, date: e.target.value })} /></div>
          <div><Label>Time</Label><Input type="time" value={form.time || ""} onChange={(e) => setForm({ ...form, time: e.target.value })} /></div>
        </div>
        <div><Label>Description</Label><Textarea rows={4} value={form.description || ""} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
        <div><Label>Poster URL</Label><Input value={posterUrl} onChange={(e) => setPosterUrl(e.target.value)} /></div>
        {posterUrl && <img src={posterUrl} alt="" className="max-h-60 rounded border border-border" />}
        <div className="flex items-center justify-between"><span className="text-sm">Free event</span><Switch checked={form.is_free ?? true} onCheckedChange={(v) => setForm({ ...form, is_free: v })} /></div>
        <div className="flex items-center justify-between"><span className="text-sm">Published</span><Switch checked={form.is_published ?? false} onCheckedChange={(v) => setForm({ ...form, is_published: v })} /></div>
        <div className="flex items-center justify-between"><span className="text-sm">Featured</span><Switch checked={form.is_featured ?? false} onCheckedChange={(v) => setForm({ ...form, is_featured: v })} /></div>
      </div>

      {!form.is_free && (
        <div className="rounded-lg border border-border bg-card p-6 space-y-4">
          <h2 className="font-semibold">Ticket Tiers</h2>
          {tiers.map((t, idx) => (
            <div key={t.tier_name} className="rounded border border-border p-4">
              <div className="flex items-center justify-between"><h3 className="font-semibold">{t.tier_name}</h3>
                <Switch checked={t.is_enabled} onCheckedChange={(v) => { const c = [...tiers]; c[idx].is_enabled = v; setTiers(c); }} />
              </div>
              {t.is_enabled && (
                <div className="mt-3 grid gap-3 md:grid-cols-3">
                  <div><Label>Price</Label><Input type="number" value={t.price} onChange={(e) => { const c = [...tiers]; c[idx].price = e.target.value; setTiers(c); }} /></div>
                  <div><Label>Quantity</Label><Input type="number" value={t.quantity} onChange={(e) => { const c = [...tiers]; c[idx].quantity = e.target.value; setTiers(c); }} /></div>
                  <div className="md:col-span-3"><Label>Description</Label><Input value={t.description} onChange={(e) => { const c = [...tiers]; c[idx].description = e.target.value; setTiers(c); }} /></div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-2">
        <Button onClick={save}>Save</Button>
        <Button variant="outline" onClick={() => navigate({ to: "/admin/events" })}>Back</Button>
      </div>
    </div>
  );
}
