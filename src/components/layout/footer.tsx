import { Link } from "@tanstack/react-router";

export function Footer() {
  return (
    <footer className="border-t border-border bg-secondary mt-16">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 md:grid-cols-3">
        <div>
          <div className="flex items-center gap-2 text-lg font-bold text-primary">
            <span className="grid h-7 w-7 place-items-center rounded bg-primary text-primary-foreground text-xs">UoN</span>
            UoN Link
          </div>
          <p className="mt-2 text-sm text-muted-foreground">Your gateway to campus life at the University of Nairobi.</p>
        </div>
        <div>
          <h4 className="text-sm font-semibold">Quick Links</h4>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li><Link to="/events" className="hover:text-primary">Events</Link></li>
            <li><Link to="/opportunities" className="hover:text-primary">Opportunities</Link></li>
            <li><Link to="/notices" className="hover:text-primary">Notices</Link></li>
            <li><Link to="/clubs" className="hover:text-primary">Clubs</Link></li>
            <li><Link to="/calendar" className="hover:text-primary">Calendar</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-semibold">Contact</h4>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li><a href="mailto:appixlimited@gmail.com" className="hover:text-primary">appixlimited@gmail.com</a></li>
            <li>UoN Main Campus<br />Nairobi, Kenya</li>
            <li className="pt-2 flex gap-3 text-xs">
              <Link to="/privacy" className="hover:text-primary">Privacy</Link>
              <Link to="/terms" className="hover:text-primary">Terms</Link>
              <Link to="/support" className="hover:text-primary">Support</Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border py-4 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} UoN Link. All rights reserved.
      </div>
    </footer>
  );
}
