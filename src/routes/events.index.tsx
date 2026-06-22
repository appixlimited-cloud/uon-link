import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Search } from "lucide-react";
import { PageShell } from "@/components/layout/page-shell";
import { EventCard } from "@/components/event-card";
import { EmptyState } from "@/components/empty-state";
import { Input } from "@/components/ui/input";
import { fetchPublishedEvents } from "@/lib/db/queries";

const FILTERS = ["All", "Academic", "Career", "Tech", "Sports", "Entertainment", "Culture", "Free"] as const;

export const Route = createFileRoute("/events/")({
  component: EventsIndexPage,
});

function EventsIndexPage() {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("All");
  const [q, setQ] = useState("");
  const events = useQuery({ queryKey: ["events", "all"], queryFn: () => fetchPublishedEvents() });

  const filtered = (events.data ?? []).filter((e) => {
    const matchesFilter = filter === "All" ? true : filter === "Free" ? (e.is_free || !e.event_tickets?.some((t) => t.is_enabled)) : e.category === filter;
    const matchesQ = !q.trim() || e.title.toLowerCase().includes(q.toLowerCase()) || (e.venue || "").toLowerCase().includes(q.toLowerCase());
    return matchesFilter && matchesQ;
  });

  return (
    <PageShell>
      <div className="mx-auto max-w-7xl px-4 py-10 space-y-6">
        <header>
          <h1 className="text-3xl font-bold">All Events</h1>
          <p className="text-muted-foreground mt-1">Discover what's happening on campus.</p>
        </header>
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search events..." className="pl-9" />
        </div>
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <button key={f} onClick={() => setFilter(f)} className={`rounded-full px-3.5 py-1.5 text-sm font-medium ${filter === f ? "bg-primary text-primary-foreground" : "bg-secondary hover:bg-accent"}`}>{f}</button>
          ))}
        </div>
        {!filtered.length ? (
          <EmptyState title="No events posted yet" description="Check back soon!" />
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((e) => <EventCard key={e.id} event={e} />)}
          </div>
        )}
      </div>
    </PageShell>
  );
}