import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { PageShell } from "@/components/layout/page-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { INTERESTS } from "@/lib/categories";
import { toast } from "sonner";
import { BANNER_GRADIENTS, BANNER_KEYS, AVATAR_STYLES, AVATAR_STYLE_KEYS, FRAME_THRESHOLDS, FRAME_LABEL, FRAME_RING, FrameKey, framesForStreak } from "@/lib/profile-customization";
import { UserAvatar } from "@/components/user-avatar";
import { computeStreak } from "@/lib/streak";
import { Lock } from "lucide-react";

export const Route = createFileRoute("/_authenticated/settings")({
  head: () => ({ meta: [{ title: "Settings — UoN Link" }] }),
  component: SettingsPage,
});

function SettingsPage() {
  const { user } = Route.useRouteContext();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [dark, setDark] = useState(false);
  const [pw, setPw] = useState("");
  const [delConfirm, setDelConfirm] = useState("");
  const [prefs, setPrefs] = useState({ matches: true, reminders: true, digest: false });

  useEffect(() => {
    const stored = typeof window !== "undefined" ? localStorage.getItem("theme") : null;
    const d = stored === "dark";
    setDark(d);
    document.documentElement.classList.toggle("dark", d);
    const p = typeof window !== "undefined" ? localStorage.getItem("notif_prefs") : null;
    if (p) try { setPrefs(JSON.parse(p)); } catch {}
  }, []);

  function toggleDark(v: boolean) {
    setDark(v);
    localStorage.setItem("theme", v ? "dark" : "light");
    document.documentElement.classList.toggle("dark", v);
  }
  function savePrefs(next: typeof prefs) {
    setPrefs(next);
    localStorage.setItem("notif_prefs", JSON.stringify(next));
  }

  const profile = useQuery({
    queryKey: ["profile", user.id],
    queryFn: async () => (await supabase.from("student_profiles").select("*").eq("user_id", user.id).maybeSingle()).data,
  });
  const [interests, setInterests] = useState<string[]>([]);
  useEffect(() => { if (profile.data?.interests) setInterests(profile.data.interests); }, [profile.data]);

  async function saveInterests() {
    const { error } = await supabase.from("student_profiles").update({ interests }).eq("user_id", user.id);
    if (error) return toast.error(error.message);
    toast.success("Interests updated");
    qc.invalidateQueries({ queryKey: ["profile", user.id] });
  }

  async function changePw() {
    if (pw.length < 8) return toast.error("Password must be at least 8 characters");
    const { error } = await supabase.auth.updateUser({ password: pw });
    if (error) return toast.error(error.message);
    setPw("");
    toast.success("Password updated");
  }

  async function deleteAccount() {
    if (delConfirm !== "DELETE") return toast.error("Type DELETE to confirm");
    // delete profile & registrations (cascades via RLS-allowed delete)
    await supabase.from("registrations").delete().eq("user_id", user.id);
    await supabase.from("student_profiles").delete().eq("user_id", user.id);
    // we can't delete the auth user from client; sign out and let admin clean up
    await supabase.auth.signOut();
    toast.success("Your data has been removed");
    navigate({ to: "/", replace: true });
  }

  // Customization
  const streakQuery = useQuery({
    queryKey: ["streak", user.id],
    queryFn: async () => {
      const { data } = await supabase.from("registrations").select("created_at").eq("user_id", user.id);
      return computeStreak((data ?? []).map((r) => r.created_at));
    },
  });
  const streak = streakQuery.data ?? 0;
  const unlocked = framesForStreak(streak);

  async function saveCustomization(patch: Record<string, any>) {
    const { error } = await (supabase.from("student_profiles") as any).update(patch).eq("user_id", user.id);
    if (error) return toast.error(error.message);
    toast.success("Profile updated");
    qc.invalidateQueries({ queryKey: ["profile", user.id] });
  }

  return (
    <PageShell>
      <div className="mx-auto max-w-3xl px-4 py-10 space-y-8">
        <header><h1 className="text-3xl font-bold">Settings</h1></header>

        <section className="rounded-lg border border-border bg-card p-6">
          <h2 className="font-semibold">Appearance</h2>
          <div className="mt-3 flex items-center justify-between">
            <span className="text-sm">Dark mode</span>
            <Switch checked={dark} onCheckedChange={toggleDark} />
          </div>
        </section>

        <section className="rounded-lg border border-border bg-card p-6 space-y-5">
          <div>
            <h2 className="font-semibold">Customize Profile</h2>
            <p className="text-xs text-muted-foreground">Current streak: {streak} day{streak === 1 ? "" : "s"}.</p>
          </div>

          {/* Preview */}
          <div className={`relative overflow-hidden rounded-lg p-6 ${profile.data?.banner_color ? BANNER_GRADIENTS[profile.data.banner_color] : "bg-secondary"}`}>
            <div className="flex items-center gap-3">
              <UserAvatar size="xl" name={profile.data?.full_name} email={user.email} avatarUrl={profile.data?.avatar_url} avatarStyle={profile.data?.avatar_style} activeFrame={profile.data?.active_frame} />
              <div className={profile.data?.banner_color ? "text-white" : ""}>
                <p className="font-bold">{profile.data?.full_name ?? user.email}</p>
                <p className="text-xs opacity-80">Preview</p>
              </div>
            </div>
          </div>

          <div>
            <p className="text-sm font-medium mb-2">Banner color</p>
            <div className="flex flex-wrap gap-2">
              {BANNER_KEYS.map((k) => (
                <button key={k} type="button" onClick={() => saveCustomization({ banner_color: k })} className={`h-10 w-16 rounded-md ${BANNER_GRADIENTS[k]} ${profile.data?.banner_color === k ? "ring-2 ring-primary ring-offset-2 ring-offset-background" : ""}`} aria-label={k} />
              ))}
              <button type="button" onClick={() => saveCustomization({ banner_color: null })} className="h-10 px-3 rounded-md border border-border text-xs">None</button>
            </div>
          </div>

          {!profile.data?.avatar_url && (
            <div>
              <p className="text-sm font-medium mb-2">Avatar style</p>
              <p className="text-xs text-muted-foreground mb-2">Used when you haven't uploaded a profile picture.</p>
              <div className="flex flex-wrap gap-2">
                {AVATAR_STYLE_KEYS.map((k) => (
                  <button key={k} type="button" onClick={() => saveCustomization({ avatar_style: k })} className={`h-12 w-12 rounded-full grid place-items-center text-sm font-bold ${AVATAR_STYLES[k]} ${profile.data?.avatar_style === k ? "ring-2 ring-primary ring-offset-2 ring-offset-background" : ""}`}>{(profile.data?.full_name ?? user.email ?? "U").slice(0, 1).toUpperCase()}</button>
                ))}
              </div>
            </div>
          )}

          <div>
            <p className="text-sm font-medium mb-2">Profile frame</p>
            <div className="flex flex-wrap gap-3">
              <button type="button" onClick={() => saveCustomization({ active_frame: null })} className={`h-14 w-14 rounded-full grid place-items-center bg-secondary text-xs ${!profile.data?.active_frame ? "ring-2 ring-primary ring-offset-2 ring-offset-background" : ""}`}>None</button>
              {(Object.keys(FRAME_THRESHOLDS) as FrameKey[]).map((k) => {
                const isUnlocked = unlocked.includes(k);
                return (
                  <button
                    key={k}
                    type="button"
                    disabled={!isUnlocked}
                    onClick={() => saveCustomization({ active_frame: k })}
                    title={FRAME_LABEL[k]}
                    className={`relative h-14 w-14 rounded-full grid place-items-center bg-secondary text-xs ${FRAME_RING[k]} ${profile.data?.active_frame === k ? "outline outline-2 outline-primary" : ""} ${isUnlocked ? "" : "opacity-50 cursor-not-allowed"}`}
                  >
                    {isUnlocked ? k[0].toUpperCase() : <Lock className="h-4 w-4" />}
                  </button>
                );
              })}
            </div>
            <p className="text-xs text-muted-foreground mt-2">Unlock with daily registration streaks: 7 / 14 / 30 / 60 days.</p>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-border">
            <div>
              <p className="text-sm font-medium">Private profile</p>
              <p className="text-xs text-muted-foreground">Hide your name on "who's going" lists.</p>
            </div>
            <Switch checked={!!profile.data?.is_private} onCheckedChange={(v) => saveCustomization({ is_private: v })} />
          </div>
        </section>

        <section className="rounded-lg border border-border bg-card p-6 space-y-3">
          <h2 className="font-semibold">Notifications</h2>
          <div className="flex items-center justify-between text-sm"><span>New matching events</span><Switch checked={prefs.matches} onCheckedChange={(v) => savePrefs({ ...prefs, matches: v })} /></div>
          <div className="flex items-center justify-between text-sm"><span>Event reminders 24h before</span><Switch checked={prefs.reminders} onCheckedChange={(v) => savePrefs({ ...prefs, reminders: v })} /></div>
          <div className="flex items-center justify-between text-sm"><span>Weekly digest</span><Switch checked={prefs.digest} onCheckedChange={(v) => savePrefs({ ...prefs, digest: v })} /></div>
        </section>

        <section className="rounded-lg border border-border bg-card p-6 space-y-3">
          <h2 className="font-semibold">My Interests</h2>
          <div className="flex flex-wrap gap-2">
            {INTERESTS.map((i) => (
              <button key={i} type="button" onClick={() => setInterests((cur) => cur.includes(i) ? cur.filter((x) => x !== i) : [...cur, i])} className={`rounded-full px-3 py-1.5 text-sm ${interests.includes(i) ? "bg-primary text-primary-foreground" : "bg-secondary hover:bg-accent"}`}>{i}</button>
            ))}
          </div>
          <Button onClick={saveInterests} size="sm">Save interests</Button>
        </section>

        <section className="rounded-lg border border-border bg-card p-6 space-y-3">
          <h2 className="font-semibold">Change Password</h2>
          <div className="flex gap-2"><Input type="password" placeholder="New password" value={pw} onChange={(e) => setPw(e.target.value)} /><Button onClick={changePw}>Update</Button></div>
        </section>

        <section className="rounded-lg border border-destructive bg-destructive/5 p-6 space-y-3">
          <h2 className="font-semibold text-destructive">Danger Zone</h2>
          <p className="text-sm text-muted-foreground">Type DELETE to permanently remove your account data.</p>
          <div className="flex gap-2"><Input placeholder="DELETE" value={delConfirm} onChange={(e) => setDelConfirm(e.target.value)} /><Button variant="destructive" onClick={deleteAccount}>Delete My Account</Button></div>
        </section>
      </div>
    </PageShell>
  );
}
