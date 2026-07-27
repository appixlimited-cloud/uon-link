import { supabase } from "@/integrations/supabase/client";

const BUCKET = "profile-pictures";
const TTL = 60 * 60;

function extractPath(raw: string) {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  if (!/^https?:\/\//i.test(trimmed)) {
    return trimmed.replace(/^\/+/, "").replace(new RegExp(`^${BUCKET}/`), "");
  }
  try {
    const url = new URL(trimmed);
    const publicMarker = `/storage/v1/object/public/${BUCKET}/`;
    const signedMarker = `/storage/v1/object/sign/${BUCKET}/`;
    const marker = url.pathname.includes(publicMarker)
      ? publicMarker
      : url.pathname.includes(signedMarker)
        ? signedMarker
        : null;
    if (!marker) return null;
    return decodeURIComponent(url.pathname.slice(url.pathname.indexOf(marker) + marker.length));
  } catch {
    return null;
  }
}

export async function resolveAvatarUrl(avatarUrl: string | null | undefined) {
  if (!avatarUrl) return null;
  const path = extractPath(avatarUrl);
  if (!path) return avatarUrl;
  const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(path, TTL);
  if (error || !data?.signedUrl) return null;
  return data.signedUrl;
}
