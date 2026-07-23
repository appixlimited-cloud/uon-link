import { Link } from "@tanstack/react-router";
import { MapPin, Check, Loader2, Calendar, Clock, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatEventDate, lowestPrice } from "@/lib/format";
import { CATEGORY_COLOR } from "@/lib/categories";
import { useMyRegistrations } from "@/hooks/use-my-registrations";
import { useRegisterEvent } from "@/hooks/use-register-event";
import { useAuth } from "@/hooks/use-auth";

export type EventCardData = {
  id: string;
  slug: string;
  title: string;
  category: string;
  venue: string | null;
  date: string;
  time?: string | null;
  poster_url: string | null;
  is_free: boolean;
  event_tickets?: Array<{ is_enabled: boolean; price: number | string }>;
};

export function EventCard({ event }: { event: EventCardData }) {
  const lowest = event.event_tickets ? lowestPrice(event.event_tickets) : null;
  const isFree = event.is_free || lowest === null;
  const catClass = CATEGORY_COLOR[event.category] || "bg-primary text-primary-foreground";
  const { registeredIds } = useMyRegistrations();
  const { user } = useAuth();
  const register = useRegisterEvent();
  const isRegistered = registeredIds.has(event.id);
  const isRegistering = register.isPending && register.variables?.id === event.id;

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
      <Link
        to="/events/$slug"
        params={{ slug: event.slug }}
        className="relative block w-full overflow-hidden bg-muted"
        style={{ aspectRatio: "3 / 4" }}
      >
        {event.poster_url ? (
          <img
            src={event.poster_url}
            alt={event.title}
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={(e) => {
              const img = e.currentTarget;
              img.style.display = "none";
              img.parentElement?.classList.add(...catClass.split(" "));
            }}
          />
        ) : (
          <div className={`absolute inset-0 ${catClass}`} />
        )}
        <span className={`absolute left-3 top-3 rounded-full px-2.5 py-1 text-[11px] font-semibold shadow-sm ${catClass}`}>
          {event.category}
        </span>
        {isFree ? (
          <span className="absolute right-3 top-3 rounded-full bg-success px-2.5 py-1 text-[11px] font-bold text-success-foreground shadow-sm">
            FREE
          </span>
        ) : (
          <span className="absolute right-3 top-3 rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-bold text-primary shadow-sm">
            KSh {Number(lowest).toLocaleString()}
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col gap-2.5 p-5">
        <Link to="/events/$slug" params={{ slug: event.slug }}>
          <h3 className="line-clamp-2 text-base font-bold leading-snug tracking-tight transition-colors group-hover:text-primary">
            {event.title}
          </h3>
        </Link>

        <p className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
          <Building2 className="h-3.5 w-3.5" /> University of Nairobi
        </p>

        <div className="mt-1 space-y-1.5 text-xs text-muted-foreground">
          <p className="inline-flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5 text-primary" />
            <span className="font-medium text-foreground">{formatEventDate(event.date)}</span>
          </p>
          {event.time && (
            <p className="inline-flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-primary" /> {event.time}
            </p>
          )}
          <p className="inline-flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5 text-primary" />
            <span className="line-clamp-1">{event.venue || "Venue TBA"}</span>
          </p>
        </div>

        <div className="mt-auto pt-4">
          {isRegistered ? (
            <Link to="/events/$slug" params={{ slug: event.slug }} className="block">
              <Button className="h-10 w-full rounded-xl bg-success font-semibold text-success-foreground hover:bg-success/90">
                <Check className="mr-1.5 h-4 w-4" /> Registered
              </Button>
            </Link>
          ) : !user ? (
            <Link to="/auth" className="block">
              <Button className="h-10 w-full rounded-xl font-semibold">Register Now</Button>
            </Link>
          ) : (
            <Button
              className="h-10 w-full rounded-xl font-semibold"
              onClick={() => register.mutate({ id: event.id, slug: event.slug, is_free: isFree })}
              disabled={isRegistering}
            >
              {isRegistering ? (
                <>
                  <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> Registering…
                </>
              ) : (
                "Register Now"
              )}
            </Button>
          )}
        </div>
      </div>
    </article>
  );
}
