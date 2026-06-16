import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { OPPORTUNITY_TYPES } from "@/lib/categories";
import { toast } from "sonner";
import { formatShortDate } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/admin/opportunities")({
  component: AdminOpps,
});

function AdminOpps() {
  const qc = useQueryClient();
  const { data } = useQuery({
    queryKey: ["admin", "opps"],
    queryFn: async () => (await supabase.from("opportunities").select("*").order("deadline")).data ?? [],
  });
  const [form, setForm] = useState({ title: "", type: "Internship", organization: "", description: "", eligibility: "", deadline: "", application_link: "" });

  async function create(e: React.FormEvent) {
    e.preventDefault();
    const { error } = await supabase.from("opportunities").insert({ ...form });
    if (error) return toast.error(error.message);
    toast.success("Created");
    setForm({ title: "", type: "Internship", organization: "", description: "", eligibility: "", deadline: "", application_link: "" });
    qc.invalidateQueries({ queryKey: ["admin", "opps"] });
  }
  async function del(id: string) {
    if (!confirm("Delete?")) return;
    await supabase.from("opportunities").delete().eq("id", id);
    qc.invalidateQueries({ queryKey: ["admin", "opps"] });
  }

  return (
    <div className="max-w-5xl space-y-6">
      <h1 className="text-2xl font-bold">Opportunities</h1>
      <form onSubmit={create} className="rounded-lg border border-border bg-card p-6 space-y-3">
        <h2 className="font-semibold">New opportunity</h2>
        <div className="grid gap-3 md:grid-cols-2">
          <div><Label>Title</Label><Input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
          <div><Label>Type</Label>
            <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{OPPORTUNITY_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div><Label>Organization</Label><Input value={form.organization} onChange={(e) => setForm({ ...form, organization: e.target.value })} /></div>
          <div><Label>Deadline</Label><Input required type="date" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} /></div>
          <div className="md:col-span-2"><Label>Application Link</Label><Input value={form.application_link} onChange={(e) => setForm({ ...form, application_link: e.target.value })} /></div>
          <div className="md:col-span-2"><Label>Eligibility</Label><Input value={form.eligibility} onChange={(e) => setForm({ ...form, eligibility: e.target.value })} /></div>
          <div className="md:col-span-2"><Label>Description</Label><Textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
        </div>
        <Button type="submit">Create</Button>
      </form>

      <div className="rounded-lg border border-border bg-card overflow-x-auto">
        {!data?.length ? <p className="p-8 text-center text-muted-foreground">No opportunities yet.</p> : (
          <table className="w-full text-sm">
            <thead className="bg-secondary text-left"><tr><th className="p-3">Title</th><th className="p-3">Type</th><th className="p-3">Deadline</th><th className="p-3"></th></tr></thead>
            <tbody>{data.map((o) => (
              <tr key={o.id} className="border-t border-border">
                <td className="p-3 font-medium">{o.title}</td>
                <td className="p-3">{o.type}</td>
                <td className="p-3">{formatShortDate(o.deadline)}</td>
                <td className="p-3 text-right"><Button size="sm" variant="destructive" onClick={() => del(o.id)}>Delete</Button></td>
              </tr>
            ))}</tbody>
          </table>
        )}
      </div>
    </div>
  );
}
