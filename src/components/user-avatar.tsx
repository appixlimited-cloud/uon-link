import { AVATAR_STYLES, FRAME_RING, FrameKey, initialsOf } from "@/lib/profile-customization";
import { cn } from "@/lib/utils";

type Props = {
  name?: string | null;
  email?: string | null;
  avatarUrl?: string | null;
  avatarStyle?: string | null;
  activeFrame?: string | null;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
};

const SIZE: Record<NonNullable<Props["size"]>, string> = {
  xs: "h-6 w-6 text-[10px]",
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-14 w-14 text-base",
  xl: "h-20 w-20 text-2xl",
};

export function UserAvatar({ name, email, avatarUrl, avatarStyle, activeFrame, size = "md", className }: Props) {
  const initials = initialsOf(name, email);
  const styleClass = avatarStyle && AVATAR_STYLES[avatarStyle] ? AVATAR_STYLES[avatarStyle] : "bg-primary text-primary-foreground";
  const ring = activeFrame && FRAME_RING[activeFrame as FrameKey] ? FRAME_RING[activeFrame as FrameKey] : "";

  return (
    <span className={cn("relative inline-grid place-items-center overflow-hidden rounded-full font-semibold shrink-0", SIZE[size], styleClass, ring, className)}>
      {avatarUrl ? (
        <img src={avatarUrl} alt={name ?? "avatar"} className="h-full w-full object-cover" onError={(e) => { e.currentTarget.style.display = "none"; }} />
      ) : (
        <span>{initials}</span>
      )}
    </span>
  );
}
