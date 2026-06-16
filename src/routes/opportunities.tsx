import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { PageShell } from "@/components/layout/page-shell";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/empty-state";
import { fetchUpcomingOpportunities } from "@/lib/db/queries";
import { OPPORTUNITY_TYPES, OPPORTUNITY_TYPE_COLOR } from "@/lib/categories";
import { formatShortDate, daysUntil } from "@/lib/format";

const FILTERS = ["All", ...OPPORTUNITY_TYPES] as const;

export const Route = createFileRoute("/opportunities")({
  head: () => ({ meta: [{ title: "Opportunities — UoN Link" }, { name: "description", content: "Internships, scholarships, jobs, and competitions for UoN students." }] }),
  component: OpportunitiesPage,
});

function OpportunitiesPage() {
  const [filter, setFilter] = useState<string>("All");
  const ops = useQuery({ queryKey: ["opps"], queryFn: () => fetchUpcomingOpportunities() });
  const filtered = (ops.data ?? []).filter((o) => filter === "All" || o.type === filter);

  return (
    <PageShell>
      <div className="mx-auto max-w-7xl px-4 py-10 space-y-6">
        <header>
          <h1 className="text-3xl font-bold">Opportunities</h1>
          <p className="text-muted-foreground mt-1">Internships, scholarships, jobs, and more.</p>
        </header>
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <button key={f} onClick={() => setFilter(f)} className={`rounded-full px-3.5 py-1.5 text-sm font-medium ${filter === f ? "bg-primary text-primary-foreground" : "bg-secondary hover:bg-accent"}`}>{f}</button>
          ))}
        </div>
        {!filtered.length ? (
          <EmptyState title="No opportunities posted yet" description="Check back soon!" />
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((o) => {
              const dl = daysUntil(o.deadline);
              return (
                <article key={o.id} className="flex flex-col rounded-lg border border-border bg-card p-5">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className={`rounded px-2 py-0.5 text-xs font-semibold ${OPPORTUNITY_TYPE_COLOR[o.type] || "bg-primary text-white"}`}>{o.type}</span>
                    {dl <= 7 && dl >= 0 && <span className="rounded bg-destructive px-2 py-0.5 text-xs font-semibold text-destructive-foreground">Closing Soon</span>}
                  </div>
                  {o.organization && <p className="text-xs text-muted-foreground">{o.organization}</p>}
                  <h3 className="font-semibold mt-1">{o.title}</h3>
                  {o.eligibility && <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">{o.eligibility}</p>}
                  <p className="mt-3 text-xs">Deadline: <span className="font-semibold">{formatShortDate(o.deadline)}</span></p>
                  {o.application_link && (
                    <a href={o.application_link} target="_blank" rel="noopener noreferrer" className="mt-3"><Button size="sm" className="w-full">Apply Now</Button></a>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </div>
    </PageShell>
  );
}
