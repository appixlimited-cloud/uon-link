import { Link } from "@tanstack/react-router";
import { MapPin, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatEventDate, lowestPrice } from "@/lib/format";
import { CATEGORY_COLOR } from "@/lib/categories";

export type EventCardData = {
  id: string;
  slug: string;
  title: string;
  category: string;
  venue: string | null;
  date: string;
  poster_url: string | null;
  is_free: boolean;
  event_tickets?: Array<{ is_enabled: boolean; price: number | string }>;
};

export function EventCard({ event }: { event: EventCardData }) {
  const lowest = event.event_tickets ? lowestPrice(event.event_tickets) : null;
  const isFree = event.is_free || lowest === null;
  return (
    <article className="group flex flex-col overflow-hidden rounded-lg border border-border bg-card transition-colors hover:border-primary/40">
      <div className="aspect-[16/10] w-full overflow-hidden bg-muted">
        {event.poster_url ? (
          <img src={event.poster_url} alt={event.title} loading="lazy" className="h-full w-full object-cover transition-transform group-hover:scale-[1.02]" />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-primary/10">
            <span className={`text-xs px-2 py-1 rounded ${CATEGORY_COLOR[event.category] || "bg-primary text-primary-foreground"}`}>{event.category}</span>
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <p className="text-xs font-bold text-primary tracking-wide">{formatEventDate(event.date)}</p>
        <h3 className="line-clamp-2 text-base font-semibold">{event.title}</h3>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <MapPin className="h-3.5 w-3.5" />
          <span className="line-clamp-1">{event.venue || "Venue TBA"}</span>
        </div>
        <div className="mt-auto flex items-center justify-between pt-3">
          {isFree ? (
            <span className="rounded-md bg-success px-2 py-1 text-xs font-semibold text-success-foreground">FREE</span>
          ) : (
            <span className="rounded-md bg-primary px-2 py-1 text-xs font-semibold text-primary-foreground">KSh {Number(lowest).toLocaleString()}</span>
          )}
          <Link to="/events/$slug" params={{ slug: event.slug }}>
            <Button size="sm">Register</Button>
          </Link>
        </div>
      </div>
    </article>
  );
}
