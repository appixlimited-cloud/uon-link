import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { formatShortDate } from "@/lib/format";

type Notif = { id: string; type: string; message: string; is_read: boolean; created_at: string };

export function NotificationBell() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);

  const { data } = useQuery({
    queryKey: ["admin", "notifications"],
    queryFn: async (): Promise<Notif[]> => {
      const { data } = await supabase
        .from("admin_notifications")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(10);
      return (data as Notif[]) ?? [];
    },
  });

  useEffect(() => {
    const channel = supabase
      .channel("admin-notifications-live")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "admin_notifications" }, () => {
        qc.invalidateQueries({ queryKey: ["admin", "notifications"] });
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [qc]);

  const unread = (data ?? []).filter((n) => !n.is_read).length;

  async function markAllRead() {
    const ids = (data ?? []).filter((n) => !n.is_read).map((n) => n.id);
    if (!ids.length) return;
    await supabase.from("admin_notifications").update({ is_read: true }).in("id", ids);
    qc.invalidateQueries({ queryKey: ["admin", "notifications"] });
  }

  return (
    <div className="relative">
      <Button
        size="icon"
        variant="ghost"
        aria-label="Notifications"
        onClick={() => { setOpen((o) => !o); if (!open) markAllRead(); }}
      >
        <Bell className="h-4 w-4" />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-destructive px-1 text-[10px] font-bold text-destructive-foreground">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </Button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 z-50 mt-2 w-80 rounded-lg border border-border bg-popover shadow-lg">
            <div className="border-b border-border px-3 py-2 text-sm font-semibold">Notifications</div>
            <div className="max-h-96 overflow-y-auto">
              {!data?.length ? (
                <p className="p-4 text-center text-xs text-muted-foreground">No notifications yet.</p>
              ) : data.map((n) => (
                <div key={n.id} className="border-b border-border/50 px-3 py-2 text-sm last:border-0">
                  <p>{n.message}</p>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">{formatShortDate(n.created_at)}</p>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
