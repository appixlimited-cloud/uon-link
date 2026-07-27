import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Download, Share2, Calendar, MapPin, Clock, User, Ticket as TicketIcon } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import QRCodeLib from "qrcode";
import { jsPDF } from "jspdf";
import { PageShell } from "@/components/layout/page-shell";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { formatEventDate } from "@/lib/format";
import { verifyUrl } from "@/lib/ticket-url";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/tickets/$ticketId")({
  head: () => ({ meta: [{ title: "My Ticket — UoN Link" }] }),
  component: TicketPage,
});

function TicketPage() {
  const { ticketId } = Route.useParams();
  const { user } = Route.useRouteContext();
  const [verifyLink, setVerifyLink] = useState("");
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setVerifyLink(verifyUrl(ticketId)); }, [ticketId]);

  const { data, isLoading } = useQuery({
    queryKey: ["ticket", ticketId],
    queryFn: async () => {
      const { data } = await (supabase as any)
        .from("tickets")
        .select("id, ticket_code, ticket_tier, status, seat_number, created_at, events(id, slug, title, date, time, venue, category, poster_url, description), registrations(student_name, email)")
        .eq("ticket_code", ticketId)
        .eq("user_id", user.id)
        .maybeSingle();
      if (data?.events) {
        data.events = { ...data.events, poster_url: await resolveEventPosterUrl(data.events.poster_url) };
      }
      return data;
    },
  });

  async function downloadPdf() {
    if (!data) return;
    try {
      const qrDataUrl = await QRCodeLib.toDataURL(verifyLink, { width: 400, margin: 1 });
      const pdf = new jsPDF({ unit: "mm", format: "a5", orientation: "portrait" });
      const w = pdf.internal.pageSize.getWidth();

      pdf.setFillColor(15, 23, 42);
      pdf.rect(0, 0, w, 30, "F");
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(18);
      pdf.setFont("helvetica", "bold");
      pdf.text("UoN Link", 12, 13);
      pdf.setFontSize(10);
      pdf.setFont("helvetica", "normal");
      pdf.text("Event Ticket", 12, 20);

      pdf.setTextColor(15, 23, 42);
      pdf.setFontSize(15);
      pdf.setFont("helvetica", "bold");
      const title = pdf.splitTextToSize(data.events?.title ?? "Event", w - 24);
      pdf.text(title, 12, 42);

      let y = 42 + title.length * 6;
      pdf.setFontSize(10);
      pdf.setFont("helvetica", "normal");
      const rows: [string, string][] = [
        ["Attendee", data.registrations?.student_name ?? "—"],
        ["Ticket type", data.ticket_tier],
        ["Ticket ID", data.ticket_code],
        ...(data.seat_number ? [["Seat", data.seat_number] as [string, string]] : []),
        ["Date", data.events ? formatEventDate(data.events.date) : "—"],
        ...(data.events?.time ? [["Time", data.events.time] as [string, string]] : []),
        ["Venue", data.events?.venue ?? "TBA"],
        ["Organiser", "University of Nairobi"],
        ["Status", (data.status as string).toUpperCase()],
      ];
      rows.forEach(([k, v]) => {
        y += 6;
        pdf.setTextColor(120, 120, 130);
        pdf.text(k, 12, y);
        pdf.setTextColor(15, 23, 42);
        pdf.text(String(v), 55, y);
      });

      pdf.addImage(qrDataUrl, "PNG", w / 2 - 30, y + 8, 60, 60);
      pdf.setFontSize(8);
      pdf.setTextColor(120, 120, 130);
      pdf.text("Scan at entrance to check in", w / 2, y + 74, { align: "center" });

      pdf.save(`ticket-${data.ticket_code.slice(0, 8)}.pdf`);
    } catch (e: any) {
      toast.error("Could not generate PDF: " + (e?.message ?? "unknown"));
    }
  }

  async function shareTicket() {
    if (!data) return;
    const shareData = {
      title: `Ticket — ${data.events?.title}`,
      text: `My ticket for ${data.events?.title} on ${data.events ? formatEventDate(data.events.date) : ""}`,
      url: verifyLink,
    };
    if (typeof navigator !== "undefined" && (navigator as any).share) {
      try { await (navigator as any).share(shareData); return; } catch {}
    }
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      await navigator.clipboard.writeText(verifyLink);
      toast.success("Verification link copied");
    }
  }

  if (isLoading) return <PageShell><div className="mx-auto max-w-2xl px-4 py-16 text-center text-muted-foreground">Loading ticket…</div></PageShell>;
  if (!data) return (
    <PageShell>
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <h1 className="text-2xl font-bold">Ticket not found</h1>
        <p className="mt-2 text-muted-foreground">This ticket doesn't exist or isn't yours.</p>
        <Link to="/my-tickets" className="mt-4 inline-block text-primary hover:underline">← My Tickets</Link>
      </div>
    </PageShell>
  );

  const statusColor = data.status === "active" ? "bg-green-100 text-green-700" : data.status === "used" ? "bg-orange-100 text-orange-700" : data.status === "cancelled" ? "bg-red-100 text-red-700" : "bg-slate-200 text-slate-600";

  return (
    <PageShell>
      <div className="bg-slate-50 min-h-screen py-8">
        <div className="mx-auto max-w-lg px-4">
          <Link to="/my-tickets" className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary">
            <ArrowLeft className="h-4 w-4" /> My Tickets
          </Link>

          <div ref={cardRef} className="overflow-hidden rounded-3xl bg-white shadow-lg">
            {data.events?.poster_url && (
              <div className="aspect-[16/9] w-full overflow-hidden bg-slate-100">
                <img src={data.events.poster_url} alt="" className="h-full w-full object-cover" />
              </div>
            )}
            <div className="p-6">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-primary">{data.events?.category}</p>
                  <h1 className="mt-1 text-xl font-bold leading-tight">{data.events?.title}</h1>
                </div>
                <span className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase ${statusColor}`}>{data.status}</span>
              </div>

              <dl className="mt-4 space-y-2.5 text-sm">
                <Info icon={<User className="h-4 w-4" />} label="Attendee" value={data.registrations?.student_name ?? "—"} />
                <Info icon={<TicketIcon className="h-4 w-4" />} label="Ticket" value={`${data.ticket_tier}${data.seat_number ? " · Seat " + data.seat_number : ""}`} />
                {data.events && <Info icon={<Calendar className="h-4 w-4" />} label="Date" value={formatEventDate(data.events.date)} />}
                {data.events?.time && <Info icon={<Clock className="h-4 w-4" />} label="Time" value={data.events.time} />}
                {data.events?.venue && <Info icon={<MapPin className="h-4 w-4" />} label="Venue" value={data.events.venue} />}
              </dl>
            </div>

            {/* Tear line */}
            <div className="relative">
              <div className="border-t-2 border-dashed border-slate-200" />
              <div className="absolute -left-3 -top-3 h-6 w-6 rounded-full bg-slate-50" />
              <div className="absolute -right-3 -top-3 h-6 w-6 rounded-full bg-slate-50" />
            </div>

            <div className="p-6 text-center">
              <div className="inline-block rounded-2xl bg-white p-3 ring-1 ring-slate-200">
                {verifyLink && <QRCodeSVG value={verifyLink} size={200} level="M" />}
              </div>
              <p className="mt-3 text-xs text-muted-foreground">Show this QR at the entrance</p>
              <p className="mt-1 font-mono text-[11px] text-slate-500">#{data.ticket_code}</p>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <Button variant="outline" className="rounded-2xl" onClick={shareTicket}>
              <Share2 className="mr-1.5 h-4 w-4" /> Share
            </Button>
            <Button className="rounded-2xl" onClick={downloadPdf}>
              <Download className="mr-1.5 h-4 w-4" /> Download PDF
            </Button>
          </div>
          <p className="mt-3 text-center text-xs text-muted-foreground">
            Tip: to save this ticket to your phone, download the PDF or take a screenshot.
          </p>
        </div>
      </div>
    </PageShell>
  );
}

function Info({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 text-muted-foreground">{icon}</span>
      <div className="flex-1">
        <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</p>
        <p className="font-medium">{value}</p>
      </div>
    </div>
  );
}
