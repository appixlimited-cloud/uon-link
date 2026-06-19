import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

async function fetchActiveMood() {
  const today = new Date().toISOString().slice(0, 10);
  const { data } = await supabase
    .from("campus_mood")
    .select("id, message, emoji, start_date, end_date, created_at")
    .eq("is_active", true)
    .order("created_at", { ascending: false });
  if (!data?.length) return null;
  const inRange = data.find((m) => (!m.start_date || m.start_date <= today) && (!m.end_date || m.end_date >= today));
  return inRange ?? data[0];
}

export function CampusMoodBadge() {
  const { data } = useQuery({ queryKey: ["campus-mood"], queryFn: fetchActiveMood, staleTime: 5 * 60_000 });
  if (!data) return null;
  return (
    <div className="mx-auto max-w-7xl px-4 pt-3">
      <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-purple-700 to-blue-700 px-4 py-1.5 text-sm font-medium text-white shadow-sm">
        <span aria-hidden>{data.emoji}</span>
        <span>{data.message}</span>
      </div>
    </div>
  );
}
