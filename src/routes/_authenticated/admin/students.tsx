import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { formatShortDate } from "@/lib/format";
import { toCsv, downloadCsv } from "@/lib/csv";

export const Route = createFileRoute("/_authenticated/admin/students")({
  component: AdminStudents,
});

function AdminStudents() {
  const { data } = useQuery({
    queryKey: ["admin", "students"],
    queryFn: async () => (await supabase.from("student_profiles").select("*").order("created_at", { ascending: false })).data ?? [],
  });

  function exportCsv() {
    const rows = (data ?? []).map((s) => ({
      full_name: s.full_name, registration_number: s.registration_number || "",
      faculty: s.faculty || "", year_of_study: s.year_of_study || "",
      phone: s.phone || "", is_verified: s.is_verified ? "yes" : "no",
      joined: formatShortDate(s.created_at),
    }));
    downloadCsv("students.csv", toCsv(rows));
  }

  return (
    <div className="max-w-6xl space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Students</h1>
        <Button onClick={exportCsv} variant="outline">Export CSV</Button>
      </div>
      <div className="rounded-lg border border-border bg-card overflow-x-auto">
        {!data?.length ? <p className="p-8 text-center text-muted-foreground">No students yet.</p> : (
          <table className="w-full text-sm">
            <thead className="bg-secondary text-left"><tr><th className="p-3">Name</th><th className="p-3">Reg. Number</th><th className="p-3">Faculty</th><th className="p-3">Year</th><th className="p-3">Verified</th><th className="p-3">Joined</th></tr></thead>
            <tbody>{data.map((s) => (
              <tr key={s.user_id} className="border-t border-border">
                <td className="p-3 font-medium">{s.full_name}</td>
                <td className="p-3">{s.registration_number || "—"}</td>
                <td className="p-3">{s.faculty || "—"}</td>
                <td className="p-3">{s.year_of_study || "—"}</td>
                <td className="p-3"><span className={`rounded px-2 py-0.5 text-xs ${s.is_verified ? "bg-success text-success-foreground" : "bg-warning text-warning-foreground"}`}>{s.is_verified ? "Verified" : "Unverified"}</span></td>
                <td className="p-3 text-muted-foreground">{formatShortDate(s.created_at)}</td>
              </tr>
            ))}</tbody>
          </table>
        )}
      </div>
    </div>
  );
}
