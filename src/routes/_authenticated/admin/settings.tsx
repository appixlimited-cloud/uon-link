import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/settings")({
  component: AdminSettings,
});

function AdminSettings() {
  const qc = useQueryClient();
  const { data } = useQuery({ queryKey: ["app_config"], queryFn: async () => (await supabase.from("app_config").select("*").eq("id", 1).maybeSingle()).data });
  const [enabled, setEnabled] = useState(true);
  const [message, setMessage] = useState("");
  useEffect(() => { if (data) { setEnabled(data.app_enabled); setMessage(data.maintenance_message || ""); } }, [data]);

  async function save() {
    const { error } = await supabase.from("app_config").update({ app_enabled: enabled, maintenance_message: message, updated_at: new Date().toISOString() }).eq("id", 1);
    if (error) return toast.error(error.message);
    toast.success("Saved");
    qc.invalidateQueries({ queryKey: ["app_config"] });
  }

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold">Admin Settings</h1>
      <div className="rounded-lg border border-border bg-card p-6 space-y-4">
        <h2 className="font-semibold">Kill Switch</h2>
        <div className="flex items-center justify-between"><span className="text-sm">App Enabled</span><Switch checked={enabled} onCheckedChange={setEnabled} /></div>
        <div>
          <Label>Maintenance message</Label>
          <Textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={3} />
        </div>
        <Button onClick={save}>Save</Button>
      </div>
      <div className="rounded-lg border border-border bg-card p-6">
        <h2 className="font-semibold">Contact</h2>
        <p className="text-sm text-muted-foreground mt-2">Support email: <strong>appixlimited@gmail.com</strong></p>
        <p className="text-sm text-muted-foreground">Address: University of Nairobi Main Campus, Nairobi, Kenya</p>
      </div>
    </div>
  );
}
