import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { NOTICE_CATEGORIES } from "@/lib/categories";
import { toast } from "sonner";
import { formatShortDate } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/admin/notices")({
  component: AdminNotices,
});

function AdminNotices() {
  const qc = useQueryClient();
  const { data } = useQuery({ queryKey: ["admin", "notices"], queryFn: async () => (await supabase.from("notices").select("*").order("created_at", { ascending: false })).data ?? [] });
  const [form, setForm] = useState({ title: "", category: "General", description: "", contact: "", expiry_date: "" });

  async function create(e: React.FormEvent) {
    e.preventDefault();
    const { error } = await supabase.from("notices").insert({ ...form, expiry_date: form.expiry_date || null });
    if (error) return toast.error(error.message);
    toast.success("Created");
    setForm({ title: "", category: "General", description: "", contact: "", expiry_date: "" });
    qc.invalidateQueries({ queryKey: ["admin", "notices"] });
  }
  async function del(id: string) {
    if (!confirm("Delete?")) return;
    await supabase.from("notices").delete().eq("id", id);
    qc.invalidateQueries({ queryKey: ["admin", "notices"] });
  }

  return (
    <div className="max-w-4xl space-y-6">
      <h1 className="text-2xl font-bold">Notices</h1>
      <form onSubmit={create} className="rounded-lg border border-border bg-card p-6 space-y-3">
        <h2 className="font-semibold">New notice</h2>
        <div className="grid gap-3 md:grid-cols-2">
          <div><Label>Title</Label><Input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
          <div><Label>Category</Label>
            <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{NOTICE_CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div><Label>Contact</Label><Input value={form.contact} onChange={(e) => setForm({ ...form, contact: e.target.value })} /></div>
          <div><Label>Expiry Date</Label><Input type="date" value={form.expiry_date} onChange={(e) => setForm({ ...form, expiry_date: e.target.value })} /></div>
          <div className="md:col-span-2"><Label>Description</Label><Textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
        </div>
        <Button type="submit">Create</Button>
      </form>

      <div className="rounded-lg border border-border bg-card overflow-x-auto">
        {!data?.length ? <p className="p-8 text-center text-muted-foreground">No notices yet.</p> : (
          <table className="w-full text-sm">
            <thead className="bg-secondary text-left"><tr><th className="p-3">Title</th><th className="p-3">Category</th><th className="p-3">Posted</th><th className="p-3"></th></tr></thead>
            <tbody>{data.map((n) => (
              <tr key={n.id} className="border-t border-border">
                <td className="p-3 font-medium">{n.title}</td><td className="p-3">{n.category}</td><td className="p-3">{formatShortDate(n.created_at)}</td>
                <td className="p-3 text-right"><Button size="sm" variant="destructive" onClick={() => del(n.id)}>Delete</Button></td>
              </tr>
            ))}</tbody>
          </table>
        )}
      </div>
    </div>
  );
}
