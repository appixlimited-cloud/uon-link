import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { PageShell } from "@/components/layout/page-shell";
import { EventCard } from "@/components/event-card";
import { EmptyState } from "@/components/empty-state";
import { fetchPublishedEvents } from "@/lib/db/queries";

export const Route = createFileRoute("/career-events")({
  head: () => ({ meta: [{ title: "Career Events — UoN Link" }, { name: "description", content: "Internship drives, career fairs, CV clinics, and professional development at UoN." }] }),
  component: CareerEventsPage,
});

function CareerEventsPage() {
  const events = useQuery({ queryKey: ["events", "career"], queryFn: () => fetchPublishedEvents({ category: "Career" }) });
  return (
    <PageShell>
      <div className="mx-auto max-w-7xl px-4 py-10 space-y-6">
        <header>
          <h1 className="text-3xl font-bold">Career Events at UoN</h1>
          <p className="text-muted-foreground mt-1">Internship drives, career fairs, CV clinics, and professional development.</p>
        </header>
        {!events.data?.length ? (
          <EmptyState title="No career events posted yet" description="Check back soon!" />
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {events.data.map((e) => <EventCard key={e.id} event={e} />)}
          </div>
        )}
      </div>
    </PageShell>
  );
}
