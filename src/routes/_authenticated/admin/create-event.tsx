import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useRef } from "react";
import { Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { EVENT_CATEGORIES } from "@/lib/categories";
import { slugify } from "@/lib/format";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/create-event")({
  component: CreateEventPage,
});

type Tier = { tier_name: "Regular" | "VIP" | "VVIP"; price: string; description: string; quantity: string; enabled: boolean };
const DEFAULT_TIERS: Tier[] = [
  { tier_name: "Regular", price: "", description: "", quantity: "", enabled: false },
  { tier_name: "VIP", price: "", description: "", quantity: "", enabled: false },
  { tier_name: "VVIP", price: "", description: "", quantity: "", enabled: false },
];

function CreateEventPage() {
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ title: "", category: "Academic", date: "", time: "", venue: "", description: "", is_featured: false, is_published: true });
  const [isFree, setIsFree] = useState(true);
  const [tiers, setTiers] = useState<Tier[]>(DEFAULT_TIERS);
  const [posterUrl, setPosterUrl] = useState("");
  const [posterFile, setPosterFile] = useState<File | null>(null);
  const [posterPreview, setPosterPreview] = useState<string>("");

  function pickFile(f: File) {
    if (f.size > 5 * 1024 * 1024) return toast.error("Max 5MB");
    if (!["image/jpeg", "image/png", "image/webp"].includes(f.type)) return toast.error("JPG, PNG, or WEBP only");
    setPosterFile(f);
    setPosterPreview(URL.createObjectURL(f));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title || !form.date) return toast.error("Title and date are required");
    if (!isFree && !tiers.some((t) => t.enabled)) return toast.error("Enable at least one ticket tier or mark as free");
    setSubmitting(true);
    try {
      let poster = posterUrl || null;
      if (posterFile) {
        const ext = posterFile.name.split(".").pop();
        const path = `events/${Date.now()}-${Math.random().toString(36).slice(2, 7)}.${ext}`;
        const { error: upErr } = await supabase.storage.from("event-posters").upload(path, posterFile);
        if (upErr) throw upErr;
        poster = supabase.storage.from("event-posters").getPublicUrl(path).data.publicUrl;
      }
      const slug = slugify(form.title);
      const { data: ev, error } = await supabase.from("events").insert({
        title: form.title, slug, description: form.description, category: form.category,
        venue: form.venue, date: form.date, time: form.time || null,
        is_free: isFree, poster_url: poster,
        is_featured: form.is_featured, is_published: form.is_published,
      }).select().single();
      if (error) throw error;

      if (!isFree) {
        const rows = tiers.filter((t) => t.enabled).map((t) => ({
          event_id: ev.id, tier_name: t.tier_name, price: Number(t.price || 0),
          description: t.description || null, quantity_available: t.quantity ? Number(t.quantity) : null, is_enabled: true,
        }));
        if (rows.length) await supabase.from("event_tickets").insert(rows);
      }
      toast.success("Event created");
      navigate({ to: "/admin/events" });
    } catch (e: any) { toast.error(e.message ?? "Failed"); }
    finally { setSubmitting(false); }
  }

  return (
    <form onSubmit={submit} className="max-w-3xl space-y-6">
      <h1 className="text-2xl font-bold">Create Event</h1>
      <div className="rounded-lg border border-border bg-card p-6 space-y-4">
        <div><Label>Title</Label><Input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <Label>Category</Label>
            <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{EVENT_CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div><Label>Venue</Label><Input value={form.venue} onChange={(e) => setForm({ ...form, venue: e.target.value })} /></div>
          <div><Label>Date</Label><Input required type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></div>
          <div><Label>Time</Label><Input type="time" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} /></div>
        </div>
        <div><Label>Description</Label><Textarea rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
        <div className="flex items-center justify-between"><span className="text-sm">Feature on homepage</span><Switch checked={form.is_featured} onCheckedChange={(v) => setForm({ ...form, is_featured: v })} /></div>
        <div className="flex items-center justify-between"><span className="text-sm">Publish immediately</span><Switch checked={form.is_published} onCheckedChange={(v) => setForm({ ...form, is_published: v })} /></div>
      </div>

      <div className="rounded-lg border border-border bg-card p-6 space-y-4">
        <h2 className="font-semibold">Poster Image</h2>
        <Tabs defaultValue="upload">
          <TabsList><TabsTrigger value="upload">Upload Image</TabsTrigger><TabsTrigger value="url">Paste URL</TabsTrigger></TabsList>
          <TabsContent value="upload">
            <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={(e) => e.target.files?.[0] && pickFile(e.target.files[0])} />
            {posterPreview ? (
              <div className="relative rounded-lg border border-border overflow-hidden">
                <img src={posterPreview} alt="" className="w-full max-h-80 object-contain bg-secondary" />
                <button type="button" onClick={() => { setPosterFile(null); setPosterPreview(""); }} className="absolute top-2 right-2 grid h-8 w-8 place-items-center rounded-full bg-background border"><X className="h-4 w-4" /></button>
                {posterFile && <p className="p-2 text-xs text-muted-foreground">{posterFile.name} · {(posterFile.size / 1024).toFixed(0)} KB</p>}
              </div>
            ) : (
              <button type="button" onClick={() => fileRef.current?.click()} className="flex flex-col items-center justify-center gap-2 w-full rounded-lg border-2 border-dashed border-border p-12 hover:border-primary">
                <Upload className="h-6 w-6 text-muted-foreground" />
                <p className="text-sm font-medium">Click to upload or drag and drop</p>
                <p className="text-xs text-muted-foreground">JPG, PNG, WEBP · Max 5MB</p>
              </button>
            )}
          </TabsContent>
          <TabsContent value="url">
            <Input value={posterUrl} onChange={(e) => setPosterUrl(e.target.value)} placeholder="https://..." />
            {posterUrl && <img src={posterUrl} alt="" className="mt-3 max-h-60 rounded border border-border" />}
          </TabsContent>
        </Tabs>
      </div>

      <div className="rounded-lg border border-border bg-card p-6 space-y-4">
        <div className="flex items-center justify-between"><h2 className="font-semibold">Ticket Pricing</h2>
          <label className="flex items-center gap-2 text-sm"><Switch checked={isFree} onCheckedChange={setIsFree} /> Free event</label>
        </div>
        {!isFree && tiers.map((t, idx) => (
          <div key={t.tier_name} className="rounded border border-border p-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">{t.tier_name} Ticket</h3>
              <Switch checked={t.enabled} onCheckedChange={(v) => { const c = [...tiers]; c[idx].enabled = v; setTiers(c); }} />
            </div>
            {t.enabled && (
              <div className="mt-3 grid gap-3 md:grid-cols-3">
                <div><Label>Price (KSh)</Label><Input type="number" min="0" required value={t.price} onChange={(e) => { const c = [...tiers]; c[idx].price = e.target.value; setTiers(c); }} /></div>
                <div><Label>Quantity (optional)</Label><Input type="number" min="0" value={t.quantity} onChange={(e) => { const c = [...tiers]; c[idx].quantity = e.target.value; setTiers(c); }} /></div>
                <div className="md:col-span-3"><Label>Description (optional)</Label><Input value={t.description} onChange={(e) => { const c = [...tiers]; c[idx].description = e.target.value; setTiers(c); }} placeholder="e.g. Reserved seating" /></div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <Button type="submit" disabled={submitting}>{submitting ? "Creating..." : "Create Event"}</Button>
        <Button type="button" variant="outline" onClick={() => navigate({ to: "/admin" })}>Cancel</Button>
      </div>
    </form>
  );
}
