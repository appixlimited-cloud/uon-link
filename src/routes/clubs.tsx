import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Search, Mail, ExternalLink } from "lucide-react";
import { PageShell } from "@/components/layout/page-shell";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/empty-state";
import { fetchClubs } from "@/lib/db/queries";

export const Route = createFileRoute("/clubs")({
  head: () => ({ meta: [{ title: "Clubs — UoN Link" }, { name: "description", content: "Browse student clubs and societies at the University of Nairobi." }] }),
  component: ClubsPage,
});

function ClubsPage() {
  const [q, setQ] = useState("");
  const clubs = useQuery({ queryKey: ["clubs"], queryFn: fetchClubs });
  const filtered = (clubs.data ?? []).filter((c) => !q || c.name.toLowerCase().includes(q.toLowerCase()) || (c.category || "").toLowerCase().includes(q.toLowerCase()));

  return (
    <PageShell>
      <div className="mx-auto max-w-7xl px-4 py-10 space-y-6">
        <header>
          <h1 className="text-3xl font-bold">Clubs & Societies</h1>
          <p className="text-muted-foreground mt-1">Find your community on campus.</p>
        </header>
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search clubs..." className="pl-9" />
        </div>
        {!filtered.length ? (
          <EmptyState title="No clubs posted yet" description="Check back soon!" />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((c) => (
              <article key={c.id} className="rounded-lg border border-border bg-card p-5">
                <div className="flex items-center gap-3">
                  {c.logo_url ? <img src={c.logo_url} alt={c.name} className="h-12 w-12 rounded-full object-cover" /> : (
                    <div className="grid h-12 w-12 place-items-center rounded-full bg-primary text-primary-foreground font-bold">{c.name.slice(0, 2).toUpperCase()}</div>
                  )}
                  <div>
                    <h3 className="font-semibold">{c.name}</h3>
                    {c.category && <span className="text-xs text-muted-foreground">{c.category}</span>}
                  </div>
                </div>
                {c.description && <p className="mt-3 text-sm text-muted-foreground line-clamp-3">{c.description}</p>}
                <div className="mt-3 flex flex-wrap gap-3 text-xs">
                  {c.contact_email && <a href={`mailto:${c.contact_email}`} className="inline-flex items-center gap-1 text-primary hover:underline"><Mail className="h-3 w-3" /> {c.contact_email}</a>}
                  {c.social_link && <a href={c.social_link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-primary hover:underline"><ExternalLink className="h-3 w-3" /> Visit</a>}
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </PageShell>
  );
}
