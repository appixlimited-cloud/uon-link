import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useRef } from "react";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/clubs")({
  component: AdminClubs,
});

function AdminClubs() {
  const qc = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const { data } = useQuery({ queryKey: ["admin", "clubs"], queryFn: async () => (await supabase.from("clubs").select("*").order("name")).data ?? [] });
  const [form, setForm] = useState({ name: "", category: "", description: "", contact_email: "", social_link: "" });
  const [logo, setLogo] = useState<File | null>(null);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    let logo_url: string | null = null;
    if (logo) {
      try {
        const ext = logo.name.split(".").pop();
        const path = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}.${ext}`;
        const { error } = await supabase.storage.from("club-logos").upload(path, logo);
        if (error) throw error;
        logo_url = supabase.storage.from("club-logos").getPublicUrl(path).data.publicUrl;
      } catch (e: any) { return toast.error("Logo upload failed: " + e.message); }
    }
    const { error } = await supabase.from("clubs").insert({ ...form, logo_url });
    if (error) return toast.error(error.message);
    toast.success("Created");
    setForm({ name: "", category: "", description: "", contact_email: "", social_link: "" });
    setLogo(null); if (fileRef.current) fileRef.current.value = "";
    qc.invalidateQueries({ queryKey: ["admin", "clubs"] });
  }
  async function del(id: string) {
    if (!confirm("Delete?")) return;
    await supabase.from("clubs").delete().eq("id", id);
    qc.invalidateQueries({ queryKey: ["admin", "clubs"] });
  }

  return (
    <div className="max-w-4xl space-y-6">
      <h1 className="text-2xl font-bold">Clubs</h1>
      <form onSubmit={create} className="rounded-lg border border-border bg-card p-6 space-y-3">
        <h2 className="font-semibold">New club</h2>
        <div className="grid gap-3 md:grid-cols-2">
          <div><Label>Name</Label><Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
          <div><Label>Category</Label><Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} /></div>
          <div><Label>Contact Email</Label><Input type="email" value={form.contact_email} onChange={(e) => setForm({ ...form, contact_email: e.target.value })} /></div>
          <div><Label>Social Link</Label><Input value={form.social_link} onChange={(e) => setForm({ ...form, social_link: e.target.value })} /></div>
          <div className="md:col-span-2"><Label>Description</Label><Textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
          <div className="md:col-span-2">
            <Label>Logo (optional)</Label>
            <input ref={fileRef} type="file" accept="image/*" onChange={(e) => setLogo(e.target.files?.[0] || null)} className="text-sm" />
          </div>
        </div>
        <Button type="submit">Create</Button>
      </form>

      <div className="rounded-lg border border-border bg-card overflow-x-auto">
        {!data?.length ? <p className="p-8 text-center text-muted-foreground">No clubs yet.</p> : (
          <table className="w-full text-sm">
            <thead className="bg-secondary text-left"><tr><th className="p-3">Logo</th><th className="p-3">Name</th><th className="p-3">Category</th><th className="p-3"></th></tr></thead>
            <tbody>{data.map((c) => (
              <tr key={c.id} className="border-t border-border">
                <td className="p-3">{c.logo_url ? <img src={c.logo_url} alt="" className="h-8 w-8 rounded-full object-cover" /> : <div className="h-8 w-8 rounded-full bg-muted" />}</td>
                <td className="p-3 font-medium">{c.name}</td><td className="p-3">{c.category}</td>
                <td className="p-3 text-right"><Button size="sm" variant="destructive" onClick={() => del(c.id)}>Delete</Button></td>
              </tr>
            ))}</tbody>
          </table>
        )}
      </div>
    </div>
  );
}
