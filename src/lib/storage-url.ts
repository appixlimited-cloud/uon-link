import { supabase } from "@/integrations/supabase/client";

const EVENT_POSTER_BUCKET = "event-posters";
const SIGNED_URL_TTL_SECONDS = 60 * 60;

function extractEventPosterPath(rawUrl: string) {
  const trimmed = rawUrl.trim();
  if (!trimmed) return null;

  if (!/^https?:\/\//i.test(trimmed)) {
    return trimmed.replace(/^\/+/, "").replace(/^event-posters\//, "");
  }

  try {
    const url = new URL(trimmed);
    const publicMarker = `/storage/v1/object/public/${EVENT_POSTER_BUCKET}/`;
    const signedMarker = `/storage/v1/object/sign/${EVENT_POSTER_BUCKET}/`;
    const marker = url.pathname.includes(publicMarker) ? publicMarker : url.pathname.includes(signedMarker) ? signedMarker : null;
    if (!marker) return null;
    return decodeURIComponent(url.pathname.slice(url.pathname.indexOf(marker) + marker.length));
  } catch {
    return null;
  }
}

export async function resolveEventPosterUrl(posterUrl: string | null) {
  if (!posterUrl) return null;

  const path = extractEventPosterPath(posterUrl);
  if (!path) return posterUrl;

  const { data, error } = await supabase.storage.from(EVENT_POSTER_BUCKET).createSignedUrl(path, SIGNED_URL_TTL_SECONDS);
  if (error || !data?.signedUrl) return posterUrl;
  return data.signedUrl;
}

export async function resolveEventPosterUrls<T extends { poster_url: string | null }>(events: T[]) {
  return Promise.all(
    events.map(async (event) => ({
      ...event,
      poster_url: await resolveEventPosterUrl(event.poster_url),
    })),
  );
}