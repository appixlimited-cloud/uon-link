import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight, List as ListIcon, Calendar as CalIcon } from "lucide-react";
import { PageShell } from "@/components/layout/page-shell";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/empty-state";
import { fetchPublishedEvents } from "@/lib/db/queries";
import { CATEGORY_DOT } from "@/lib/categories";
import { formatShortDate, googleCalUrl, lowestPrice } from "@/lib/format";

export const Route = createFileRoute("/calendar")({
  head: () => ({ meta: [{ title: "Calendar — UoN Link" }, { name: "description", content: "Browse all upcoming UoN events on a monthly calendar." }] }),
  component: CalendarPage,
});

function CalendarPage() {
  const events = useQuery({ queryKey: ["events", "calendar"], queryFn: () => fetchPublishedEvents() });
  const [view, setView] = useState<"month" | "list">("month");
  const [cursor, setCursor] = useState(() => new Date());
  const [selected, setSelected] = useState<string | null>(null);

  const byDate = useMemo(() => {
    const m: Record<string, any[]> = {};
    for (const e of events.data ?? []) {
      (m[e.date] = m[e.date] || []).push(e);
    }
    return m;
  }, [events.data]);

  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const first = new Date(year, month, 1);
  const startWeekday = first.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [];
  for (let i = 0; i < startWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const monthName = first.toLocaleDateString("en-GB", { month: "long", year: "numeric" });
  const todayKey = new Date().toISOString().slice(0, 10);

  return (
    <PageShell>
      <div className="mx-auto max-w-6xl px-4 py-10">
        <header className="flex items-center justify-between flex-wrap gap-3 mb-6">
          <h1 className="text-3xl font-bold">Event Calendar</h1>
          <div className="flex gap-2">
            <Button variant={view === "month" ? "default" : "outline"} size="sm" onClick={() => setView("month")}><CalIcon className="h-4 w-4 mr-1.5" />Month</Button>
            <Button variant={view === "list" ? "default" : "outline"} size="sm" onClick={() => setView("list")}><ListIcon className="h-4 w-4 mr-1.5" />List</Button>
          </div>
        </header>

        {view === "month" ? (
          <>
            <div className="flex items-center justify-between mb-4">
              <Button variant="outline" size="icon" onClick={() => setCursor(new Date(year, month - 1, 1))}><ChevronLeft className="h-4 w-4" /></Button>
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-semibold">{monthName}</h2>
                <Button size="sm" variant="outline" onClick={() => setCursor(new Date())}>Today</Button>
              </div>
              <Button variant="outline" size="icon" onClick={() => setCursor(new Date(year, month + 1, 1))}><ChevronRight className="h-4 w-4" /></Button>
            </div>
            <div className="grid grid-cols-7 text-center text-xs font-semibold text-muted-foreground mb-1">
              {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map((d) => <div key={d} className="py-2">{d}</div>)}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {cells.map((d, i) => {
                if (!d) return <div key={i} className="aspect-square rounded bg-secondary/30" />;
                const key = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
                const dayEvents = byDate[key] || [];
                const isToday = key === todayKey;
                return (
                  <button key={i} onClick={() => dayEvents.length && setSelected(selected === key ? null : key)} className={`aspect-square rounded border p-1.5 text-left text-xs hover:border-primary transition-colors ${isToday ? "border-primary bg-primary/5" : "border-border"}`}>
                    <div className="font-semibold">{d}</div>
                    <div className="mt-1 flex flex-wrap gap-0.5">
                      {dayEvents.slice(0, 3).map((e) => <span key={e.id} className={`h-1.5 w-1.5 rounded-full ${CATEGORY_DOT[e.category] || "bg-primary"}`} />)}
                      {dayEvents.length > 3 && <span className="text-[10px] text-muted-foreground">+{dayEvents.length - 3}</span>}
                    </div>
                  </button>
                );
              })}
            </div>

            {selected && byDate[selected] && (
              <div className="mt-6 rounded-lg border border-border bg-card p-5">
                <h3 className="font-semibold mb-3">Events on {formatShortDate(selected)}</h3>
                <ul className="space-y-3">
                  {byDate[selected].map((e) => {
                    const lp = lowestPrice(e.event_tickets ?? []);
                    return (
                      <li key={e.id} className="flex items-start justify-between gap-3 border-b last:border-0 pb-3 last:pb-0">
                        <div>
                          <Link to="/events/$slug" params={{ slug: e.slug }} className="font-medium hover:text-primary">{e.title}</Link>
                          <p className="text-xs text-muted-foreground">{e.time || "Time TBA"} · {e.venue || "Venue TBA"} · {lp === null || e.is_free ? "FREE" : `from KSh ${lp}`}</p>
                        </div>
                        <a href={googleCalUrl({ title: e.title, date: e.date, time: e.time, venue: e.venue, description: e.description })} target="_blank" rel="noopener noreferrer"><Button size="sm" variant="outline">+ Google</Button></a>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}

            <div className="mt-6 flex flex-wrap gap-3 text-xs text-muted-foreground">
              {Object.entries({ Academic: "bg-cat-academic", Career: "bg-cat-career", "Uni Vibe": "bg-cat-univibe", Sports: "bg-cat-sports", Entertainment: "bg-cat-entertainment" }).map(([k, c]) => (
                <span key={k} className="inline-flex items-center gap-1.5"><span className={`h-2 w-2 rounded-full ${c}`} /> {k}</span>
              ))}
            </div>
          </>
        ) : (
          <div>
            {!events.data?.length ? (
              <EmptyState title="No events posted yet" description="Check back soon!" />
            ) : (
              <ul className="divide-y divide-border rounded-lg border border-border bg-card">
                {events.data.map((e) => {
                  const lp = lowestPrice(e.event_tickets ?? []);
                  return (
                    <li key={e.id} className="flex items-center justify-between gap-3 p-4">
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-primary">{formatShortDate(e.date)} · {e.time || "TBA"}</p>
                        <Link to="/events/$slug" params={{ slug: e.slug }} className="font-medium hover:text-primary">{e.title}</Link>
                        <p className="text-xs text-muted-foreground">{e.venue || "Venue TBA"} · {lp === null || e.is_free ? "FREE" : `from KSh ${lp}`}</p>
                      </div>
                      <a href={googleCalUrl({ title: e.title, date: e.date, time: e.time, venue: e.venue, description: e.description })} target="_blank" rel="noopener noreferrer"><Button size="sm" variant="outline">+ Google</Button></a>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        )}
      </div>
    </PageShell>
  );
}
