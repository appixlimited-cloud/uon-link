import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { CheckCircle2, XCircle, AlertTriangle, Clock, Camera, StopCircle } from "lucide-react";
import { Html5Qrcode } from "html5-qrcode";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { formatEventDate } from "@/lib/format";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/scanner")({
  head: () => ({ meta: [{ title: "Ticket Scanner — UoN Link" }] }),
  component: ScannerPage,
});

type Result = { state: "valid" | "used" | "invalid" | "expired"; ticket?: any; message?: string };

function extractCode(raw: string): string {
  // Accept a raw code or a full verify URL
  try {
    const url = new URL(raw);
    const parts = url.pathname.split("/").filter(Boolean);
    const idx = parts.indexOf("verify");
    if (idx >= 0 && parts[idx + 1]) return parts[idx + 1];
  } catch {}
  return raw.trim();
}

function ScannerPage() {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [manualCode, setManualCode] = useState("");
  const [processing, setProcessing] = useState(false);
  const { user } = Route.useRouteContext();
  const lastCodeRef = useRef<string>("");
  const cooldownRef = useRef<number>(0);

  useEffect(() => () => { scannerRef.current?.stop().catch(() => {}); }, []);

  async function startScan() {
    setResult(null);
    try {
      const qr = new Html5Qrcode("qr-reader");
      scannerRef.current = qr;
      await qr.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decoded) => {
          const now = Date.now();
          if (decoded === lastCodeRef.current && now < cooldownRef.current) return;
          lastCodeRef.current = decoded;
          cooldownRef.current = now + 3000;
          handleCode(decoded);
        },
        () => {},
      );
      setScanning(true);
    } catch (e: any) {
      toast.error("Cannot access camera: " + (e?.message ?? "denied"));
    }
  }

  async function stopScan() {
    try { await scannerRef.current?.stop(); } catch {}
    scannerRef.current = null;
    setScanning(false);
  }

  async function handleCode(raw: string) {
    if (processing) return;
    setProcessing(true);
    try {
      const code = extractCode(raw);
      const { data: t } = await (supabase as any)
        .from("tickets")
        .select("id, ticket_code, ticket_tier, status, seat_number, checked_in_at, events(title, date, venue), registrations(student_name, email)")
        .eq("ticket_code", code)
        .maybeSingle();
      if (!t) { setResult({ state: "invalid", message: "No ticket found for this code" }); return; }

      const eventPassed = t.events ? new Date(t.events.date + "T23:59:59") < new Date() : false;
      if (t.status === "cancelled") { setResult({ state: "invalid", ticket: t, message: "Cancelled ticket" }); return; }
      if (t.status === "used") { setResult({ state: "used", ticket: t }); return; }
      if (t.status === "expired" || eventPassed) { setResult({ state: "expired", ticket: t }); return; }

      const { error } = await (supabase as any)
        .from("tickets")
        .update({ status: "used", checked_in_at: new Date().toISOString(), checked_in_by: user.id })
        .eq("id", t.id)
        .eq("status", "active");
      if (error) { setResult({ state: "invalid", ticket: t, message: error.message }); return; }

      setResult({ state: "valid", ticket: { ...t, status: "used" } });
    } finally {
      setProcessing(false);
    }
  }

  const conf = result ? {
    valid: { icon: CheckCircle2, bg: "bg-green-50 border-green-500", text: "text-green-700", title: "Checked in ✓" },
    used: { icon: AlertTriangle, bg: "bg-orange-50 border-orange-500", text: "text-orange-700", title: "Already used" },
    invalid: { icon: XCircle, bg: "bg-red-50 border-red-500", text: "text-red-700", title: "Invalid" },
    expired: { icon: Clock, bg: "bg-slate-100 border-slate-400", text: "text-slate-700", title: "Expired" },
  }[result.state] : null;
  const Icon = conf?.icon;

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Ticket Scanner</h1>
        <p className="text-sm text-muted-foreground">Scan an attendee's QR code to check them in.</p>
      </div>

      <div className="rounded-2xl border bg-card p-4">
        <div id="qr-reader" className="mx-auto max-w-sm overflow-hidden rounded-xl bg-black" style={{ minHeight: scanning ? 300 : 0 }} />
        <div className="mt-4 flex gap-2">
          {!scanning ? (
            <Button onClick={startScan} className="flex-1"><Camera className="mr-1.5 h-4 w-4" /> Start scanning</Button>
          ) : (
            <Button onClick={stopScan} variant="outline" className="flex-1"><StopCircle className="mr-1.5 h-4 w-4" /> Stop</Button>
          )}
        </div>
      </div>

      <div className="rounded-2xl border bg-card p-4">
        <p className="text-sm font-semibold">Manual entry</p>
        <p className="text-xs text-muted-foreground">Paste a ticket code or verify link.</p>
        <div className="mt-2 flex gap-2">
          <Input value={manualCode} onChange={(e) => setManualCode(e.target.value)} placeholder="Ticket code or URL" />
          <Button disabled={!manualCode.trim() || processing} onClick={() => handleCode(manualCode)}>Verify</Button>
        </div>
      </div>

      {result && conf && Icon && (
        <div className={`rounded-2xl border-2 ${conf.bg} p-6`}>
          <div className="flex items-start gap-4">
            <Icon className={`h-10 w-10 shrink-0 ${conf.text}`} />
            <div className="flex-1 min-w-0">
              <p className={`text-lg font-bold ${conf.text}`}>{conf.title}</p>
              {result.message && <p className="mt-0.5 text-sm text-muted-foreground">{result.message}</p>}
              {result.ticket && (
                <dl className="mt-3 space-y-1 text-sm">
                  {result.ticket.registrations?.student_name && <Row label="Attendee" value={result.ticket.registrations.student_name} />}
                  {result.ticket.events?.title && <Row label="Event" value={result.ticket.events.title} />}
                  {result.ticket.events?.date && <Row label="Date" value={formatEventDate(result.ticket.events.date)} />}
                  <Row label="Ticket" value={result.ticket.ticket_tier} />
                  <Row label="Code" value={<span className="font-mono text-xs">{result.ticket.ticket_code.slice(0, 12)}…</span>} />
                  {result.ticket.checked_in_at && <Row label="Checked in" value={new Date(result.ticket.checked_in_at).toLocaleString()} />}
                </dl>
              )}
            </div>
          </div>
          <Button variant="outline" size="sm" className="mt-4" onClick={() => setResult(null)}>Clear</Button>
        </div>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-right">{value}</span>
    </div>
  );
}
