import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

export function useMyRegistrations() {
  const { user } = useAuth();
  const q = useQuery({
    queryKey: ["myRegistrations", user?.id ?? "anon"],
    queryFn: async (): Promise<Set<string>> => {
      if (!user) return new Set();
      const { data } = await supabase.from("registrations").select("event_id").eq("user_id", user.id);
      return new Set((data ?? []).map((r) => r.event_id as string));
    },
    enabled: !!user,
    staleTime: 30_000,
  });

  useEffect(() => {
    if (!user) return;
    const ch = supabase
      .channel(`my-regs-${user.id}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "registrations", filter: `user_id=eq.${user.id}` }, () => q.refetch())
      .subscribe();
    return () => { supabase.removeChannel(ch); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  return { registeredIds: q.data ?? new Set<string>(), isLoading: q.isLoading };
}
