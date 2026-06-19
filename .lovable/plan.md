# UoN Link — Homepage & Social Features

Large multi-part build. I'll ship it in 6 cohesive units. Nothing outside these areas changes.

## 1. Bento grid homepage + dashboard
- New `BentoFeatured` section above existing events list on `/` and `/dashboard`.
  - Left card (1.4fr, spans 2 rows): top featured event (or most-registered upcoming). Category gradient bg, category badge, date, title, who's-going avatars, price badge bottom-right. Links to event detail.
  - Right column (1fr, 2 stacked cards):
    - Opportunities card: open count + "X closing this week".
    - Streak card: 🔥 icon, current streak (derived from `registrations.created_at` consecutive-day activity), motivational microcopy. On homepage when logged-out, this card becomes "Join UoN Link" CTA.
- Mobile: stacks vertically (featured first, then 2-col stat cards).

## 2. Campus Mood badge
- New table `public.campus_mood` (id, message, emoji, start_date, end_date, is_active, created_at, updated_at) + RLS + GRANTs.
  - Public SELECT for active rows; admin full access via `has_role(...,'admin')`.
- Top of `/` and `/dashboard` (just under navbar): pill badge, purple→blue gradient, shows active mood (date range match wins; else most-recently-activated). Hidden if none.
- Admin page `/admin/campus-mood`: list + create/edit/activate with date range.

## 3. Live "who's going" social proof
- New `<WhosGoing eventId />` component used on every event card and event detail page.
- Query: 3 most recent registrants joined to `student_profiles` (name + avatar_url + is_private) + total count.
- Render rules exactly as specified (0 → hidden or "Be the first"; 1 → "X is going"; 2 → "X and Y are going"; 3+ → avatar stack + "X, Y +N going"). Private profiles counted but unnamed.
- Realtime: subscribe to `registrations` filtered by `event_id`; invalidate the query on insert/delete. One channel per mounted component, cleaned up on unmount.
- Requires `student_profiles.is_private` column and a public SELECT policy for safe columns (full_name, avatar_url, is_private) so the join works under RLS. I'll add both in the migration.

## 4. Register button with full confirmation state
- Refactor register flow into shared `<RegisterButton event />` used by `EventCard` and `events.$slug.tsx`.
- States: idle → loading (spinner, disabled) → registered (green pill + check, disabled). Pre-checks `registrations` for `(user_id, event_id)` on mount so no flicker.
- Success: toast "You're registered for [Event]! Check your email for your QR code." + optimistic add to who's-going stack via query invalidation.
- Failure: revert + error toast.
- Unverified profile: button shows "Please verify your account first" linking to `/settings`.
- Logged-out: keeps existing "Sign in to register" behavior.

## 5. Profile customization
- Migration adds to `student_profiles`: `banner_color text`, `avatar_style text`, `unlocked_frames text[] default '{}'`, `active_frame text`, `is_private boolean default false`.
- `/settings` gains "Customize Profile" section:
  - 6 gradient banner swatches.
  - 6 avatar styles (used only when no `avatar_url`).
  - Frame picker showing locked/unlocked state based on current streak (bronze 7 / silver 14 / gold 30 / animated 60).
- `Avatar` helper component renders picture or styled initials, with optional frame ring + banner. Used in navbar dropdown, dashboard header, profile page, and who's-going stack.

## 6. Where things change
**New files**
- `src/components/bento-featured.tsx`
- `src/components/campus-mood-badge.tsx`
- `src/components/whos-going.tsx`
- `src/components/register-button.tsx`
- `src/components/user-avatar.tsx` (with frame + style support)
- `src/lib/streak.ts` (compute streak from registrations)
- `src/routes/_authenticated/admin/campus-mood.tsx`

**Edited files**
- `src/routes/index.tsx`, `src/routes/_authenticated/dashboard.tsx` — bento + mood badge.
- `src/components/event-card.tsx`, `src/routes/events.$slug.tsx` — who's-going + new register button.
- `src/routes/_authenticated/settings.tsx` — customization section.
- `src/components/layout/navbar.tsx` — avatar with banner/frame.
- `src/routes/_authenticated/admin/route.tsx` (or nav) — link to campus mood admin.

## 7. Database (one migration)
- Create `campus_mood` table + RLS + GRANTs (anon SELECT active rows, admin full access).
- Add columns to `student_profiles`: `banner_color`, `avatar_style`, `unlocked_frames`, `active_frame`, `is_private`.
- Add narrow public SELECT policy on `student_profiles` for `(user_id, full_name, avatar_url, is_private, active_frame, avatar_style)` exposure needed by who's-going.
- Add `registrations` to `supabase_realtime` publication.
- Seed 4 example mood rows (inactive, dated examples) so admin can activate.

## 8. Out of scope (won't touch)
- Existing styling/colors/layout outside the sections above.
- Backend logic for ticketing, QR emails, or any other table.
- Any change to `events`/`registrations` schema beyond the realtime publication.

Approve and I'll execute the migration first, then build the UI in parallel batches.
