import { supabase } from "@/integrations/supabase/client";

export async function fetchPublishedEvents(opts?: { category?: string; categories?: string[]; limit?: number }) {
  let q = supabase
    .from("events")
    .select("id, slug, title, category, venue, date, poster_url, is_free, is_featured, description, time, event_tickets(is_enabled, price, tier_name, description, quantity_available, id)")
    .eq("is_published", true)
    .order("date", { ascending: true });
  if (opts?.category) q = q.eq("category", opts.category);
  if (opts?.categories?.length) q = q.in("category", opts.categories);
  if (opts?.limit) q = q.limit(opts.limit);
  const { data, error } = await q;
  if (error) throw error;
  return data ?? [];
}

export async function fetchEventBySlug(slug: string) {
  const { data, error } = await supabase
    .from("events")
    .select("*, event_tickets(id, tier_name, price, description, quantity_available, is_enabled)")
    .eq("slug", slug)
    .eq("is_published", true)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function fetchUpcomingOpportunities(limit?: number) {
  let q = supabase
    .from("opportunities")
    .select("*")
    .eq("is_published", true)
    .gte("deadline", new Date().toISOString().slice(0, 10))
    .order("deadline", { ascending: true });
  if (limit) q = q.limit(limit);
  const { data, error } = await q;
  if (error) throw error;
  return data ?? [];
}

export async function fetchActiveNotices() {
  const { data, error } = await supabase
    .from("notices")
    .select("*")
    .eq("is_published", true)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function fetchClubs() {
  const { data, error } = await supabase.from("clubs").select("*").order("name");
  if (error) throw error;
  return data ?? [];
}

export async function fetchActiveSpotlight() {
  const { data, error } = await supabase
    .from("spotlights")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function fetchAppConfig() {
  const { data, error } = await supabase.from("app_config").select("*").eq("id", 1).maybeSingle();
  if (error) throw error;
  return data;
}
