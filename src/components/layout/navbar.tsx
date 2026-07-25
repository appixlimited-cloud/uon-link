import { Link, useNavigate } from "@tanstack/react-router";
import { Menu, X, LogOut, Settings, Ticket } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { NotificationBell } from "@/components/notification-bell";

const NAV_LINKS = [
  { to: "/", label: "Home" },
  { to: "/events", label: "Events" },
  { to: "/career-events", label: "Career Events" },
  { to: "/uni-vibe", label: "Uni Vibe" },
  { to: "/opportunities", label: "Opportunities" },
  { to: "/notices", label: "Notices" },
  { to: "/clubs", label: "Clubs" },
  { to: "/calendar", label: "Calendar" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
] as const;

export function Navbar() {
  const { user, isAdmin } = useAuth();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const qc = useQueryClient();

  const avatar = useQuery({
    queryKey: ["nav-avatar", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data } = await supabase.from("student_profiles").select("avatar_url").eq("user_id", user.id).maybeSingle();
      return data?.avatar_url ?? null;
    },
    enabled: !!user,
    staleTime: 60_000,
  });

  const initials = user?.email?.slice(0, 2).toUpperCase() ?? "U";

  async function signOut() {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/", replace: true });
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2 text-lg font-bold text-primary">
          <span className="grid h-7 w-7 place-items-center rounded bg-primary text-primary-foreground text-xs">UoN</span>
          UoN Link
        </Link>
        <nav className="hidden lg:flex items-center gap-1">
          {NAV_LINKS.map((l) => (
            <Link key={l.to} to={l.to} className="px-2.5 py-1.5 text-sm text-muted-foreground rounded hover:bg-accent hover:text-accent-foreground transition-colors" activeProps={{ className: "text-primary font-semibold" }} activeOptions={{ exact: l.to === "/" }}>
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="hidden lg:flex items-center gap-2">
          {user ? (
            <>
              {isAdmin && <Link to="/admin"><Button size="sm" variant="outline">Admin</Button></Link>}
              {isAdmin && <NotificationBell />}
              <Link to="/my-tickets"><Button size="sm" variant="ghost"><Ticket className="h-4 w-4 mr-1.5" />Tickets</Button></Link>
              <Link to="/dashboard" className="flex items-center gap-2 rounded px-2 py-1 hover:bg-accent">
                {avatar.data ? (
                  <img src={avatar.data} alt="" className="h-7 w-7 rounded-full object-cover" />
                ) : (
                  <span className="grid h-7 w-7 place-items-center rounded-full bg-primary text-primary-foreground text-xs font-semibold">{initials}</span>
                )}
                <span className="text-sm">{user.email?.split("@")[0]}</span>
              </Link>
              <Link to="/settings"><Button size="icon" variant="ghost" aria-label="Settings"><Settings className="h-4 w-4" /></Button></Link>
              <Button size="icon" variant="ghost" onClick={signOut} aria-label="Sign out"><LogOut className="h-4 w-4" /></Button>
            </>
          ) : (
            <>
              <Link to="/auth"><Button size="sm" variant="ghost">Login</Button></Link>
              <Link to="/signup"><Button size="sm">Sign Up</Button></Link>
            </>
          )}
        </div>
        <button className="lg:hidden" onClick={() => setOpen(!open)} aria-label="Menu">
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>
      {open && (
        <div className="lg:hidden border-t border-border bg-background">
          <nav className="flex flex-col p-4 gap-1">
            {NAV_LINKS.map((l) => (
              <Link key={l.to} to={l.to} onClick={() => setOpen(false)} className="px-3 py-2 text-sm rounded hover:bg-accent" activeProps={{ className: "bg-accent text-primary font-semibold" }} activeOptions={{ exact: l.to === "/" }}>
                {l.label}
              </Link>
            ))}
            <div className="mt-2 flex flex-col gap-2 border-t pt-3">
              {user ? (
                <>
                  {isAdmin && <Link to="/admin" onClick={() => setOpen(false)}><Button size="sm" variant="outline" className="w-full">Admin</Button></Link>}
                  <Link to="/dashboard" onClick={() => setOpen(false)}><Button size="sm" variant="ghost" className="w-full">Dashboard</Button></Link>
                  <Link to="/my-tickets" onClick={() => setOpen(false)}><Button size="sm" variant="ghost" className="w-full"><Ticket className="h-4 w-4 mr-2" />My Tickets</Button></Link>
                  <Link to="/settings" onClick={() => setOpen(false)}><Button size="sm" variant="ghost" className="w-full"><Settings className="h-4 w-4 mr-2" />Settings</Button></Link>
                  <Button size="sm" onClick={() => { setOpen(false); signOut(); }} variant="outline">Sign out</Button>
                </>
              ) : (
                <>
                  <Link to="/auth" onClick={() => setOpen(false)}><Button size="sm" variant="outline" className="w-full">Login</Button></Link>
                  <Link to="/signup" onClick={() => setOpen(false)}><Button size="sm" className="w-full">Sign Up</Button></Link>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
