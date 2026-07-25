import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Ticket, ArrowRight } from "lucide-react";
import { PageShell } from "@/components/layout/page-shell";
import { supabase } from "@/integrations/supabase/client";
import { formatEventDate } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/my-tickets")({
  head: () => ({ meta: [{ title: "My Tickets — UoN Link" }] }),
  component: MyTicketsPage,
});

function MyTicketsPage() {
  const { user } = Route.useRouteContext();
  const { data, isLoading } = useQuery({
    queryKey: ["myTickets", user.id],
    queryFn: async () => {
      const { data } = await (supabase as any)
        .from("tickets")
        .select("id, ticket_code, ticket_tier, status, seat_number, created_at, events(id, slug, title, date, time, venue, category, poster_url)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  const badgeFor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-100 text-green-700";
      case "used": return "bg-orange-100 text-orange-700";
      case "cancelled": return "bg-red-100 text-red-700";
      case "expired": return "bg-slate-200 text-slate-600";
      default: return "bg-slate-100";
    }
  };

  return (
    <PageShell>
      <div className="mx-auto max-w-4xl px-4 py-10">
        <header className="mb-6">
          <h1 className="text-3xl font-bold">My Tickets</h1>
          <p className="mt-1 text-sm text-muted-foreground">Every event you're registered for.</p>
        </header>

        {isLoading ? (
          <div className="rounded-2xl border bg-card p-10 text-center text-muted-foreground">Loading your tickets…</div>
        ) : !data?.length ? (
          <div className="rounded-2xl border bg-card p-10 text-center">
            <Ticket className="mx-auto h-10 w-10 text-muted-foreground" />
            <h2 className="mt-3 font-semibold">No tickets yet</h2>
            <p className="mt-1 text-sm text-muted-foreground">Register for an event to get your first ticket.</p>
            <Link to="/events" className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline">
              Browse events <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          <div className="grid gap-4">
            {data.map((t: any) => (
              <Link key={t.id} to="/tickets/$ticketId" params={{ ticketId: t.ticket_code }}
                    className="group flex items-stretch gap-4 rounded-2xl border bg-card p-4 shadow-sm transition-all hover:shadow-md hover:border-primary/40">
                <div className="hidden sm:block w-24 shrink-0 overflow-hidden rounded-xl bg-muted">
                  {t.events?.poster_url ? (
                    <img src={t.events.poster_url} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="h-full w-full bg-gradient-to-br from-primary/30 to-primary/60" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h3 className="truncate font-semibold group-hover:text-primary">{t.events?.title}</h3>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {t.events && formatEventDate(t.events.date)}{t.events?.venue ? ` · ${t.events.venue}` : ""}
                      </p>
                    </div>
                    <span className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase ${badgeFor(t.status)}`}>{t.status}</span>
                  </div>
                  <div className="mt-3 flex items-center gap-3 text-xs">
                    <span className="rounded-full bg-primary/10 px-2 py-0.5 font-semibold text-primary">{t.ticket_tier}</span>
                    <span className="font-mono text-muted-foreground">#{t.ticket_code.slice(0, 8)}</span>
                    <ArrowRight className="ml-auto h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </PageShell>
  );
}
