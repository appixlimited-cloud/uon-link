import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { PageShell } from "@/components/layout/page-shell";
import { EmptyState } from "@/components/empty-state";
import { fetchActiveNotices } from "@/lib/db/queries";
import { NOTICE_CATEGORIES } from "@/lib/categories";
import { formatShortDate } from "@/lib/format";

export const Route = createFileRoute("/notices")({
  head: () => ({ meta: [{ title: "Notice Board — UoN Link" }, { name: "description", content: "Campus notices grouped by category." }] }),
  component: NoticesPage,
});

function NoticesPage() {
  const notices = useQuery({ queryKey: ["notices"], queryFn: fetchActiveNotices });

  return (
    <PageShell>
      <div className="mx-auto max-w-5xl px-4 py-10 space-y-8">
        <header>
          <h1 className="text-3xl font-bold">Notice Board</h1>
          <p className="text-muted-foreground mt-1">Stay informed about campus announcements.</p>
        </header>
        {!notices.data?.length ? (
          <EmptyState title="No notices posted yet" description="Check back soon!" />
        ) : (
          NOTICE_CATEGORIES.map((cat) => {
            const items = notices.data!.filter((n) => n.category === cat);
            if (!items.length) return null;
            return (
              <section key={cat}>
                <h2 className="text-xl font-bold mb-3">{cat}</h2>
                <ul className="space-y-3">
                  {items.map((n) => (
                    <li key={n.id} className="rounded-lg border border-border bg-card p-4">
                      <div className="flex items-start justify-between gap-3">
                        <h3 className="font-semibold">{n.title}</h3>
                        <span className="text-xs text-muted-foreground whitespace-nowrap">{formatShortDate(n.created_at)}</span>
                      </div>
                      {n.description && <p className="mt-1 text-sm text-muted-foreground whitespace-pre-wrap">{n.description}</p>}
                      {n.contact && <p className="mt-2 text-xs">Contact: {n.contact}</p>}
                    </li>
                  ))}
                </ul>
              </section>
            );
          })
        )}
      </div>
    </PageShell>
  );
}
