import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

type RegisterEventInput = {
  id: string;
  slug?: string;
  is_free: boolean;
  ticket_tier?: string;
};

export function useRegisterEvent() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async (event: RegisterEventInput) => {
      if (!user) throw new Error("Please sign in");
      if (!event.is_free && !event.ticket_tier) {
        const err: any = new Error("Please select a ticket tier on the event page.");
        err.code = "TICKET_REQUIRED";
        throw err;
      }

      const { data: profile, error: profileError } = await supabase
        .from("student_profiles")
        .select("full_name, registration_number, faculty, year_of_study, is_verified")
        .eq("user_id", user.id)
        .maybeSingle();
      if (profileError) throw profileError;
      if (!profile?.is_verified) {
        const err: any = new Error("Please verify your account first.");
        err.code = "UNVERIFIED";
        throw err;
      }

      const { data, error } = await supabase
        .from("registrations")
        .upsert(
          {
            event_id: event.id,
            user_id: user.id,
            student_name: profile.full_name,
            email: user.email!,
            registration_number: profile.registration_number,
            faculty: profile.faculty,
            year_of_study: profile.year_of_study,
            ticket_tier: event.is_free ? "Free" : event.ticket_tier,
          },
          { onConflict: "event_id,user_id", ignoreDuplicates: true },
        )
        .select("event_id")
        .maybeSingle();
      if (error) throw error;
      return { eventId: event.id, slug: event.slug, inserted: !!data };
    },
    onSuccess: ({ eventId, slug, inserted }) => {
      if (inserted) {
        toast.success("You are registered! Your ticket is ready.", {
          action: { label: "View ticket", onClick: () => navigate({ to: "/my-tickets" }) },
        });
      } else {
        toast("You are already registered for this event.", {
          action: { label: "View ticket", onClick: () => navigate({ to: "/my-tickets" }) },
        });
      }
      queryClient.invalidateQueries({ queryKey: ["myRegistrations"] });
      queryClient.invalidateQueries({ queryKey: ["myTickets"] });
      queryClient.invalidateQueries({ queryKey: ["registration"] });
      if (slug) queryClient.invalidateQueries({ queryKey: ["registration", slug] });
      queryClient.invalidateQueries({ queryKey: ["admin", "stats"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "recent-events"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "regs"] });
      queryClient.setQueryData<Set<string>>(["myRegistrations", user?.id ?? "anon"], (current) => new Set([...(current ?? new Set<string>()), eventId]));
    },
    onError: (error: any) => {
      if (error?.code === "UNVERIFIED") {
        toast.error("Please verify your account first.", {
          action: { label: "Settings", onClick: () => navigate({ to: "/settings" }) },
        });
      } else {
        toast.error(error?.message || "Registration failed. Please try again.");
      }
    },
  });
}