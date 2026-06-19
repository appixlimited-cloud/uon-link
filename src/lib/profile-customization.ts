// Profile customization presets shared across UI.

export const BANNER_GRADIENTS: Record<string, string> = {
  "blue-purple": "bg-gradient-to-r from-blue-500 to-purple-600",
  "green-teal": "bg-gradient-to-r from-emerald-500 to-teal-500",
  "pink-orange": "bg-gradient-to-r from-pink-500 to-orange-500",
  "gold-amber": "bg-gradient-to-r from-yellow-400 to-amber-600",
  "red-coral": "bg-gradient-to-r from-rose-500 to-red-600",
  "monochrome": "bg-gradient-to-r from-zinc-700 to-zinc-900",
};
export const BANNER_KEYS = Object.keys(BANNER_GRADIENTS);

export const AVATAR_STYLES: Record<string, string> = {
  "indigo-dots": "bg-indigo-600 text-white [background-image:radial-gradient(rgba(255,255,255,0.25)_1px,transparent_1px)] [background-size:8px_8px]",
  "rose-stripes": "bg-rose-500 text-white [background-image:repeating-linear-gradient(45deg,rgba(255,255,255,0.18)_0_4px,transparent_4px_8px)]",
  "emerald-grid": "bg-emerald-600 text-white [background-image:linear-gradient(rgba(255,255,255,0.18)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.18)_1px,transparent_1px)] [background-size:8px_8px]",
  "amber-rings": "bg-amber-500 text-white [background-image:radial-gradient(circle,rgba(255,255,255,0.3)_2px,transparent_3px)] [background-size:10px_10px]",
  "sky-waves": "bg-sky-600 text-white [background-image:repeating-linear-gradient(-45deg,rgba(255,255,255,0.15)_0_3px,transparent_3px_9px)]",
  "violet-plain": "bg-violet-600 text-white",
};
export const AVATAR_STYLE_KEYS = Object.keys(AVATAR_STYLES);

export type FrameKey = "bronze" | "silver" | "gold" | "platinum";

export const FRAME_THRESHOLDS: Record<FrameKey, number> = {
  bronze: 7,
  silver: 14,
  gold: 30,
  platinum: 60,
};

export const FRAME_RING: Record<FrameKey, string> = {
  bronze: "ring-2 ring-amber-700 ring-offset-2 ring-offset-background",
  silver: "ring-2 ring-zinc-400 ring-offset-2 ring-offset-background",
  gold: "ring-2 ring-yellow-400 ring-offset-2 ring-offset-background",
  platinum: "ring-2 ring-fuchsia-400 ring-offset-2 ring-offset-background animate-pulse",
};

export const FRAME_LABEL: Record<FrameKey, string> = {
  bronze: "Bronze · 7-day streak",
  silver: "Silver · 14-day streak",
  gold: "Gold · 30-day streak",
  platinum: "Platinum · 60-day streak",
};

export function framesForStreak(streak: number): FrameKey[] {
  return (Object.keys(FRAME_THRESHOLDS) as FrameKey[]).filter((k) => streak >= FRAME_THRESHOLDS[k]);
}

export function initialsOf(name?: string | null, email?: string | null): string {
  const src = name?.trim() || email?.split("@")[0] || "U";
  return src.split(/\s+/).map((p) => p[0]).slice(0, 2).join("").toUpperCase();
}
