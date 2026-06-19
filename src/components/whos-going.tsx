import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { UserAvatar } from "@/components/user-avatar";

type Profile = {
  user_id: string;
  full_name: string | null;
  avatar_url: string | null;
  is_private: boolean | null;
  avatar_style: string | null;
  active_frame: string | null;
};

type Row = {
  user_id: string;
  created_at: string;
  student_profiles: Profile | null;
};

export function whosGoingKey(eventId: string) {
  return ["whos-going", eventId] as const;
}

async function fetchWhosGoing(eventId: string) {
  const [recent, count] = await Promise.all([
    supabase
      .from("registrations")
      .select("user_id, created_at, student_profiles!inner(user_id, full_name, avatar_url, is_private, avatar_style, active_frame)")
      .eq("event_id", eventId)
      .order("created_at", { ascending: false })
      .limit(3),
    supabase.from("registrations").select("*", { count: "exact", head: true }).eq("event_id", eventId),
  ]);
  return {
    recent: (recent.data ?? []) as unknown as Row[],
    total: count.count ?? 0,
  };
}

export function WhosGoing({ eventId, size = "sm", showZero = false, className = "" }: { eventId: string; size?: "xs" | "sm" | "md"; showZero?: boolean; className?: string }) {
  const qc = useQueryClient();
  const { data } = useQuery({
    queryKey: whosGoingKey(eventId),
    queryFn: () => fetchWhosGoing(eventId),
    staleTime: 30_000,
  });

  useEffect(() => {
    const channel = supabase
      .channel(`whos-going:${eventId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "registrations", filter: `event_id=eq.${eventId}` }, () => {
        qc.invalidateQueries({ queryKey: whosGoingKey(eventId) });
      })
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [eventId, qc]);

  if (!data) return null;
  const { recent, total } = data;

  const nameOf = (p: Profile | null) => {
    if (!p || p.is_private) return null;
    return p.full_name?.split(" ")[0] ?? null;
  };

  if (total === 0) {
    if (!showZero) return null;
    return <p className={`text-xs text-muted-foreground ${className}`}>Be the first to register</p>;
  }

  if (total === 1) {
    const n = nameOf(recent[0]?.student_profiles ?? null);
    return <p className={`text-xs text-muted-foreground ${className}`}>{n ? `${n} is going` : "1 person going"}</p>;
  }

  if (total === 2) {
    const n1 = nameOf(recent[0]?.student_profiles ?? null);
    const n2 = nameOf(recent[1]?.student_profiles ?? null);
    const both = n1 && n2 ? `${n1} and ${n2} are going` : `${n1 ?? n2 ?? "2 people"} ${n1 && n2 ? "" : "+ 1"} going`;
    return <p className={`text-xs text-muted-foreground ${className}`}>{both}</p>;
  }

  const firstNames = recent.map((r) => nameOf(r.student_profiles)).filter(Boolean) as string[];
  const lead = firstNames.slice(0, 2).join(", ");
  const remaining = total - 2;

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="flex -space-x-2">
        {recent.map((r) => (
          <UserAvatar
            key={r.user_id}
            size={size}
            name={r.student_profiles?.is_private ? null : r.student_profiles?.full_name}
            avatarUrl={r.student_profiles?.is_private ? null : r.student_profiles?.avatar_url}
            avatarStyle={r.student_profiles?.avatar_style}
            className="border-2 border-background"
          />
        ))}
      </div>
      <span className="text-xs text-muted-foreground">
        {lead ? `${lead} ` : ""}+{remaining} going
      </span>
    </div>
  );
}
