import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Calendar, Search, MapPin, ArrowRight, Clock } from "lucide-react";
import { PageShell } from "@/components/layout/page-shell";
import { Button } from "@/components/ui/button";
import { EventCard } from "@/components/event-card";
import { EmptyState } from "@/components/empty-state";
import { useAuth } from "@/hooks/use-auth";
import { useRegisterEvent } from "@/hooks/use-register-event";
import { useMyRegistrations } from "@/hooks/use-my-registrations";
import { fetchPublishedEvents, fetchUpcomingOpportunities, fetchActiveSpotlight } from "@/lib/db/queries";
import { CATEGORY_COLOR, OPPORTUNITY_TYPE_COLOR } from "@/lib/categories";
import { formatEventDate, formatShortDate, daysUntil, lowestPrice } from "@/lib/format";

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
  const [search, setSearch] = useState("");
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const events = useQuery({ queryKey: ["events", "home"], queryFn: () => fetchPublishedEvents({ limit: 12 }) });
  const ops = useQuery({ queryKey: ["opps", "home"], queryFn: () => fetchUpcomingOpportunities(4) });
  const spotlight = useQuery({ queryKey: ["spotlight"], queryFn: fetchActiveSpotlight });
  const { registeredIds } = useMyRegistrations();
  const register = useRegisterEvent();

  const all = events.data ?? [];
  const featured = all[0];
  const rest = all.slice(1);

  const filtered = rest.filter((e) => {
    const matchesFilter =
      filter === "All" ? true : filter === "Free" ? (e.is_free || !e.event_tickets?.some((t) => t.is_enabled)) : e.category === filter;
    const matchesQ = !search.trim() || e.title.toLowerCase().includes(search.toLowerCase()) || (e.venue || "").toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesQ;
  });

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!search.trim()) return;
    navigate({ to: "/events" });
  };

  const featuredLowest = featured?.event_tickets ? lowestPrice(featured.event_tickets) : null;
  const featuredIsFree = featured ? featured.is_free || featuredLowest === null : false;
  const featuredCatClass = featured ? CATEGORY_COLOR[featured.category] || "bg-primary" : "";
  const featuredRegistered = featured ? registeredIds.has(featured.id) : false;

  return (
    <PageShell>
      {/* Featured hero */}
      <section className="relative overflow-hidden border-b border-white/5">
        <div
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            background:
              "radial-gradient(60% 50% at 20% 10%, oklch(0.65 0.18 255 / 0.35), transparent 70%), radial-gradient(50% 40% at 90% 0%, oklch(0.55 0.2 290 / 0.25), transparent 70%)",
          }}
        />
        <div className="relative mx-auto max-w-7xl px-4 py-10 md:py-16">
          <div className="mb-8 flex flex-col gap-6 md:mb-12">
            <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.2em] text-primary/80">
              <span className="h-px w-8 bg-primary/60" /> University of Nairobi
            </div>
            <h1 className="max-w-3xl text-4xl font-bold leading-[1.05] tracking-tight text-foreground md:text-6xl">
              Your gateway to <span className="text-primary">campus life.</span>
            </h1>
            <p className="max-w-2xl text-base text-muted-foreground md:text-lg">
              Discover events, opportunities and everything happening at the University of Nairobi and beyond.
            </p>
            <form onSubmit={onSearch} className="flex w-full max-w-2xl items-center gap-2 rounded-2xl border border-white/10 bg-card/60 p-2 shadow-lg shadow-black/30 backdrop-blur">
              <div className="flex flex-1 items-center gap-2 px-3">
                <Search className="h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search events, clubs, opportunities…"
                  className="flex-1 bg-transparent py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
                />
              </div>
              <Button type="submit" size="lg" className="rounded-xl font-semibold">Search</Button>
            </form>
            {!loading && !user && (
              <div className="flex flex-wrap gap-3">
                <Link to="/signup"><Button size="lg" className="rounded-xl font-semibold">Create account</Button></Link>
                <Link to="/auth"><Button size="lg" variant="outline" className="rounded-xl border-white/20 bg-transparent font-semibold hover:bg-white/5">Log in</Button></Link>
              </div>
            )}
          </div>

          {featured && (
            <Link
              to="/events/$slug"
              params={{ slug: featured.slug }}
              className="group relative grid overflow-hidden rounded-3xl border border-white/10 bg-card shadow-2xl shadow-black/40 md:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]"
            >
              <div className={`relative ${featuredCatClass}`} style={{ aspectRatio: "4 / 3" }}>
                {featured.poster_url ? (
                  <img
                    src={featured.poster_url}
                    alt={featured.title}
                    className="absolute inset-0 h-full w-full object-contain transition-transform duration-700 group-hover:scale-[1.02]"
                  />
                ) : null}
                <span className="absolute left-4 top-4 rounded-full bg-black/50 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-white backdrop-blur">
                  Featured · {featured.category}
                </span>
              </div>
              <div className="flex flex-col justify-between gap-6 p-6 md:p-10">
                <div className="space-y-5">
                  <h2 className="text-2xl font-bold leading-tight tracking-tight md:text-4xl">{featured.title}</h2>
                  <div className="grid gap-3 text-sm text-muted-foreground sm:grid-cols-2">
                    <span className="inline-flex items-center gap-2"><Calendar className="h-4 w-4 text-primary" /><span className="text-foreground">{formatEventDate(featured.date)}</span></span>
                    {featured.time && <span className="inline-flex items-center gap-2"><Clock className="h-4 w-4 text-primary" />{featured.time}</span>}
                    <span className="inline-flex items-center gap-2 sm:col-span-2"><MapPin className="h-4 w-4 text-primary" />{featured.venue || "Venue TBA"}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    {featuredIsFree ? (
                      <span className="rounded-full bg-success/15 px-3 py-1 text-xs font-bold text-success">FREE ENTRY</span>
                    ) : (
                      <span className="rounded-full bg-primary/15 px-3 py-1 text-xs font-bold text-primary">FROM KSh {Number(featuredLowest).toLocaleString()}</span>
                    )}
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  {featuredRegistered ? (
                    <Button size="lg" className="rounded-xl bg-success font-semibold text-success-foreground hover:bg-success/90">You're registered ✓</Button>
                  ) : !user ? (
                    <Button size="lg" className="rounded-xl font-semibold" onClick={(e) => { e.preventDefault(); navigate({ to: "/auth" }); }}>
                      Register now <ArrowRight className="ml-1 h-4 w-4" />
                    </Button>
                  ) : (
                    <Button
                      size="lg"
                      className="rounded-xl font-semibold"
                      onClick={(e) => { e.preventDefault(); register.mutate({ id: featured.id, slug: featured.slug, is_free: featuredIsFree }); }}
                      disabled={register.isPending}
                    >
                      Register now <ArrowRight className="ml-1 h-4 w-4" />
                    </Button>
                  )}
                  <span className="text-sm text-muted-foreground">View details →</span>
                </div>
              </div>
            </Link>
          )}
        </div>
      </section>

      <div className="mx-auto max-w-7xl space-y-16 px-4 py-14">
        {/* Filters + Events */}
        <section>
          <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold md:text-3xl">Featured events</h2>
              <p className="mt-1 text-sm text-muted-foreground">Handpicked happenings around campus.</p>
            </div>
            <Link to="/events" className="text-sm font-medium text-primary hover:underline">View all events →</Link>
          </div>
          <div className="mb-6 flex flex-wrap gap-2">
            {FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-all ${
                  filter === f
                    ? "border-primary bg-primary text-primary-foreground shadow-md shadow-primary/30"
                    : "border-white/10 bg-card/60 text-muted-foreground hover:border-white/20 hover:text-foreground"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
          {filtered.length === 0 ? (
            <EmptyState title="No events posted yet" description="Check back soon!" icon={<Calendar className="h-5 w-5" />} />
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((e) => <EventCard key={e.id} event={e} />)}
            </div>
          )}
        </section>

        {/* Spotlight */}
        {spotlight.data && (
          <section>
            <h2 className="mb-4 text-2xl font-bold md:text-3xl">Student spotlight</h2>
            <div className="flex flex-col items-start gap-5 rounded-2xl border border-white/10 bg-card p-6 shadow-lg shadow-black/30 md:flex-row md:p-8">
              {spotlight.data.photo_url ? (
                <img src={spotlight.data.photo_url} alt={spotlight.data.name} className="h-20 w-20 rounded-full object-cover ring-2 ring-primary/30" />
              ) : (
                <div className="grid h-20 w-20 place-items-center rounded-full bg-primary text-2xl font-bold text-primary-foreground">
                  {spotlight.data.name.split(" ").map((p) => p[0]).slice(0, 2).join("")}
                </div>
              )}
              <div className="flex-1">
                <h3 className="text-lg font-semibold">{spotlight.data.name}</h3>
                {spotlight.data.faculty_or_club && <p className="text-sm text-muted-foreground">{spotlight.data.faculty_or_club}</p>}
                {spotlight.data.headline && <p className="mt-2 text-base text-foreground/90">{spotlight.data.headline}</p>}
              </div>
            </div>
          </section>
        )}

        {/* Opportunities closing soon */}
        <section>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-2xl font-bold md:text-3xl">Opportunities closing soon</h2>
            <Link to="/opportunities" className="text-sm font-medium text-primary hover:underline">View all →</Link>
          </div>
          {!ops.data?.length ? (
            <EmptyState title="No opportunities posted yet" description="Check back soon!" />
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {ops.data.map((o) => {
                const dl = daysUntil(o.deadline);
                return (
                  <div key={o.id} className="rounded-2xl border border-white/10 bg-card p-5 shadow-lg shadow-black/20 transition-all hover:-translate-y-0.5 hover:border-primary/40">
                    <div className="mb-2 flex items-center justify-between gap-3">
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${OPPORTUNITY_TYPE_COLOR[o.type] || "bg-primary text-primary-foreground"}`}>{o.type}</span>
                      {dl <= 7 && dl >= 0 && <span className="rounded-full bg-destructive px-2.5 py-0.5 text-xs font-semibold text-destructive-foreground">Closing soon</span>}
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
      </div>
    </PageShell>
  );
}
