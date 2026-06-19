import { Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { whosGoingKey } from "@/components/whos-going";
import { toast } from "sonner";

type Props = {
  eventId: string;
  eventTitle: string;
  ticketTier?: string | null; // optional, defaults to "Free"
  size?: "sm" | "default" | "lg";
  className?: string;
  fullWidth?: boolean;
};

export function RegisterButton({ eventId, eventTitle, ticketTier, size = "sm", className = "", fullWidth }: Props) {
  const { user, loading } = useAuth();
  const qc = useQueryClient();

  const profile = useQuery({
    queryKey: ["profile", user?.id],
    enabled: !!user,
    queryFn: async () => (await supabase.from("student_profiles").select("user_id, full_name, registration_number, faculty, year_of_study, is_verified").eq("user_id", user!.id).maybeSingle()).data,
  });

  const existing = useQuery({
    queryKey: ["registration", eventId, user?.id],
    enabled: !!user,
    queryFn: async () => (await supabase.from("registrations").select("id, ticket_tier").eq("event_id", eventId).eq("user_id", user!.id).maybeSingle()).data,
  });

  const mutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Please sign in");
      if (!profile.data?.is_verified) throw new Error("UNVERIFIED");
      const { error } = await supabase.from("registrations").insert({
        event_id: eventId,
        user_id: user.id,
        student_name: profile.data.full_name,
        email: user.email!,
        registration_number: profile.data.registration_number,
        faculty: profile.data.faculty,
        year_of_study: profile.data.year_of_study,
        ticket_tier: ticketTier || "Free",
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success(`You're registered for ${eventTitle}! Check your email for your QR code.`);
      qc.invalidateQueries({ queryKey: ["registration", eventId, user?.id] });
      qc.invalidateQueries({ queryKey: whosGoingKey(eventId) });
      qc.invalidateQueries({ queryKey: ["myRegs"] });
    },
    onError: (e: any) => {
      if (e?.message === "UNVERIFIED") return;
      toast.error("Registration failed. Please try again.");
    },
  });

  const widthClass = fullWidth ? "w-full" : "";

  if (loading) {
    return <Button size={size} disabled className={`${widthClass} ${className}`}><Loader2 className="h-4 w-4 animate-spin" /></Button>;
  }

  if (!user) {
    return (
      <Link to="/auth" className={widthClass}>
        <Button size={size} className={`${widthClass} ${className}`}>Sign in to register</Button>
      </Link>
    );
  }

  // Profile loading: keep disabled to avoid flicker
  if (profile.isLoading || existing.isLoading) {
    return <Button size={size} disabled className={`${widthClass} ${className}`}><Loader2 className="h-4 w-4 animate-spin" /></Button>;
  }

  if (existing.data) {
    return (
      <Button size={size} disabled className={`${widthClass} bg-success text-success-foreground hover:bg-success rounded-full ${className}`}>
        <Check className="mr-1 h-4 w-4" /> Registered
      </Button>
    );
  }

  if (profile.data && !profile.data.is_verified) {
    return (
      <Link to="/settings" className={widthClass}>
        <Button size={size} variant="outline" className={`${widthClass} ${className}`}>Please verify your account first</Button>
      </Link>
    );
  }

  return (
    <Button
      size={size}
      onClick={(e) => { e.preventDefault(); e.stopPropagation(); mutation.mutate(); }}
      disabled={mutation.isPending}
      className={`${widthClass} ${className}`}
    >
      {mutation.isPending ? <><Loader2 className="mr-1 h-4 w-4 animate-spin" /> Registering…</> : "Register"}
    </Button>
  );
}
