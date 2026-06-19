import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Flame, Briefcase, ArrowRight, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { fetchUpcomingOpportunities } from "@/lib/db/queries";
import { formatEventDate, daysUntil, lowestPrice } from "@/lib/format";
import { CATEGORY_COLOR } from "@/lib/categories";
import { computeStreak, streakMicrocopy } from "@/lib/streak";
import { WhosGoing } from "@/components/whos-going";
import { Button } from "@/components/ui/button";

type FeaturedEvent = {
  id: string;
  slug: string;
  title: string;
  category: string;
  date: string;
  poster_url: string | null;
  is_free: boolean;
  is_featured: boolean;
  event_tickets: Array<{ is_enabled: boolean; price: number | string }>;
};

const CATEGORY_GRADIENT: Record<string, string> = {
  Academic: "from-blue-600 to-indigo-800",
  Career: "from-emerald-600 to-teal-800",
  Tech: "from-cyan-600 to-blue-800",
  Sports: "from-orange-500 to-red-700",
  Entertainment: "from-pink-500 to-fuchsia-700",
  Culture: "from-amber-500 to-orange-700",
  "Uni Vibe": "from-violet-600 to-purple-800",
};

async function fetchTopEvent(): Promise<FeaturedEvent | null> {
  const today = new Date().toISOString().slice(0, 10);
  const { data: featured } = await supabase
    .from("events")
    .select("id, slug, title, category, date, poster_url, is_free, is_featured, event_tickets(is_enabled, price)")
    .eq("is_published", true)
    .eq("is_featured", true)
    .gte("date", today)
    .order("date", { ascending: true })
    .limit(1);
  if (featured?.[0]) return featured[0] as any;
  // Fallback: most-registered upcoming event.
  const { data: regs } = await supabase
    .from("registrations")
    .select("event_id, events!inner(date, is_published)")
    .gte("events.date", today)
    .eq("events.is_published", true);
  if (regs?.length) {
    const counts: Record<string, number> = {};
    regs.forEach((r: any) => { counts[r.event_id] = (counts[r.event_id] || 0) + 1; });
    const topId = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0];
    if (topId) {
      const { data: ev } = await supabase
        .from("events")
        .select("id, slug, title, category, date, poster_url, is_free, is_featured, event_tickets(is_enabled, price)")
        .eq("id", topId)
        .maybeSingle();
      if (ev) return ev as any;
    }
  }
  const { data: next } = await supabase
    .from("events")
    .select("id, slug, title, category, date, poster_url, is_free, is_featured, event_tickets(is_enabled, price)")
    .eq("is_published", true)
    .gte("date", today)
    .order("date", { ascending: true })
    .limit(1);
  return (next?.[0] as any) ?? null;
}

export function BentoFeatured() {
  const { user } = useAuth();

  const top = useQuery({ queryKey: ["bento-top"], queryFn: fetchTopEvent });
  const opps = useQuery({ queryKey: ["bento-opps"], queryFn: () => fetchUpcomingOpportunities() });
  const streak = useQuery({
    queryKey: ["streak", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase.from("registrations").select("created_at").eq("user_id", user!.id);
      return computeStreak((data ?? []).map((r) => r.created_at));
    },
  });

  const openCount = opps.data?.length ?? 0;
  const closingSoon = (opps.data ?? []).filter((o) => {
    const d = daysUntil(o.deadline);
    return d >= 0 && d <= 7;
  }).length;

  const ev = top.data;
  const gradient = ev ? (CATEGORY_GRADIENT[ev.category] ?? "from-primary to-primary") : "from-primary to-primary";
  const lowest = ev ? lowestPrice(ev.event_tickets ?? []) : null;
  const isFree = ev?.is_free || lowest === null;

  return (
    <section className="grid gap-4 md:grid-cols-[1.4fr_1fr]">
      {/* Left: large featured */}
      {ev ? (
        <Link to="/events/$slug" params={{ slug: ev.slug }} className="group relative overflow-hidden rounded-2xl min-h-[280px] md:min-h-[340px]">
          <div className={`absolute inset-0 bg-gradient-to-br ${gradient}`} />
          {ev.poster_url && (
            <img src={ev.poster_url} alt={ev.title} className="absolute inset-0 h-full w-full object-cover opacity-40 transition-transform duration-500 group-hover:scale-105"
              onError={(e) => { e.currentTarget.style.display = "none"; }} />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          <div className="relative flex h-full flex-col justify-between p-5 md:p-7 text-white">
            <div className="space-y-2">
              <span className={`inline-block rounded px-2 py-0.5 text-xs font-semibold ${CATEGORY_COLOR[ev.category] ?? "bg-white/20"}`}>{ev.category}</span>
              <p className="text-xs font-bold tracking-wide opacity-90">{formatEventDate(ev.date)}</p>
              <h2 className="text-2xl md:text-3xl font-bold drop-shadow">{ev.title}</h2>
            </div>
            <div className="flex items-end justify-between gap-3 flex-wrap">
              <WhosGoing eventId={ev.id} size="sm" showZero className="text-white [&_*]:!text-white/90" />
              {isFree ? (
                <span className="rounded-md bg-success px-3 py-1.5 text-sm font-semibold text-success-foreground">FREE</span>
              ) : (
                <span className="rounded-md bg-white px-3 py-1.5 text-sm font-semibold text-foreground">KSh {Number(lowest).toLocaleString()}</span>
              )}
            </div>
          </div>
        </Link>
      ) : (
        <div className="rounded-2xl border border-border bg-card p-8 min-h-[280px] grid place-items-center text-center">
          <div>
            <Sparkles className="mx-auto h-8 w-8 text-muted-foreground" />
            <p className="mt-2 font-semibold">No featured event yet</p>
            <p className="text-sm text-muted-foreground">Check back soon for the next big thing.</p>
          </div>
        </div>
      )}

      {/* Right column */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 gap-4">
        <Link to="/opportunities" className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 p-5 text-white min-h-[130px] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <Briefcase className="h-6 w-6" />
            <ArrowRight className="h-4 w-4 opacity-70 group-hover:translate-x-1 transition-transform" />
          </div>
          <div>
            <p className="text-3xl font-bold">{openCount}</p>
            <p className="text-sm opacity-90">Open opportunities</p>
            {closingSoon > 0 && <p className="mt-1 text-xs opacity-80">{closingSoon} closing this week</p>}
          </div>
        </Link>

        {user ? (
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-orange-500 to-red-600 p-5 text-white min-h-[130px] flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <Flame className="h-6 w-6" />
              <span className="text-xs opacity-80">Streak</span>
            </div>
            <div>
              <p className="text-3xl font-bold">{streak.data ?? 0} <span className="text-base font-normal">days</span></p>
              <p className="text-xs opacity-90 mt-1">{streakMicrocopy(streak.data ?? 0)}</p>
            </div>
          </div>
        ) : (
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-violet-600 to-fuchsia-700 p-5 text-white min-h-[130px] flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <Sparkles className="h-6 w-6" />
            </div>
            <div>
              <p className="text-lg font-bold">Join UoN Link</p>
              <p className="text-xs opacity-90 mb-2">Track streaks, register for events, unlock frames.</p>
              <Link to="/signup"><Button size="sm" variant="secondary">Sign up</Button></Link>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
