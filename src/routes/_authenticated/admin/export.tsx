import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toCsv, downloadCsv } from "@/lib/csv";
import { formatShortDate } from "@/lib/format";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/export")({
  component: AdminExport,
});

function AdminExport() {
  async function exportStudents() {
    const { data } = await supabase.from("student_profiles").select("*");
    if (!data?.length) return toast.info("No students yet");
    downloadCsv("students.csv", toCsv(data.map((s) => ({
      name: s.full_name, registration_number: s.registration_number, faculty: s.faculty, year: s.year_of_study, phone: s.phone, verified: s.is_verified, joined: formatShortDate(s.created_at),
    }))));
  }
  async function exportRegs() {
    const { data } = await supabase.from("registrations").select("*, events(title, date)");
    if (!data?.length) return toast.info("No registrations yet");
    downloadCsv("registrations.csv", toCsv(data.map((r: any) => ({
      event: r.events?.title, event_date: r.events?.date, name: r.student_name, email: r.email, reg_number: r.registration_number, faculty: r.faculty, ticket_tier: r.ticket_tier, registered_at: formatShortDate(r.created_at),
    }))));
  }
  async function exportOps() {
    const { data } = await supabase.from("opportunities").select("*");
    if (!data?.length) return toast.info("No opportunities yet");
    downloadCsv("opportunities.csv", toCsv(data));
  }

  return (
    <div className="max-w-2xl space-y-4">
      <h1 className="text-2xl font-bold">Export Data</h1>
      <div className="grid gap-3">
        <Button onClick={exportStudents} variant="outline" className="justify-start">Download all students as CSV</Button>
        <Button onClick={exportRegs} variant="outline" className="justify-start">Download registrations as CSV (with ticket tiers)</Button>
        <Button onClick={exportOps} variant="outline" className="justify-start">Download all opportunities as CSV</Button>
      </div>
    </div>
  );
}
