import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Flame, Briefcase, MapPin, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { formatEventDate, lowestPrice, daysUntil } from "@/lib/format";
import { fetchUpcomingOpportunities } from "@/lib/db/queries";
import type { EventCardData } from "@/components/event-card";
import { useAuth } from "@/hooks/use-auth";
import { useMyRegistrations } from "@/hooks/use-my-registrations";
import { Check } from "lucide-react";

const CATEGORY_GRADIENT: Record<string, string> = {
  Tech: "from-blue-600 to-blue-900",
  Career: "from-purple-600 to-purple-900",
  "Uni Vibe": "from-green-600 to-green-900",
  Sports: "from-orange-500 to-orange-800",
  Entertainment: "from-red-600 to-red-900",
  Academic: "from-indigo-600 to-indigo-900",
  Culture: "from-pink-600 to-pink-900",
};

export function BentoGrid({ events }: { events: EventCardData[] }) {
  const { user } = useAuth();
  const { registeredIds } = useMyRegistrations();
  const featured = events[0];

  const opps = useQuery({ queryKey: ["opps", "bento"], queryFn: () => fetchUpcomingOpportunities(50) });
  const streak = useQuery({
    queryKey: ["myStreak", user?.id ?? "anon"],
    queryFn: async () => {
      if (!user) return 0;
      const { data } = await supabase.from("registrations").select("id").eq("user_id", user.id);
      return data?.length ?? 0;
    },
    enabled: !!user,
  });

  if (!featured) return null;

  const gradient = CATEGORY_GRADIENT[featured.category] || "from-slate-700 to-slate-900";
  const lowest = featured.event_tickets ? lowestPrice(featured.event_tickets) : null;
  const isFree = featured.is_free || lowest === null;
  const isRegistered = registeredIds.has(featured.id);

  const oppsTotal = opps.data?.length ?? 0;
  const oppsSoon = (opps.data ?? []).filter((o) => { const d = daysUntil(o.deadline); return d >= 0 && d <= 7; }).length;
  const streakCount = streak.data ?? 0;

  return (
    <div className="grid gap-4 md:grid-cols-[1.4fr_1fr] md:grid-rows-2">
      {/* Featured */}
      <Link
        to="/events/$slug"
        params={{ slug: featured.slug }}
        className={`group relative md:row-span-2 overflow-hidden rounded-xl bg-gradient-to-br ${gradient} text-white min-h-[280px] md:min-h-[400px]`}
      >
        {featured.poster_url && (
          <img
            src={featured.poster_url}
            alt={featured.title}
            className="absolute inset-0 h-full w-full object-cover opacity-80 transition-transform group-hover:scale-[1.03]"
            onError={(e) => { e.currentTarget.style.display = "none"; }}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/20" />
        <span className="absolute top-4 left-4 rounded-full bg-white/20 backdrop-blur px-3 py-1 text-xs font-semibold">{featured.category}</span>
        {isRegistered && (
          <span className="absolute top-4 right-4 inline-flex items-center gap-1 rounded-full bg-success px-3 py-1 text-xs font-semibold text-success-foreground">
            <Check className="h-3.5 w-3.5" /> Registered
          </span>
        )}
        <div className="absolute bottom-0 left-0 right-0 p-5 md:p-6">
          <p className="text-xs md:text-sm font-bold tracking-wide text-yellow-300 mb-2">{formatEventDate(featured.date)}</p>
          <h3 className="text-2xl md:text-3xl font-bold leading-tight drop-shadow">{featured.title}</h3>
          <div className="mt-2 flex items-center gap-1.5 text-sm text-white/90">
            <MapPin className="h-4 w-4" /> <span className="line-clamp-1">{featured.venue || "Venue TBA"}</span>
          </div>
          <div className="mt-3 flex items-center justify-between">
            <span className="inline-flex items-center gap-1 text-sm font-medium opacity-90">View details <ArrowRight className="h-4 w-4" /></span>
            {isFree ? (
              <span className="rounded-md bg-success px-2.5 py-1 text-xs font-semibold text-success-foreground">FREE</span>
            ) : (
              <span className="rounded-md bg-white text-primary px-2.5 py-1 text-xs font-bold">KSh {Number(lowest).toLocaleString()}</span>
            )}
          </div>
        </div>
      </Link>

      {/* Opportunities */}
      <Link
        to="/opportunities"
        className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 text-white p-5 min-h-[140px] md:min-h-0 flex flex-col justify-between"
      >
        <div className="flex items-center justify-between">
          <span className="rounded-full bg-white/20 backdrop-blur px-3 py-1 text-xs font-semibold">Opportunities</span>
          <Briefcase className="h-6 w-6 opacity-80" />
        </div>
        <div>
          <p className="text-4xl font-bold">{oppsTotal}</p>
          <p className="text-sm text-white/90 mt-1">{oppsSoon} closing within 7 days</p>
        </div>
      </Link>

      {/* Streak */}
      <Link
        to="/dashboard"
        className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-orange-500 via-red-500 to-pink-600 text-white p-5 min-h-[140px] md:min-h-0 flex flex-col justify-between"
      >
        <div className="flex items-center justify-between">
          <span className="rounded-full bg-white/20 backdrop-blur px-3 py-1 text-xs font-semibold">Your Streak</span>
          <Flame className="h-6 w-6 opacity-90" />
        </div>
        <div>
          <p className="text-4xl font-bold">{streakCount}</p>
          <p className="text-sm text-white/90 mt-1">{streakCount > 0 ? "Keep showing up — you're on fire!" : "Register for your first event to start a streak"}</p>
        </div>
      </Link>
    </div>
  );
}
