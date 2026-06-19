import { createFileRoute, Outlet, Link, useRouterState } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Bell, Calendar as CalIcon, Settings, Users, Megaphone, Briefcase, ClipboardList, BarChart3, Download, FileText, Star, Sparkles, LayoutDashboard, PlusCircle, Building2 } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({ meta: [{ title: "Admin — UoN Link" }] }),
  component: AdminShell,
});

const NAV: Array<{ to: any; label: string; icon: any; exact?: boolean }> = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/admin/create-event", label: "New Event", icon: PlusCircle },
  { to: "/admin/events", label: "Events", icon: CalIcon },
  { to: "/admin/opportunities", label: "Opportunities", icon: Briefcase },
  { to: "/admin/notices", label: "Notices", icon: Megaphone },
  { to: "/admin/clubs", label: "Clubs", icon: Building2 },
  { to: "/admin/students", label: "Students", icon: Users },
  { to: "/admin/registrations", label: "Registrations", icon: ClipboardList },
  { to: "/admin/calendar", label: "Calendar", icon: CalIcon },
  { to: "/admin/featured", label: "Featured", icon: Star },
  { to: "/admin/spotlight", label: "Spotlight", icon: Sparkles },
  { to: "/admin/campus-mood", label: "Campus Mood", icon: Sparkles },
  { to: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/admin/export", label: "Export", icon: Download },
  { to: "/admin/settings", label: "Settings", icon: Settings },
];

function AdminShell() {
  const { user } = Route.useRouteContext();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const role = useQuery({
    queryKey: ["role", user.id],
    queryFn: async () => {
      const { data } = await supabase.from("user_roles").select("role").eq("user_id", user.id);
      return data?.some((r) => r.role === "admin") ?? false;
    },
  });

  if (role.isLoading) return <div className="p-10 text-center">Loading...</div>;
  if (!role.data) return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Access denied</h1>
        <p className="mt-2 text-muted-foreground">You don't have permission to view the admin area.</p>
        <Link to="/" className="mt-4 inline-block text-primary hover:underline">← Back to home</Link>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-secondary/30">
      <aside className="hidden lg:flex w-60 shrink-0 flex-col border-r border-border bg-card">
        <Link to="/admin" className="flex items-center gap-2 border-b border-border px-4 h-14 text-primary font-bold">
          <span className="grid h-7 w-7 place-items-center rounded bg-primary text-primary-foreground text-xs">UoN</span>
          Admin
        </Link>
        <nav className="flex-1 overflow-y-auto p-2 text-sm">
          {NAV.map((n) => {
            const active = n.exact ? pathname === n.to : pathname.startsWith(n.to);
            return (
              <Link key={n.to} to={n.to} className={`flex items-center gap-2 rounded px-3 py-2 mb-0.5 ${active ? "bg-primary text-primary-foreground" : "hover:bg-accent"}`}>
                <n.icon className="h-4 w-4" /> {n.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-border p-3 text-xs text-muted-foreground">
          <Link to="/" className="hover:text-primary">← Back to site</Link>
        </div>
      </aside>
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 border-b border-border bg-card flex items-center justify-between px-4">
          <div className="lg:hidden font-bold text-primary">UoN Link Admin</div>
          <div className="flex items-center gap-2 ml-auto">
            <button className="grid h-9 w-9 place-items-center rounded hover:bg-accent" aria-label="Notifications"><Bell className="h-4 w-4" /></button>
            <Link to="/admin/create-event"><button className="rounded bg-success px-3 py-1.5 text-sm font-semibold text-success-foreground hover:opacity-90">Quick Post</button></Link>
          </div>
        </header>
        <main className="flex-1 overflow-x-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
