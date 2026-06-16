import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { ArrowLeft, Calendar, Clock, MapPin, Share2 } from "lucide-react";
import { PageShell } from "@/components/layout/page-shell";
import { Button } from "@/components/ui/button";
import { fetchEventBySlug } from "@/lib/db/queries";
import { formatEventDate, googleCalUrl, whatsappShare, lowestPrice } from "@/lib/format";
import { CATEGORY_COLOR } from "@/lib/categories";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";

export const Route = createFileRoute("/events/$slug")({
  component: EventDetailPage,
});

function EventDetailPage() {
  const { slug } = Route.useParams();
  const navigate = Route.useNavigate?.() ?? (() => {});
  const { user } = useAuth();
  const qc = useQueryClient();
  const [tier, setTier] = useState<string>("");

  const { data: event, isLoading } = useQuery({ queryKey: ["event", slug], queryFn: () => fetchEventBySlug(slug) });
  const { data: existing } = useQuery({
    queryKey: ["registration", slug, user?.id],
    queryFn: async () => {
      if (!user || !event) return null;
      const { data } = await supabase.from("registrations").select("*").eq("event_id", event.id).eq("user_id", user.id).maybeSingle();
      return data;
    },
    enabled: !!user && !!event,
  });

  const tickets = (event?.event_tickets ?? []).filter((t: any) => t.is_enabled);
  const lowest = lowestPrice(event?.event_tickets ?? []);
  const isFree = event?.is_free || lowest === null;

  const register = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Please sign in");
      if (!event) throw new Error("Event not found");
      if (!isFree && !tier) throw new Error("Please select a ticket tier");
      const { data: profile } = await supabase.from("student_profiles").select("*").eq("user_id", user.id).maybeSingle();
      if (!profile?.is_verified) throw new Error("Please verify your account before registering");
      const { error } = await supabase.from("registrations").insert({
        event_id: event.id,
        user_id: user.id,
        student_name: profile.full_name,
        email: user.email!,
        registration_number: profile.registration_number,
        faculty: profile.faculty,
        year_of_study: profile.year_of_study,
        ticket_tier: isFree ? "Free" : tier,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Registered! See you there.");
      qc.invalidateQueries({ queryKey: ["registration", slug] });
    },
    onError: (e: any) => toast.error(e.message ?? "Could not register"),
  });

  if (isLoading) return <PageShell><div className="mx-auto max-w-4xl px-4 py-10">Loading...</div></PageShell>;
  if (!event) return <PageShell><div className="mx-auto max-w-4xl px-4 py-10"><Link to="/events" className="text-primary">← Back to events</Link><h1 className="text-2xl font-bold mt-4">Event not found</h1></div></PageShell>;

  const url = typeof window !== "undefined" ? window.location.href : "";
  const shareText = `Check out this event at UoN — ${event.title} on ${formatEventDate(event.date)} at ${event.venue || "TBA"}. Tickets from KSh ${lowest ?? 0}. Register here: ${url}`;

  return (
    <PageShell>
      <div className="mx-auto max-w-4xl px-4 py-8">
        <Link to="/events" className="inline-flex items-center gap-1 text-sm text-primary hover:underline mb-4"><ArrowLeft className="h-4 w-4" /> Back to Events</Link>
        <div className="aspect-[21/9] w-full overflow-hidden rounded-lg bg-muted mb-6">
          {event.poster_url ? <img src={event.poster_url} alt={event.title} className="h-full w-full object-cover" /> : (
            <div className="flex h-full items-center justify-center"><span className={`rounded px-3 py-1 text-sm ${CATEGORY_COLOR[event.category] || "bg-primary text-white"}`}>{event.category}</span></div>
          )}
        </div>
        <div className="flex items-center gap-2 mb-2">
          <span className={`rounded px-2 py-0.5 text-xs font-semibold ${CATEGORY_COLOR[event.category] || "bg-primary text-white"}`}>{event.category}</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold">{event.title}</h1>
        <div className="mt-4 flex flex-wrap gap-4 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-1.5"><Calendar className="h-4 w-4" /> {formatEventDate(event.date)}</span>
          {event.time && <span className="inline-flex items-center gap-1.5"><Clock className="h-4 w-4" /> {event.time}</span>}
          {event.venue && <span className="inline-flex items-center gap-1.5"><MapPin className="h-4 w-4" /> {event.venue}</span>}
        </div>

        {event.description && <p className="mt-6 whitespace-pre-wrap text-base leading-relaxed">{event.description}</p>}

        <section className="mt-8">
          <h2 className="text-xl font-bold mb-3">Tickets</h2>
          {isFree ? (
            <div className="rounded-lg border border-success bg-success/10 p-5">
              <span className="rounded bg-success px-2.5 py-1 text-sm font-semibold text-success-foreground">FREE</span>
              <p className="mt-2 text-sm">This event is free to attend.</p>
            </div>
          ) : (
            <div className="grid gap-3 md:grid-cols-3">
              {tickets.map((t: any) => (
                <label key={t.id} className={`cursor-pointer rounded-lg border-2 p-4 transition-colors ${tier === t.tier_name ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"}`}>
                  <input type="radio" name="tier" value={t.tier_name} checked={tier === t.tier_name} onChange={() => setTier(t.tier_name)} className="sr-only" />
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">{t.tier_name}</span>
                    <span className="text-lg font-bold text-primary">KSh {Number(t.price).toLocaleString()}</span>
                  </div>
                  {t.description && <p className="mt-2 text-xs text-muted-foreground">{t.description}</p>}
                </label>
              ))}
            </div>
          )}
        </section>

        <div className="mt-6 flex flex-wrap gap-3">
          {existing ? (
            <Button disabled size="lg" variant="outline">✓ Registered as {existing.ticket_tier}</Button>
          ) : user ? (
            <Button size="lg" onClick={() => register.mutate()} disabled={register.isPending || (!isFree && !tier)}>{register.isPending ? "Registering..." : "Register"}</Button>
          ) : (
            <Link to="/auth"><Button size="lg">Sign in to register</Button></Link>
          )}
          <a href={whatsappShare(shareText)} target="_blank" rel="noopener noreferrer"><Button size="lg" variant="outline"><Share2 className="h-4 w-4 mr-1.5" /> Share on WhatsApp</Button></a>
          <a href={googleCalUrl({ title: event.title, date: event.date, time: event.time, venue: event.venue, description: event.description })} target="_blank" rel="noopener noreferrer"><Button size="lg" variant="outline"><Calendar className="h-4 w-4 mr-1.5" /> Add to Google Calendar</Button></a>
        </div>
      </div>
    </PageShell>
  );
}
