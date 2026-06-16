import { createFileRoute, Link } from "@tanstack/react-router";
import { SignupForm } from "@/components/signup-form";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Calendar, Search } from "lucide-react";
import { PageShell } from "@/components/layout/page-shell";
import { Button } from "@/components/ui/button";
import { EventCard } from "@/components/event-card";
import { EmptyState } from "@/components/empty-state";
import { fetchPublishedEvents, fetchUpcomingOpportunities, fetchActiveSpotlight } from "@/lib/db/queries";
import { CATEGORY_COLOR, OPPORTUNITY_TYPE_COLOR } from "@/lib/categories";
import { formatShortDate, daysUntil } from "@/lib/format";

const FILTERS = ["All", "Academic", "Career", "Tech", "Sports", "Uni Vibe", "Free"] as const;

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "UoN Link — Your Gateway to Campus Life" },
      { name: "description", content: "Discover events, opportunities, and everything happening at the University of Nairobi." },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("All");
  const events = useQuery({ queryKey: ["events", "home"], queryFn: () => fetchPublishedEvents({ limit: 9 }) });
  const ops = useQuery({ queryKey: ["opps", "home"], queryFn: () => fetchUpcomingOpportunities(4) });
  const spotlight = useQuery({ queryKey: ["spotlight"], queryFn: fetchActiveSpotlight });

  const filtered = (events.data ?? []).filter((e) => {
    if (filter === "All") return true;
    if (filter === "Free") return e.is_free || !e.event_tickets?.some((t) => t.is_enabled);
    return e.category === filter;
  });

  return (
    <PageShell>
      {/* Hero */}
      <section className="bg-primary text-primary-foreground">
        <div className="mx-auto max-w-7xl px-4 py-20 md:py-28 text-center">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight">Your Gateway to Campus Life</h1>
          <p className="mt-4 text-base md:text-lg text-primary-foreground/85 max-w-2xl mx-auto">
            Discover events, opportunities, and everything happening at UoN
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link to="/events"><Button size="lg" variant="secondary">Browse Events <ArrowRight className="ml-1.5 h-4 w-4" /></Button></Link>
            <Link to="/opportunities"><Button size="lg" variant="outline" className="bg-transparent text-white border-white/40 hover:bg-white/10 hover:text-white">Opportunities</Button></Link>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-12 space-y-14">
        {/* Spotlight */}
        <section>
          <h2 className="text-2xl font-bold mb-4">Student Spotlight</h2>
          {spotlight.data ? (
            <div className="flex flex-col md:flex-row items-start gap-5 rounded-lg border border-border bg-card p-6">
              {spotlight.data.photo_url ? (
                <img src={spotlight.data.photo_url} alt={spotlight.data.name} className="h-20 w-20 rounded-full object-cover" />
              ) : (
                <div className="grid h-20 w-20 place-items-center rounded-full bg-primary text-primary-foreground text-2xl font-bold">
                  {spotlight.data.name.split(" ").map((p) => p[0]).slice(0, 2).join("")}
                </div>
              )}
              <div className="flex-1">
                <h3 className="text-lg font-semibold">{spotlight.data.name}</h3>
                {spotlight.data.faculty_or_club && <p className="text-sm text-muted-foreground">{spotlight.data.faculty_or_club}</p>}
                {spotlight.data.headline && <p className="mt-2 text-base">{spotlight.data.headline}</p>}
              </div>
            </div>
          ) : (
            <EmptyState title="No spotlight yet" description="Check back soon for featured students and clubs." />
          )}
        </section>

        {/* Filters + Events */}
        <section>
          <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
            <h2 className="text-2xl font-bold">Upcoming Events</h2>
            <Link to="/events" className="text-sm text-primary hover:underline">View all →</Link>
          </div>
          <div className="flex flex-wrap gap-2 mb-6">
            {FILTERS.map((f) => (
              <button key={f} onClick={() => setFilter(f)} className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${filter === f ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-accent"}`}>{f}</button>
            ))}
          </div>
          {filtered.length === 0 ? (
            <EmptyState title="No events posted yet" description="Check back soon!" icon={<Calendar className="h-5 w-5" />} />
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((e) => <EventCard key={e.id} event={e} />)}
            </div>
          )}
        </section>

        {/* Opportunities closing soon */}
        <section>
          <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
            <h2 className="text-2xl font-bold">Opportunities closing soon</h2>
            <Link to="/opportunities" className="text-sm text-primary hover:underline">View all →</Link>
          </div>
          {!ops.data?.length ? (
            <EmptyState title="No opportunities posted yet" description="Check back soon!" />
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {ops.data.map((o) => {
                const dl = daysUntil(o.deadline);
                return (
                  <div key={o.id} className="rounded-lg border border-border bg-card p-5">
                    <div className="flex items-center justify-between gap-3 mb-2">
                      <span className={`rounded px-2 py-0.5 text-xs font-semibold ${OPPORTUNITY_TYPE_COLOR[o.type] || "bg-primary text-primary-foreground"}`}>{o.type}</span>
                      {dl <= 7 && dl >= 0 && <span className="rounded bg-destructive px-2 py-0.5 text-xs font-semibold text-destructive-foreground">Closing Soon</span>}
                    </div>
                    <h3 className="font-semibold">{o.title}</h3>
                    {o.organization && <p className="text-sm text-muted-foreground">{o.organization}</p>}
                    <p className="mt-2 text-xs text-muted-foreground">Deadline: {formatShortDate(o.deadline)}</p>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Account creation */}
        <section className="pt-4">
          <h2 className="text-2xl font-bold mb-4">Join UoN Link</h2>
          <SignupForm />
        </section>
      </div>
    </PageShell>
  );
}
