import { Link } from "@tanstack/react-router";
import { MapPin } from "lucide-react";
import { formatEventDate, lowestPrice } from "@/lib/format";
import { CATEGORY_COLOR } from "@/lib/categories";
import { WhosGoing } from "@/components/whos-going";
import { RegisterButton } from "@/components/register-button";

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
  const catClass = CATEGORY_COLOR[event.category] || "bg-primary text-primary-foreground";
  return (
    <article className="group flex flex-col overflow-hidden rounded-lg border border-border bg-card transition-colors hover:border-primary/40">
      <Link to="/events/$slug" params={{ slug: event.slug }} className="relative w-full overflow-hidden bg-muted h-[140px] md:h-[160px] block">
        {event.poster_url ? (
          <img
            src={event.poster_url}
            alt={event.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform group-hover:scale-[1.02]"
            onError={(e) => {
              const img = e.currentTarget;
              img.style.display = "none";
              img.parentElement?.classList.add(...catClass.split(" "));
            }}
          />
        ) : (
          <div className={`flex h-full w-full items-center justify-center ${catClass}`} />
        )}
        <span className={`absolute top-2 left-2 text-xs px-2 py-1 rounded shadow ${catClass}`}>{event.category}</span>
      </Link>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <p className="text-xs font-bold text-primary tracking-wide">{formatEventDate(event.date)}</p>
        <h3 className="line-clamp-2 text-base font-semibold">{event.title}</h3>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <MapPin className="h-3.5 w-3.5" />
          <span className="line-clamp-1">{event.venue || "Venue TBA"}</span>
        </div>
        <WhosGoing eventId={event.id} size="xs" />
        <div className="mt-auto flex items-center justify-between pt-3 gap-2">
          {isFree ? (
            <span className="rounded-md bg-success px-2 py-1 text-xs font-semibold text-success-foreground">FREE</span>
          ) : (
            <span className="rounded-md bg-primary px-2 py-1 text-xs font-semibold text-primary-foreground">KSh {Number(lowest).toLocaleString()}</span>
          )}
          <RegisterButton eventId={event.id} eventTitle={event.title} ticketTier={isFree ? "Free" : null} />
        </div>
      </div>
    </article>
  );
}
