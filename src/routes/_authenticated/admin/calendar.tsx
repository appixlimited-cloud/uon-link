import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight, Link as LinkIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/admin/calendar")({
  component: AdminCalendar,
});

function AdminCalendar() {
  const [cursor, setCursor] = useState(new Date());
  const { data } = useQuery({
    queryKey: ["admin", "calendar"],
    queryFn: async () => (await supabase.from("events").select("id, title, date, is_published").order("date")).data ?? [],
  });
  const byDate = useMemo(() => {
    const m: Record<string, any[]> = {};
    for (const e of data ?? []) (m[e.date] = m[e.date] || []).push(e);
    return m;
  }, [data]);

  const year = cursor.getFullYear(); const month = cursor.getMonth();
  const first = new Date(year, month, 1); const sw = first.getDay();
  const days = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = []; for (let i = 0; i < sw; i++) cells.push(null);
  for (let d = 1; d <= days; d++) cells.push(d);

  return (
    <div className="max-w-5xl space-y-4">
      <h1 className="text-2xl font-bold">Calendar</h1>
      <div className="flex items-center justify-between">
        <Button variant="outline" size="icon" onClick={() => setCursor(new Date(year, month - 1, 1))}><ChevronLeft className="h-4 w-4" /></Button>
        <div className="flex items-center gap-3">
          <h2 className="font-semibold text-lg">{first.toLocaleDateString("en-GB", { month: "long", year: "numeric" })}</h2>
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
          const items = byDate[key] || [];
          return (
            <div key={i} className="aspect-square rounded border border-border p-1 text-xs overflow-hidden bg-card">
              <div className="font-semibold mb-1">{d}</div>
              {items.slice(0, 2).map((e) => (
                <Link key={e.id} to="/admin/events/$id" params={{ id: e.id }} className={`block truncate rounded px-1 py-0.5 mb-0.5 ${e.is_published ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>{e.title}</Link>
              ))}
              {items.length > 2 && <div className="text-muted-foreground">+{items.length - 2}</div>}
            </div>
          );
        })}
      </div>
      <p className="text-xs text-muted-foreground">Blue = published · Grey = draft</p>
    </div>
  );
}
