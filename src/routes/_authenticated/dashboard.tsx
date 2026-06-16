import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { PageShell } from "@/components/layout/page-shell";
import { EventCard } from "@/components/event-card";
import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { fetchPublishedEvents } from "@/lib/db/queries";
import { formatShortDate } from "@/lib/format";
import { AlertCircle } from "lucide-react";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — UoN Link" }] }),
  component: DashboardPage,
});

function DashboardPage() {
  const { user } = Route.useRouteContext();

  const profile = useQuery({
    queryKey: ["profile", user.id],
    queryFn: async () => {
      const { data } = await supabase.from("student_profiles").select("*").eq("user_id", user.id).maybeSingle();
      // Auto-sync verification: if auth email is confirmed but profile flag isn't, fix it.
      if (data && !data.is_verified && user.email_confirmed_at) {
        await supabase.from("student_profiles").update({ is_verified: true }).eq("user_id", user.id);
        return { ...data, is_verified: true };
      }
      return data;
    },
  });
  const events = useQuery({ queryKey: ["events", "all"], queryFn: () => fetchPublishedEvents() });
  const myRegs = useQuery({
    queryKey: ["myRegs", user.id],
    queryFn: async () => (await supabase.from("registrations").select("*, events(*)").eq("user_id", user.id).order("created_at", { ascending: false })).data ?? [],
  });


  const interests: string[] = profile.data?.interests ?? [];
  const recommended = (events.data ?? []).filter((e) => interests.includes(e.category)).slice(0, 6);
  const others = (events.data ?? []).filter((e) => !interests.includes(e.category)).slice(0, 3);

  return (
    <PageShell>
      <div className="mx-auto max-w-7xl px-4 py-10 space-y-8">
        <header>
          <h1 className="text-3xl font-bold">Welcome back{profile.data?.full_name ? `, ${profile.data.full_name.split(" ")[0]}` : ""} 👋</h1>
          <p className="text-muted-foreground mt-1">Here's what's happening on campus.</p>
        </header>

        {profile.data && !profile.data.is_verified && (
          <div className="flex items-center justify-between gap-3 rounded-lg border border-warning bg-warning/10 p-4">
            <div className="flex items-center gap-2"><AlertCircle className="h-5 w-5 text-warning-foreground" /><span className="text-sm">Please verify your account to unlock full access.</span></div>
            <Link to="/signup"><Button size="sm" variant="outline">Verify now</Button></Link>
          </div>
        )}

        <section>
          <h2 className="text-xl font-bold mb-3">My Registered Events</h2>
          {!myRegs.data?.length ? (
            <EmptyState title="No registrations yet" description="Browse events and register to see them here." />
          ) : (
            <ul className="divide-y divide-border rounded-lg border border-border bg-card">
              {myRegs.data.map((r: any) => (
                <li key={r.id} className="flex items-center justify-between p-4">
                  <div>
                    <Link to="/events/$slug" params={{ slug: r.events.slug }} className="font-medium hover:text-primary">{r.events.title}</Link>
                    <p className="text-xs text-muted-foreground">{formatShortDate(r.events.date)} · {r.events.venue || "TBA"} · Ticket: {r.ticket_tier}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3">Recommended for you</h2>
          {recommended.length === 0 ? (
            <EmptyState title="No matching events yet" description="Update your interests in settings to see personalised events." />
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {recommended.map((e) => <EventCard key={e.id} event={e} />)}
            </div>
          )}
        </section>

        {others.length > 0 && (
          <section>
            <h2 className="text-xl font-bold mb-3">More events</h2>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {others.map((e) => <EventCard key={e.id} event={e} />)}
            </div>
          </section>
        )}

        <section className="grid gap-3 sm:grid-cols-3">
          <Link to="/opportunities" className="rounded-lg border border-border bg-card p-5 hover:border-primary"><h3 className="font-semibold">Opportunities</h3><p className="text-sm text-muted-foreground">Internships & scholarships</p></Link>
          <Link to="/notices" className="rounded-lg border border-border bg-card p-5 hover:border-primary"><h3 className="font-semibold">Notices</h3><p className="text-sm text-muted-foreground">Campus announcements</p></Link>
          <Link to="/calendar" className="rounded-lg border border-border bg-card p-5 hover:border-primary"><h3 className="font-semibold">Calendar</h3><p className="text-sm text-muted-foreground">Plan your month</p></Link>
        </section>
      </div>
    </PageShell>
  );
}
