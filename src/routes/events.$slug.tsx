import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import {
  ArrowLeft,
  Calendar,
  Check,
  Clock,
  Loader2,
  MapPin,
  Share2,
  Bookmark,
  BookmarkCheck,
  Users,
  Ticket,
  Building2,
  ChevronDown,
} from "lucide-react";
import { PageShell } from "@/components/layout/page-shell";
import { Button } from "@/components/ui/button";
import { fetchEventBySlug } from "@/lib/db/queries";
import { formatEventDate, googleCalUrl, whatsappShare, lowestPrice } from "@/lib/format";
import { CATEGORY_COLOR } from "@/lib/categories";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useRegisterEvent } from "@/hooks/use-register-event";
import { toast } from "sonner";

export const Route = createFileRoute("/events/$slug")({
  component: EventDetailPage,
});

const FAQS = [
  {
    q: "Do I need a student ID to attend?",
    a: "Yes. Please bring your UoN student ID along with the QR code shown after registration.",
  },
  {
    q: "Can I cancel my registration?",
    a: "You can cancel anytime from your dashboard. Your slot will be released for other students.",
  },
  {
    q: "Will there be food or refreshments?",
    a: "Refreshments depend on the organizer. Details will be shared via email closer to the date.",
  },
  {
    q: "How do I get in with my QR code?",
    a: "Show the QR code on your phone at the entrance. Our team will scan it to check you in.",
  },
];

function EventDetailPage() {
  const { slug } = Route.useParams();
  const { user } = useAuth();
  const [tier, setTier] = useState<string>("");
  const [saved, setSaved] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const { data: event, isLoading } = useQuery({
    queryKey: ["event", slug],
    queryFn: () => fetchEventBySlug(slug),
  });
  const { data: existing } = useQuery({
    queryKey: ["registration", slug, user?.id],
    queryFn: async () => {
      if (!user || !event) return null;
      const { data } = await supabase
        .from("registrations")
        .select("*")
        .eq("event_id", event.id)
        .eq("user_id", user.id)
        .maybeSingle();
      return data;
    },
    enabled: !!user && !!event,
  });

  const tickets = (event?.event_tickets ?? []).filter((t: any) => t.is_enabled);
  const lowest = lowestPrice(event?.event_tickets ?? []);
  const isFree = event?.is_free || lowest === null;
  const register = useRegisterEvent();

  if (isLoading)
    return (
      <PageShell>
        <div className="mx-auto max-w-6xl px-4 py-16 text-center text-muted-foreground">Loading event…</div>
      </PageShell>
    );
  if (!event)
    return (
      <PageShell>
        <div className="mx-auto max-w-4xl px-4 py-10">
          <Link to="/events" className="text-primary">
            ← Back to events
          </Link>
          <h1 className="mt-4 text-2xl font-bold">Event not found</h1>
        </div>
      </PageShell>
    );

  const url = typeof window !== "undefined" ? window.location.href : "";
  const shareText = `Check out ${event.title} on ${formatEventDate(event.date)} at ${event.venue || "TBA"} — ${url}`;
  const catClass = CATEGORY_COLOR[event.category] || "bg-primary text-primary-foreground";

  const handleShare = async () => {
    if (typeof navigator !== "undefined" && (navigator as any).share) {
      try {
        await (navigator as any).share({ title: event.title, text: shareText, url });
        return;
      } catch {
        /* fall through */
      }
    }
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      await navigator.clipboard.writeText(url);
      toast.success("Link copied to clipboard");
    }
  };

  const qrValue = existing ? JSON.stringify({ r: existing.id, e: event.id, u: user?.id }) : "";

  return (
    <PageShell>
      <div className="mx-auto max-w-6xl px-4 py-6 md:py-10">
        <Link
          to="/events"
          className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Events
        </Link>

        {/* HERO — two column */}
        <div className="grid gap-6 md:gap-8 lg:grid-cols-[1.15fr_1fr]">
          {/* Poster */}
          <div className={`relative overflow-hidden rounded-2xl shadow-lg ring-1 ring-border/60 ${catClass}`}>
            <div className="w-full">
              {event.poster_url && (
                <img
                  src={event.poster_url}
                  alt={event.title}
                  className="w-full h-auto object-contain transition-transform duration-500 hover:scale-[1.02]"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              )}
            </div>
            <span
              className={`absolute left-4 top-4 rounded-full px-3 py-1 text-xs font-semibold shadow-md ${catClass}`}
            >
              {event.category}
            </span>
          </div>

          {/* Info card */}
          <aside className="lg:sticky lg:top-6 lg:self-start">
            <div className="rounded-2xl border border-border/70 bg-card p-6 shadow-lg md:p-7">
              <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${catClass}`}>
                {event.category}
              </span>
              <h1 className="mt-3 text-2xl font-bold leading-tight tracking-tight md:text-3xl">
                {event.title}
              </h1>
              <p className="mt-2 inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                <Building2 className="h-4 w-4" /> Hosted by University of Nairobi
              </p>

              <dl className="mt-5 space-y-3.5 border-t border-border/60 pt-5 text-sm">
                <InfoRow icon={<Calendar className="h-4 w-4" />} label="Date" value={formatEventDate(event.date)} />
                {event.time && (
                  <InfoRow icon={<Clock className="h-4 w-4" />} label="Time" value={event.time} />
                )}
                <InfoRow
                  icon={<MapPin className="h-4 w-4" />}
                  label="Venue"
                  value={event.venue || "Venue to be announced"}
                />
                <InfoRow
                  icon={<Ticket className="h-4 w-4" />}
                  label="Price"
                  value={
                    isFree ? (
                      <span className="font-semibold text-success">FREE</span>
                    ) : (
                      <span className="font-semibold text-primary">
                        From KSh {Number(lowest).toLocaleString()}
                      </span>
                    )
                  }
                />
                <InfoRow
                  icon={<Users className="h-4 w-4" />}
                  label="Slots"
                  value={<span className="text-muted-foreground">Limited seats available</span>}
                />
              </dl>

              {/* Ticket tiers */}
              {!isFree && tickets.length > 0 && (
                <div className="mt-5 space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Select ticket
                  </p>
                  <div className="space-y-2">
                    {tickets.map((t: any) => (
                      <label
                        key={t.id}
                        className={`flex cursor-pointer items-center justify-between rounded-xl border-2 p-3 transition-all ${
                          tier === t.tier_name
                            ? "border-primary bg-primary/5 shadow-sm"
                            : "border-border hover:border-primary/40"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="radio"
                            name="tier"
                            value={t.tier_name}
                            checked={tier === t.tier_name}
                            onChange={() => setTier(t.tier_name)}
                            className="sr-only"
                          />
                          <span
                            className={`grid h-4 w-4 place-items-center rounded-full border-2 ${
                              tier === t.tier_name ? "border-primary" : "border-muted-foreground/40"
                            }`}
                          >
                            {tier === t.tier_name && <span className="h-2 w-2 rounded-full bg-primary" />}
                          </span>
                          <div>
                            <p className="text-sm font-semibold">{t.tier_name}</p>
                            {t.description && (
                              <p className="text-xs text-muted-foreground">{t.description}</p>
                            )}
                          </div>
                        </div>
                        <span className="text-sm font-bold text-primary">
                          KSh {Number(t.price).toLocaleString()}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* CTA */}
              <div className="mt-6">
                {existing ? (
                  <div className="rounded-xl border-2 border-success bg-success/10 p-4 text-center">
                    <div className="inline-flex items-center gap-2 font-semibold text-success">
                      <Check className="h-5 w-5" /> You're Registered
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Show this QR at the entrance to check in
                    </p>
                    <div className="mt-4 flex justify-center">
                      <div className="rounded-xl bg-white p-3 shadow-sm">
                        <QRCodeSVG value={qrValue} size={148} level="M" />
                      </div>
                    </div>
                  </div>
                ) : user ? (
                  <Button
                    size="lg"
                    className="h-12 w-full rounded-xl text-base font-semibold shadow-md transition-transform hover:scale-[1.01] active:scale-[0.99]"
                    onClick={() =>
                      register.mutate({ id: event.id, slug, is_free: isFree, ticket_tier: tier })
                    }
                    disabled={register.isPending || (!isFree && !tier)}
                  >
                    {register.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" /> Registering…
                      </>
                    ) : (
                      "Register Now"
                    )}
                  </Button>
                ) : (
                  <Link to="/auth">
                    <Button
                      size="lg"
                      className="h-12 w-full rounded-xl text-base font-semibold shadow-md"
                    >
                      Sign in to register
                    </Button>
                  </Link>
                )}
              </div>

              {/* Share / Save */}
              <div className="mt-4 grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  className="rounded-xl transition-transform hover:scale-[1.02]"
                  onClick={handleShare}
                >
                  <Share2 className="mr-1.5 h-4 w-4" /> Share
                </Button>
                <Button
                  variant="outline"
                  className="rounded-xl transition-transform hover:scale-[1.02]"
                  onClick={() => {
                    setSaved((s) => !s);
                    toast.success(saved ? "Removed from saved" : "Saved to your list");
                  }}
                >
                  {saved ? (
                    <>
                      <BookmarkCheck className="mr-1.5 h-4 w-4" /> Saved
                    </>
                  ) : (
                    <>
                      <Bookmark className="mr-1.5 h-4 w-4" /> Save
                    </>
                  )}
                </Button>
              </div>

              <a
                href={googleCalUrl({
                  title: event.title,
                  date: event.date,
                  time: event.time,
                  venue: event.venue,
                  description: event.description,
                })}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 block"
              >
                <Button variant="ghost" className="w-full rounded-xl text-sm">
                  <Calendar className="mr-1.5 h-4 w-4" /> Add to Google Calendar
                </Button>
              </a>
              <a
                href={whatsappShare(shareText)}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 block"
              >
                <Button variant="ghost" className="w-full rounded-xl text-sm">
                  Share on WhatsApp
                </Button>
              </a>
            </div>
          </aside>
        </div>

        {/* SECTIONS */}
        <div className="mt-10 grid gap-6 lg:grid-cols-[1.15fr_1fr] lg:gap-8">
          <div className="space-y-6">
            <Section title="About this event">
              {event.description ? (
                <p className="whitespace-pre-wrap text-base leading-relaxed text-foreground/90">
                  {event.description}
                </p>
              ) : (
                <p className="text-muted-foreground">
                  Join us for {event.title}. More details coming soon.
                </p>
              )}
            </Section>

            <Section title="Schedule">
              <ol className="space-y-4">
                {[
                  { time: event.time || "9:00 AM", label: "Doors open & check-in" },
                  { time: "—", label: "Welcome & opening remarks" },
                  { time: "—", label: "Main program" },
                  { time: "—", label: "Networking & close" },
                ].map((item, i) => (
                  <li key={i} className="flex gap-4">
                    <div className="w-20 shrink-0 text-sm font-semibold text-primary">{item.time}</div>
                    <div className="flex-1 border-l-2 border-primary/20 pl-4 text-sm text-foreground/90">
                      {item.label}
                    </div>
                  </li>
                ))}
              </ol>
              <p className="mt-4 text-xs text-muted-foreground">
                Full schedule will be shared by the organizer closer to the event date.
              </p>
            </Section>

            <Section title="Speakers">
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="rounded-xl border border-border/60 bg-card p-4 text-center transition-shadow hover:shadow-md"
                  >
                    <div className={`mx-auto h-16 w-16 rounded-full ${catClass}`} />
                    <p className="mt-3 text-sm font-semibold">Speaker TBA</p>
                    <p className="text-xs text-muted-foreground">Guest</p>
                  </div>
                ))}
              </div>
            </Section>

            <Section title="Frequently Asked Questions">
              <div className="divide-y divide-border/60">
                {FAQS.map((f, i) => {
                  const open = openFaq === i;
                  return (
                    <button
                      key={i}
                      onClick={() => setOpenFaq(open ? null : i)}
                      className="flex w-full items-start justify-between gap-4 py-4 text-left transition-colors hover:text-primary"
                    >
                      <div className="flex-1">
                        <p className="text-sm font-semibold">{f.q}</p>
                        {open && (
                          <p className="mt-2 text-sm text-muted-foreground animate-fade-in">{f.a}</p>
                        )}
                      </div>
                      <ChevronDown
                        className={`mt-0.5 h-4 w-4 shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
                      />
                    </button>
                  );
                })}
              </div>
            </Section>
          </div>

          {/* Right column: location */}
          <div className="space-y-6">
            <Section title="Location">
              <div className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                <div>
                  <p className="font-semibold">{event.venue || "Venue to be announced"}</p>
                  <p className="text-sm text-muted-foreground">University of Nairobi, Kenya</p>
                </div>
              </div>
              <div className="mt-4 overflow-hidden rounded-xl border border-border/60">
                <iframe
                  title="Event location"
                  src={`https://www.google.com/maps?q=${encodeURIComponent(
                    (event.venue || "University of Nairobi") + ", Nairobi, Kenya",
                  )}&output=embed`}
                  className="h-64 w-full"
                  loading="lazy"
                />
              </div>
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                  (event.venue || "University of Nairobi") + ", Nairobi, Kenya",
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-block text-sm font-semibold text-primary hover:underline"
              >
                Open in Google Maps →
              </a>
            </Section>
          </div>
        </div>
      </div>
    </PageShell>
  );
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-muted text-muted-foreground">
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</dt>
        <dd className="mt-0.5 text-sm font-medium text-foreground">{value}</dd>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-border/70 bg-card p-6 shadow-sm transition-shadow hover:shadow-md md:p-7">
      <h2 className="mb-4 text-xl font-bold tracking-tight">{title}</h2>
      {children}
    </section>
  );
}
