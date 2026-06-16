import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useRef } from "react";
import { Upload } from "lucide-react";
import { PageShell } from "@/components/layout/page-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { formatShortDate } from "@/lib/format";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/profile")({
  head: () => ({ meta: [{ title: "My Profile — UoN Link" }] }),
  component: ProfilePage,
});

function ProfilePage() {
  const { user } = Route.useRouteContext();
  const qc = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const [editing, setEditing] = useState(false);
  const [uploading, setUploading] = useState(false);

  const profile = useQuery({
    queryKey: ["profile", user.id],
    queryFn: async () => (await supabase.from("student_profiles").select("*").eq("user_id", user.id).maybeSingle()).data,
  });

  const myRegs = useQuery({
    queryKey: ["myRegs", user.id],
    queryFn: async () => (await supabase.from("registrations").select("*, events(*)").eq("user_id", user.id)).data ?? [],
  });

  const [form, setForm] = useState<any>({});
  function startEdit() { setForm(profile.data ?? {}); setEditing(true); }

  async function save() {
    const { error } = await supabase.from("student_profiles").update({
      full_name: form.full_name, registration_number: form.registration_number,
      faculty: form.faculty, year_of_study: form.year_of_study, phone: form.phone,
    }).eq("user_id", user.id);
    if (error) return toast.error(error.message);
    toast.success("Profile updated");
    setEditing(false);
    qc.invalidateQueries({ queryKey: ["profile", user.id] });
  }

  async function uploadAvatar(file: File) {
    if (file.size > 5 * 1024 * 1024) return toast.error("Max file size is 5MB");
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) return toast.error("JPG, PNG, or WEBP only");
    setUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `${user.id}/avatar-${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from("profile-pictures").upload(path, file, { upsert: true });
      if (error) throw error;
      const { data } = supabase.storage.from("profile-pictures").getPublicUrl(path);
      await supabase.from("student_profiles").update({ avatar_url: data.publicUrl }).eq("user_id", user.id);
      qc.invalidateQueries({ queryKey: ["profile", user.id] });
      toast.success("Avatar updated");
    } catch (e: any) { toast.error(e.message ?? "Upload failed"); }
    finally { setUploading(false); }
  }

  const p = profile.data;
  const initials = (p?.full_name || user.email || "U").split(" ").map((s: string) => s[0]).slice(0, 2).join("").toUpperCase();

  return (
    <PageShell>
      <div className="mx-auto max-w-5xl px-4 py-10">
        <div className="grid gap-8 md:grid-cols-3">
          <aside className="md:col-span-1 space-y-4">
            <div className="flex flex-col items-center text-center">
              {p?.avatar_url ? (
                <img src={p.avatar_url} alt="" className="h-28 w-28 rounded-full object-cover" />
              ) : (
                <div className="grid h-28 w-28 place-items-center rounded-full bg-primary text-primary-foreground text-3xl font-bold">{initials}</div>
              )}
              <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={(e) => e.target.files?.[0] && uploadAvatar(e.target.files[0])} />
              <Button size="sm" variant="outline" className="mt-3" onClick={() => fileRef.current?.click()} disabled={uploading}><Upload className="h-3 w-3 mr-1.5" />{uploading ? "Uploading..." : "Change photo"}</Button>
              <h2 className="mt-4 text-lg font-semibold">{p?.full_name}</h2>
              {p?.registration_number && <p className="text-xs text-muted-foreground">{p.registration_number}</p>}
              {!editing && <Button size="sm" className="mt-3" onClick={startEdit}>Edit Profile</Button>}
            </div>
          </aside>
          <div className="md:col-span-2 space-y-6">
            {editing ? (
              <div className="rounded-lg border border-border bg-card p-6 space-y-4">
                <h3 className="font-semibold">Edit profile</h3>
                <div><Label>Full Name</Label><Input value={form.full_name ?? ""} onChange={(e) => setForm({ ...form, full_name: e.target.value })} /></div>
                <div><Label>Registration Number</Label><Input value={form.registration_number ?? ""} onChange={(e) => setForm({ ...form, registration_number: e.target.value })} /></div>
                <div><Label>Faculty</Label><Input value={form.faculty ?? ""} onChange={(e) => setForm({ ...form, faculty: e.target.value })} /></div>
                <div><Label>Year of Study</Label><Input value={form.year_of_study ?? ""} onChange={(e) => setForm({ ...form, year_of_study: e.target.value })} /></div>
                <div><Label>Phone</Label><Input value={form.phone ?? ""} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
                <div className="flex gap-2"><Button onClick={save}>Save</Button><Button variant="outline" onClick={() => setEditing(false)}>Cancel</Button></div>
              </div>
            ) : (
              <div className="rounded-lg border border-border bg-card p-6">
                <div className="grid gap-3 text-sm sm:grid-cols-2">
                  <div><span className="text-muted-foreground">Faculty</span><div className="font-medium">{p?.faculty || "—"}</div></div>
                  <div><span className="text-muted-foreground">Year of Study</span><div className="font-medium">{p?.year_of_study || "—"}</div></div>
                  <div><span className="text-muted-foreground">Email</span><div className="font-medium">{user.email}</div></div>
                  <div><span className="text-muted-foreground">Phone</span><div className="font-medium">{p?.phone || "—"}</div></div>
                </div>
                {(p?.interests?.length ?? 0) > 0 && (
                  <div className="mt-4">
                    <span className="text-muted-foreground text-sm">Interests</span>
                    <div className="mt-1 flex flex-wrap gap-1.5">{(p?.interests ?? []).map((i: string) => <span key={i} className="rounded-full bg-accent px-2.5 py-1 text-xs text-accent-foreground">{i}</span>)}</div>
                  </div>
                )}
              </div>
            )}
            <div className="rounded-lg border border-border bg-card p-6">
              <h3 className="font-semibold mb-3">My Registered Events</h3>
              {!myRegs.data?.length ? <p className="text-sm text-muted-foreground">No registrations yet.</p> : (
                <ul className="divide-y divide-border">
                  {myRegs.data.map((r: any) => (
                    <li key={r.id} className="py-3">
                      <Link to="/events/$slug" params={{ slug: r.events.slug }} className="font-medium hover:text-primary">{r.events.title}</Link>
                      <p className="text-xs text-muted-foreground">{formatShortDate(r.events.date)} · Ticket: {r.ticket_tier}</p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
