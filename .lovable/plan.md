This is a large, multi-phase build. I'll ship it in ordered phases so you see progress quickly and can course-correct between phases.

## Phase 0 — Backend setup
- Enable Lovable Cloud (Supabase).
- Create tables: events, event_tickets, registrations, student_profiles, opportunities, notices, clubs, spotlights, app_config, newsletter_subscribers, admin_notifications.
- Create roles table (`user_roles` + `has_role` function) — admin identified by role, not by hardcoded email check in code (more secure; we'll seed admin role for appixlimited@gmail.com on first signup).
- RLS policies: public read on published content; admin write; students read/write their own profile + registrations.
- Storage buckets: event-posters (public), club-logos (public), profile-pictures (authenticated, owner-only).
- Seed empty app_config row with app_enabled=true.

## Phase 1 — Design system & shell
- Tailwind tokens in `src/styles.css`: primary #185FA5, white bg, flat (no gradients/heavy shadows).
- Top navbar (logo, center links, login/signup or profile), mobile hamburger.
- Footer (3 columns with contact appixlimited@gmail.com).
- Kill switch: root layout checks app_config; if disabled, show maintenance page (admins bypass).

## Phase 2 — Public pages
- `/` homepage (hero, spotlight, filter chips, events grid, opportunities closing soon).
- `/events`, `/career-events`, `/uni-vibe` (category-filtered listings with search).
- `/events/$slug` detail page (poster, tiered ticket cards, Register with tier selector, WhatsApp share, Google Calendar link).
- `/calendar` (monthly grid + list view toggle, color legend, Google Calendar export per event).
- `/opportunities`, `/notices` (grouped by category), `/clubs` (searchable directory).
- `/about`, `/contact`, `/privacy`, `/terms`, `/support`.

## Phase 3 — Auth & student area
- `/auth` (admin + student login).
- `/signup` with full field set; on submit → verification step (email OTP via Supabase, or phone OTP). 6-box code input, resend after 60s. Sets `is_verified`.
- `/_authenticated/dashboard` — personalized by interests, verification banner.
- `/_authenticated/profile` — avatar upload to profile-pictures bucket, registered events with ticket tier.
- `/_authenticated/settings` — appearance (light/dark in localStorage), account, notifications toggles, interests, delete account (type DELETE).
- Register-for-event flow writes to `registrations` with chosen `ticket_tier`.

## Phase 4 — Admin (gated by admin role)
- `/admin` dashboard (4 stat cards, recent events table).
- `/admin/create-event` + edit: poster upload tabs (drag-drop with preview OR paste URL with live preview), Free/Paid toggle, three independent tier sections (Regular/VIP/VVIP) writing to `event_tickets`.
- `/admin/calendar` (published blue, draft grey, click-to-create).
- `/admin/opportunities`, `/admin/notices`, `/admin/clubs` (with logo upload).
- `/admin/students` (table + CSV export).
- `/admin/registrations` (grouped by event, ticket tier column, CSV per event).
- `/admin/featured` (pick up to 5, drag-reorder).
- `/admin/spotlight` (photo upload, publish date).
- `/admin/analytics` (counts, top faculties, tier breakdown, bar chart of last 5 events).
- `/admin/export` (CSV downloads).
- `/admin/settings` (kill switch, contact config).

## Phase 5 — Polish
- Null-safe empty states everywhere ("No events posted yet. Check back soon!" etc.).
- All upload calls wrapped in try/catch with toast errors.
- WhatsApp share uses `https://wa.me/?text=` with target=_blank rel=noopener.
- Sitemap.xml + robots.txt for public routes.
- SEO `head()` on every public route.

## Technical notes
- Stack: TanStack Start + React 19, Tailwind v4, shadcn, Lovable Cloud (Supabase).
- Auth: Supabase email/password + email OTP + phone OTP. Admin role via `user_roles` table + `has_role()` — NOT a hardcoded email check (the spec's email check is implemented as "auto-grant admin role to appixlimited@gmail.com on first signup", which is safer).
- Routing: file-based under `src/routes/`; protected pages live under `src/routes/_authenticated/` (integration-managed gate). Admin pages under `src/routes/_authenticated/admin/` with an extra role check.
- Data reads: TanStack Query + `useSuspenseQuery` in components, `ensureQueryData` in loaders for public pages.
- No seed/placeholder data anywhere — all content starts empty.

## Scope confirmation
Given the size (~30 routes, 11 tables, 3 buckets, OTP verification, file uploads, CSV exports, analytics, kill switch), this will take several turns. I'll start with Phase 0+1 (backend + shell + design system + navbar/footer) in the next turn so you can see the foundation, then proceed phase by phase.

**Two quick decisions before I start:**
1. Admin identification — OK to use a `user_roles` table where appixlimited@gmail.com is auto-granted admin on signup (safer than email-string checks)? Or strictly hardcode the email check as written?
2. Phone OTP requires Supabase SMS provider configuration (Twilio/MessageBird) with your own credentials — Lovable Cloud doesn't ship SMS by default. OK to ship email OTP now and stub phone OTP with a "coming soon" notice until you add SMS credentials?