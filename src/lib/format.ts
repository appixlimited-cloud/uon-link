export function formatEventDate(d: string | Date): string {
  const date = typeof d === "string" ? new Date(d + (d.length === 10 ? "T00:00:00" : "")) : d;
  return date.toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" }).toUpperCase();
}

export function formatShortDate(d: string | Date): string {
  const date = typeof d === "string" ? new Date(d + (d.length === 10 ? "T00:00:00" : "")) : d;
  return date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

export function daysUntil(d: string | Date): number {
  const date = typeof d === "string" ? new Date(d + (d.length === 10 ? "T00:00:00" : "")) : d;
  const now = new Date(); now.setHours(0, 0, 0, 0);
  return Math.ceil((date.getTime() - now.getTime()) / 86400000);
}

export function slugify(s: string): string {
  return s.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-") + "-" + Math.random().toString(36).slice(2, 7);
}

export function googleCalUrl(opts: { title: string; date: string; time?: string | null; venue?: string | null; description?: string | null }) {
  const start = new Date((opts.date.length === 10 ? opts.date + "T" + (opts.time || "09:00:00") : opts.date));
  const end = new Date(start.getTime() + 2 * 3600 * 1000);
  const fmt = (d: Date) => d.toISOString().replace(/[-:]|\.\d{3}/g, "");
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: opts.title,
    dates: `${fmt(start)}/${fmt(end)}`,
    details: opts.description || "",
    location: opts.venue || "",
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export function whatsappShare(text: string) {
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}

export function lowestPrice(tickets: Array<{ is_enabled: boolean; price: number | string }>): number | null {
  const enabled = tickets.filter((t) => t.is_enabled);
  if (!enabled.length) return null;
  return Math.min(...enabled.map((t) => Number(t.price)));
}
