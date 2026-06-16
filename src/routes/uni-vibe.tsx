import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { PageShell } from "@/components/layout/page-shell";
import { EventCard } from "@/components/event-card";
import { EmptyState } from "@/components/empty-state";
import { fetchPublishedEvents } from "@/lib/db/queries";

export const Route = createFileRoute("/uni-vibe")({
  head: () => ({ meta: [{ title: "Uni Vibe — UoN Link" }, { name: "description", content: "Concerts, comedy nights, sports events, and campus lifestyle at UoN." }] }),
  component: UniVibePage,
});

function UniVibePage() {
  const events = useQuery({ queryKey: ["events", "univibe"], queryFn: () => fetchPublishedEvents({ categories: ["Uni Vibe", "Entertainment", "Culture"] }) });
  return (
    <PageShell>
      <div className="mx-auto max-w-7xl px-4 py-10 space-y-6">
        <header>
          <h1 className="text-3xl font-bold">Uni Vibe</h1>
          <p className="text-muted-foreground mt-1">Concerts, comedy nights, sports events, and campus lifestyle.</p>
        </header>
        {!events.data?.length ? (
          <EmptyState title="No Uni Vibe events posted yet" description="Check back soon!" />
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {events.data.map((e) => <EventCard key={e.id} event={e} />)}
          </div>
        )}
      </div>
    </PageShell>
  );
}
