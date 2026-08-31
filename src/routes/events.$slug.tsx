import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
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
  Minus,
  Plus,
  Mail,
} from "lucide-react";
import { PageShell } from "@/components/layout/page-shell";
import { Button } from "@/components/ui/button";
import { fetchEventBySlug, fetchPublishedEvents } from "@/lib/db/queries";
import { formatEventDate, googleCalUrl, whatsappShare, lowestPrice } from "@/lib/format";
import { CATEGORY_COLOR } from "@/lib/categories";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useRegisterEvent } from "@/hooks/use-register-event";
import { EventCard } from "@/components/event-card";
import { toast } from "sonner";

export const Route = createFileRoute("/events/$slug")({
  component: EventDetailPage,
});

const FAQS = [
  { q: "Do I need a student ID to attend?", a: "Yes. Please bring your UoN student ID along with the QR code shown after registration." },
  { q: "Can I cancel my registration?", a: "You can cancel anytime from your dashboard. Your slot will be released for other students." },
  { q: "Will there be food or refreshments?", a: "Refreshments depend on the organizer. Details will be shared via email closer to the date." },
  { q: "How do I get in with my QR code?", a: "Show the QR code on your phone at the entrance. Our team will scan it to check you in." },
];

function EventDetailPage() {
  const { slug } = Route.useParams();
  const { user } = useAuth();
  const [tier, setTier] = useState<string>("");
  const [qty, setQty] = useState<number>(1);
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
  const { data: related } = useQuery({
    queryKey: ["events", "related", event?.category, event?.id],
    queryFn: async () => {
      const all = await fetchPublishedEvents();
      return all.filter((e: any) => e.id !== event?.id && e.category === event?.category).slice(0, 3);
    },
    enabled: !!event,
  });

  const tickets = (event?.event_tickets ?? []).filter((t: any) => t.is_enabled);
  const lowest = lowestPrice(event?.event_tickets ?? []);
  const isFree = event?.is_free || lowest === null;
  const register = useRegisterEvent();

  const selectedTicket = useMemo(
    () => tickets.find((t: any) => t.tier_name === tier),
    [tickets, tier],
  );
  const total = selectedTicket ? Number(selectedTicket.price) * qty : 0;

  const { data: myTicket } = useQuery({
    queryKey: ["event-ticket", event?.id, user?.id],
    queryFn: async () => {
      if (!user || !event) return null;
      const { data } = await (supabase as any).from("tickets").select("ticket_code").eq("event_id", event.id).eq("user_id", user.id).maybeSingle();
      return data;
    },
    enabled: !!user && !!event && !!existing,
  });


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
          <Link to="/events" className="text-primary">← Back to events</Link>
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
      } catch { /* fall through */ }
    }
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      await navigator.clipboard.writeText(url);
      toast.success("Link copied to clipboard");
    }
  };

  const qrValue = myTicket ? `${typeof window !== "undefined" ? window.location.origin : ""}/verify/${myTicket.ticket_code}` : "";


  return (
    <PageShell>
      <div className="bg-[#F8FAFC]">
        <div className="mx-auto max-w-6xl px-4 py-6 md:py-10">
          <Link to="/events" className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
            <ArrowLeft className="h-4 w-4" /> Back to Events
          </Link>

          {/* HERO */}
          <div className="grid gap-6 md:gap-8 lg:grid-cols-[1.1fr_1fr]">
            {/* Poster */}
            <div className="relative overflow-hidden rounded-3xl bg-card shadow-sm ring-1 ring-border/60">
              <div className="relative w-full bg-muted" style={{ aspectRatio: "3 / 4" }}>
                {event.poster_url ? (
                  <img
                    src={event.poster_url}
                    alt={event.title}
                    className="absolute inset-0 h-full w-full object-cover"
                    onError={(e) => {
                      const img = e.currentTarget;
                      img.style.display = "none";
                      img.parentElement?.classList.add(...catClass.split(" "));
                    }}
                  />
                ) : (
                  <div className={`absolute inset-0 ${catClass}`} />
                )}
                <span className={`absolute left-4 top-4 rounded-full px-3 py-1 text-xs font-semibold shadow-md ${catClass}`}>
                  {event.category}
                </span>
              </div>
            </div>

            {/* Info card */}
            <aside className="lg:sticky lg:top-6 lg:self-start">
              <div className="rounded-3xl border border-border/70 bg-card p-6 shadow-sm md:p-7">
                <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${catClass}`}>{event.category}</span>
                <h1 className="mt-3 text-2xl font-bold leading-tight tracking-tight md:text-3xl">{event.title}</h1>
                <p className="mt-2 inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Building2 className="h-4 w-4" /> Hosted by University of Nairobi
                </p>

                <dl className="mt-5 space-y-3.5 border-t border-border/60 pt-5 text-sm">
                  <InfoRow icon={<Calendar className="h-4 w-4" />} label="Date" value={formatEventDate(event.date)} />
                  {event.time && <InfoRow icon={<Clock className="h-4 w-4" />} label="Time" value={event.time} />}
                  <InfoRow icon={<MapPin className="h-4 w-4" />} label="Venue" value={event.venue || "Venue to be announced"} />
                  <InfoRow
                    icon={<Ticket className="h-4 w-4" />}
                    label="Price"
                    value={isFree ? <span className="font-semibold text-success">FREE</span> : <span className="font-semibold text-primary">From KSh {Number(lowest).toLocaleString()}</span>}
                  />
                  <InfoRow icon={<Users className="h-4 w-4" />} label="Slots" value={<span className="text-muted-foreground">Limited seats available</span>} />
                </dl>

                {/* Ticket selection cards */}
                {!isFree && tickets.length > 0 && !existing && (
                  <div className="mt-6 space-y-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Select ticket</p>
                    <div className="space-y-2.5">
                      {tickets.map((t: any) => {
                        const active = tier === t.tier_name;
                        return (
                          <button
                            key={t.id}
                            type="button"
                            onClick={() => { setTier(t.tier_name); setQty(1); }}
                            className={`w-full rounded-2xl border-2 p-4 text-left transition-all ${
                              active ? "border-primary bg-primary/5 shadow-md" : "border-border bg-card hover:border-primary/40 hover:shadow-sm"
                            }`}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2">
                                  <span className={`grid h-4 w-4 shrink-0 place-items-center rounded-full border-2 ${active ? "border-primary" : "border-muted-foreground/40"}`}>
                                    {active && <span className="h-2 w-2 rounded-full bg-primary" />}
                                  </span>
                                  <p className="text-sm font-semibold">{t.tier_name}</p>
                                </div>
                                {t.description && <p className="mt-1 pl-6 text-xs text-muted-foreground">{t.description}</p>}
                              </div>
                              <span className="shrink-0 text-base font-bold text-primary">KSh {Number(t.price).toLocaleString()}</span>
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    {/* Quantity + total */}
                    {selectedTicket && (
                      <div className="rounded-2xl border border-border/70 bg-muted/40 p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Quantity</p>
                            <p className="mt-0.5 text-xs text-muted-foreground">{selectedTicket.tier_name}</p>
                          </div>
                          <div className="inline-flex items-center gap-1 rounded-full border border-border bg-card p-1">
                            <button
                              type="button"
                              onClick={() => setQty((q) => Math.max(1, q - 1))}
                              disabled={qty <= 1}
                              className="grid h-8 w-8 place-items-center rounded-full text-primary transition-colors hover:bg-primary/10 disabled:opacity-40"
                              aria-label="Decrease quantity"
                            >
                              <Minus className="h-4 w-4" />
                            </button>
                            <span className="w-8 text-center text-sm font-bold tabular-nums">{qty}</span>
                            <button
                              type="button"
                              onClick={() => setQty((q) => Math.min(10, q + 1))}
                              disabled={qty >= 10}
                              className="grid h-8 w-8 place-items-center rounded-full text-primary transition-colors hover:bg-primary/10 disabled:opacity-40"
                              aria-label="Increase quantity"
                            >
                              <Plus className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                        <div className="mt-3 flex items-center justify-between border-t border-border/60 pt-3">
                          <span className="text-sm font-medium text-muted-foreground">Total</span>
                          <span className="text-lg font-bold text-primary">KSh {total.toLocaleString()}</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* CTA */}
                <div className="mt-6">
                  {existing ? (
                    <div className="rounded-2xl border-2 border-success bg-success/10 p-4 text-center">
                      <div className="inline-flex items-center gap-2 font-semibold text-success">
                        <Check className="h-5 w-5" /> You're Registered
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">Show this QR at the entrance to check in</p>
                      <div className="mt-4 flex justify-center">
                        <div className="rounded-2xl bg-white p-3 shadow-sm">
                          <QRCodeSVG value={qrValue} size={148} level="M" />
                        </div>
                      </div>
                    </div>
                  ) : user ? (
                    <Button
                      size="lg"
                      className="h-12 w-full rounded-2xl text-base font-semibold shadow-md transition-transform hover:scale-[1.01] active:scale-[0.99]"
                      onClick={() => register.mutate({ id: event.id, slug, is_free: isFree, ticket_tier: tier })}
                      disabled={register.isPending || (!isFree && !tier)}
                    >
                      {register.isPending ? (
                        <><Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> Registering…</>
                      ) : isFree ? "Register Now" : `Buy Ticket${qty > 1 ? `s (${qty})` : ""}`}
                    </Button>
                  ) : (
                    <Link to="/auth">
                      <Button size="lg" className="h-12 w-full rounded-2xl text-base font-semibold shadow-md">
                        Sign in to register
                      </Button>
                    </Link>
                  )}
                </div>

                {/* Share / Save */}
                <div className="mt-4 grid grid-cols-2 gap-2">
                  <Button variant="outline" className="rounded-2xl transition-transform hover:scale-[1.02]" onClick={handleShare}>
                    <Share2 className="mr-1.5 h-4 w-4" /> Share
                  </Button>
                  <Button
                    variant="outline"
                    className="rounded-2xl transition-transform hover:scale-[1.02]"
                    onClick={() => { setSaved((s) => !s); toast.success(saved ? "Removed from saved" : "Saved to your list"); }}
                  >
                    {saved ? <><BookmarkCheck className="mr-1.5 h-4 w-4" /> Saved</> : <><Bookmark className="mr-1.5 h-4 w-4" /> Save</>}
                  </Button>
                </div>

                <a
                  href={googleCalUrl({ title: event.title, date: event.date, time: event.time, venue: event.venue, description: event.description })}
                  target="_blank" rel="noopener noreferrer" className="mt-2 block"
                >
                  <Button variant="ghost" className="w-full rounded-2xl text-sm">
                    <Calendar className="mr-1.5 h-4 w-4" /> Add to Google Calendar
                  </Button>
                </a>
                <a href={whatsappShare(shareText)} target="_blank" rel="noopener noreferrer" className="mt-1 block">
                  <Button variant="ghost" className="w-full rounded-2xl text-sm">Share on WhatsApp</Button>
                </a>
              </div>
            </aside>
          </div>

          {/* SECTIONS */}
          <div className="mt-10 grid gap-6 lg:grid-cols-[1.1fr_1fr] lg:gap-8">
            <div className="space-y-6">
              <Section title="About this event">
                {event.description ? (
                  <p className="whitespace-pre-wrap text-base leading-relaxed text-foreground/90">{event.description}</p>
                ) : (
                  <p className="text-muted-foreground">Join us for {event.title}. More details coming soon.</p>
                )}
              </Section>

              <Section title="Event Schedule">
                <ol className="space-y-4">
                  {[
                    { time: event.time || "9:00 AM", label: "Doors open & check-in" },
                    { time: "—", label: "Welcome & opening remarks" },
                    { time: "—", label: "Main program" },
                    { time: "—", label: "Networking & close" },
                  ].map((item, i) => (
                    <li key={i} className="flex gap-4">
                      <div className="w-20 shrink-0 text-sm font-semibold text-primary">{item.time}</div>
                      <div className="flex-1 border-l-2 border-primary/20 pl-4 text-sm text-foreground/90">{item.label}</div>
                    </li>
                  ))}
                </ol>
                <p className="mt-4 text-xs text-muted-foreground">Full schedule will be shared by the organizer closer to the event date.</p>
              </Section>

              <Section title="Organizer">
                <div className="flex items-start gap-4">
                  <div className={`grid h-14 w-14 shrink-0 place-items-center rounded-2xl ${catClass}`}>
                    <Building2 className="h-6 w-6" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-base font-bold">University of Nairobi</p>
                    <p className="text-sm text-muted-foreground">Kenya's premier institution of higher learning, hosting events, opportunities and campus life across every faculty.</p>
                    <a href="mailto:appixlimited@gmail.com" className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline">
                      <Mail className="h-4 w-4" /> appixlimited@gmail.com
                    </a>
                  </div>
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
                          {open && <p className="mt-2 text-sm text-muted-foreground animate-fade-in">{f.a}</p>}
                        </div>
                        <ChevronDown className={`mt-0.5 h-4 w-4 shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
                      </button>
                    );
                  })}
                </div>
              </Section>
            </div>

            {/* Right column: location */}
            <div className="space-y-6">
              <Section title="Venue Map">
                <div className="flex items-start gap-3">
                  <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                  <div>
                    <p className="font-semibold">{event.venue || "Venue to be announced"}</p>
                    <p className="text-sm text-muted-foreground">University of Nairobi Main Campus, Nairobi, Kenya</p>
                  </div>
                </div>
                <div className="mt-4 overflow-hidden rounded-2xl border border-border/60">
                  <iframe
                    title="Event location"
                    src={`https://www.google.com/maps?q=${encodeURIComponent((event.venue || "University of Nairobi") + ", Nairobi, Kenya")}&output=embed`}
                    className="h-64 w-full"
                    loading="lazy"
                  />
                </div>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent((event.venue || "University of Nairobi") + ", Nairobi, Kenya")}`}
                  target="_blank" rel="noopener noreferrer"
                  className="mt-3 inline-block text-sm font-semibold text-primary hover:underline"
                >
                  Open in Google Maps →
                </a>
              </Section>
            </div>
          </div>

          {/* Related events */}
          {related && related.length > 0 && (
            <div className="mt-12">
              <div className="mb-5 flex items-end justify-between gap-3">
                <h2 className="text-2xl font-bold tracking-tight">Related Events</h2>
                <Link to="/events" className="text-sm font-semibold text-primary hover:underline">View all →</Link>
              </div>
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {related.map((e: any) => (
                  <EventCard key={e.id} event={e} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </PageShell>
  );
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-muted text-muted-foreground">{icon}</span>
      <div className="min-w-0 flex-1">
        <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</dt>
        <dd className="mt-0.5 text-sm font-medium text-foreground">{value}</dd>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-3xl border border-border/70 bg-card p-6 shadow-sm transition-shadow hover:shadow-md md:p-7">
      <h2 className="mb-4 text-xl font-bold tracking-tight">{title}</h2>
      {children}
    </section>
  );
}
