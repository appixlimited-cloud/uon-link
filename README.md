# UoN Link

Here is the complete rewritten prompt with Register replacing every instance of RSVP:

"Build a university events and campus life platform called UoN Link for the University of Nairobi. This is a complete build from scratch. Follow this exact specification:

DESIGN STYLE Clean, modern, professional. Primary color deep blue (#185FA5). White backgrounds. Flat design — no gradients or heavy shadows. Mobile responsive. Large event poster images. Dates displayed prominently on every event card.

PAGES TO BUILD

Public pages (visible to all visitors): - / (Homepage): Full-width hero section with deep blue background, white headline: Your Gateway to Campus Life, subheading: Discover events, opportunities, and everything happening at UoN, two buttons: Browse Events and Opportunities. Below hero: Student Spotlight section showing a featured student card with avatar initials circle, name, club or faculty, and headline. Below spotlight: horizontal filter chips (All, Academic, Career, Tech, Sports, Uni Vibe, Free). Below filters: 3-column event cards grid — each card has a colored poster image at top, date in bold blue text (format: 24 JUNE 2026), event name, venue, price badge (green FREE or blue KSh amount showing lowest ticket price), and Register button. Below events grid: Opportunities closing soon section showing 2-column opportunity cards with type badge (green Internship, purple Scholarship), title, and deadline with red Closing Soon badge if within 7 days. Footer with 3 columns: UoN Link tagline left, Quick Links middle (Events, Opportunities, Notices, Clubs, Calendar), Contact right (appixlimited@gmail.com, UoN Main Campus Nairobi Kenya).

- /events: All events listing with search bar, category filter chips (All, Academic, Career, Tech, Sports, Entertainment, Culture, Free), and 3-column card grid. Each card has a Register button. Empty state: No events posted yet. Check back soon!

- /calendar: Public event calendar page. Show a full monthly calendar view with all published events displayed on their respective dates as colored dots or small event chips on the calendar grid. Clicking any date that has events shows a dropdown or side panel listing all events on that date with their name, time, venue, and ticket prices. Add Previous Month and Next Month navigation arrows. Add a Today button to jump back to current month. Show a color legend below the calendar: blue for Academic, green for Career, purple for Uni Vibe, orange for Sports, red for Entertainment. Add a List View toggle button that switches the calendar to a chronological list of all upcoming events sorted by date — each row shows date, event name, venue, and lowest ticket price. Add Save to Google Calendar button on each event in both calendar view and list view that generates a Google Calendar link with the event name, date, time, venue, and description pre-filled.

- /career-events: Same layout as /events but filtered to Career category only. Header: Career Events at UoN. Subheading: Internship drives, career fairs, CV clinics, and professional development.

- /uni-vibe: Same layout as /events but filtered to Social, Entertainment, and Cultural categories. Header: Uni Vibe. Subheading: Concerts, comedy nights, sports events, and campus lifestyle.

- /opportunities: Opportunities board. Filter by type (All, Internship, Scholarship, Competition, Volunteer, Job, Workshop). Cards sorted by soonest deadline. Each card shows: type badge, organization name, title, eligibility summary, deadline, red Closing Soon badge if within 7 days, and Apply Now button linking to application URL.

- /notices: Notice board grouped by category (Academic, Lost and Found, Accommodation, Items for Sale, Study Groups, General). Each notice shows title, description, optional contact, and date posted. Expired notices hidden automatically.

- /clubs: Club directory. Searchable grid of club cards. Each card shows: club logo or initials circle, club name, category badge, short description, and contact details.

- /events/[slug]: Individual event detail page. Full-width poster image at top. Event name in large bold text. Date, time, and venue clearly displayed. Full description. Ticket pricing section showing all available ticket tiers in separate clearly labelled cards: Regular ticket price in KSh, VIP ticket price in KSh, VVIP ticket price in KSh. For free events show a single FREE badge. Each ticket tier card shows: tier name, price, and a brief description of what is included if the admin has added one. Register button that asks the user to select their ticket tier before confirming. WhatsApp share button using https://wa.me/?text= format opening in new tab with message: Check out this event at UoN — [Event Name] on [Date] at [Venue]. Tickets from KSh [lowest price]. Register here: [URL]. Add to Google Calendar button. Back to Events link.

- /about: About page with mission statement and four value pillars: Academic Excellence, Community Building, Career Growth, Lifelong Learning.

- /contact: Contact page with email button (mailto:appixlimited@gmail.com) and FAQ accordion. Support email displayed prominently: appixlimited@gmail.com. Response time notice: We respond within 24 hours Monday to Friday.

- /auth: Login page for admin only. Clean centered card with email and password fields and Login button. Admin email is appixlimited@gmail.com.

- /signup: Student signup page collecting: full name, email, password, confirm password (with show/hide toggle on all password fields), student registration number (label: Student Registration Number e.g. C02/12345/2023), phone number, faculty (dropdown: Arts, Science, Engineering, Medicine, Law, Commerce, Education, Other), year of study (dropdown: First Year, Second Year, Third Year, Fourth Year, Postgraduate), interests (multi-select chips: Academic, Career, Tech, Sports, Entertainment, Culture, Uni Vibe). Below signup button: By creating an account you agree to our Privacy Policy and Terms of Service.

ACCOUNT VERIFICATION — After the user fills in the signup form and clicks Create Account show a verification step before the account is activated. Ask the user to choose their verification method: Verify with Email — sends a 6-digit OTP code to their email address, or Verify with Phone Number — sends a 6-digit OTP code to their phone number via Supabase SMS. Show a verification code input screen with 6 individual digit boxes. The user enters the code and clicks Verify. If the code is correct activate the account and redirect to /dashboard. If the code is wrong show: Incorrect code. Please try again. Add a Resend Code link that sends a new code after 60 seconds. Store verification status in the student_profiles table as is_verified boolean. Unverified accounts can browse but cannot register for events until verified. Show a banner on the dashboard: Please verify your account to unlock full access. Verify now.

- /dashboard: Student personalized dashboard showing events matching their selected interests first. Shows greeting with student name, upcoming registered events, recommended events based on interests, quick links to Opportunities, Notices, and Calendar. Show verification banner if account is not verified.

- /profile: Student profile page. Left column: circular profile picture (upload to Supabase Storage bucket profile-pictures, max 5MB, JPG PNG WEBP, show initials in blue circle if none uploaded), full name, registration number, Edit Profile button. Right column: faculty, year of study, interests as blue chips, My Registered Events list showing ticket tier selected for each event. Show profile picture and name in top navigation when logged in.

- /settings: Settings page with sections — Appearance (light/dark mode toggle saved to localStorage), Account (edit profile, change password, Danger Zone with red Delete My Account button requiring user to type DELETE to confirm — deletes all user data from Supabase then redirects to homepage), Notifications (toggles for new matching events, event reminders 24 hours before, weekly digest), My Interests (update interest categories).

- /privacy: Privacy policy page. Contact email: appixlimited@gmail.com.

- /terms: Terms of service page. Contact email: appixlimited@gmail.com.

- /support: Support page with email contact card (appixlimited@gmail.com), mailto button, and FAQ accordion. No phone number. Support email is appixlimited@gmail.com.

Admin pages (protected — redirect to /auth if not logged in). Admin account is identified by email appixlimited@gmail.com:

- /admin: Admin dashboard. Top navigation shows UoN Link Admin logo, bell notification icon, and green Quick Post button. Left sidebar with navigation items: Dashboard, Events, Career Events, Uni Vibe, Opportunities, Notices, Clubs, Students, Registrations, Calendar, Featured Content, Spotlight, Analytics, Export, Notifications, Settings. Main area shows 4 stat cards in a row: total students (blue number), total events posted, total registrations this week, total opportunities. Below stats: Recent Events table with columns: Event name, Date, Registration count, Status badge (green Live or amber Draft), and action buttons (Edit, Quick Edit, Delete).

- /admin/create-event: Event creation form with fields: title, category (dropdown: Academic, Career, Tech, Sports, Entertainment, Culture, Uni Vibe), date, time, venue, description, is_featured toggle, publish immediately toggle.

TICKET PRICING SECTION IN ADMIN — Add a Ticket Pricing section in the event creation and event editing form. Show a toggle at the top: Free Event (toggle on means the event is free and no pricing fields are shown) or Paid Event (toggle off reveals the pricing fields). For paid events show three ticket tier sections that the admin can fill in independently:

Regular Ticket: toggle to enable or disable this tier, price input in KSh (required if enabled), description field (optional, e.g. General admission, standing area), available quantity (optional).

VIP Ticket: toggle to enable or disable this tier, price input in KSh (required if enabled), description field (optional, e.g. Reserved seating, complimentary drink), available quantity (optional).

VVIP Ticket: toggle to enable or disable this tier, price input in KSh (required if enabled), description field (optional, e.g. Front row, meet and greet, gift bag), available quantity (optional).

The admin must enable at least one tier for paid events. Each tier can be edited individually on the event edit page without affecting the other tiers. Store ticket pricing in a separate event_tickets table in Supabase with columns: id, event_id, tier_name (Regular, VIP, VVIP), price, description, quantity_available, is_enabled, created_at. On the admin events list show the lowest enabled ticket price as the displayed price. On the event edit page show the current pricing for all tiers with the ability to update each one individually.

POSTER IMAGE UPLOAD IN ADMIN — Replace the URL-only poster input with a full image upload system. Show two clearly labelled tabs: Upload Image and Paste URL. Upload Image tab: show a large drag and drop upload zone with dashed border and text: Click to upload or drag and drop your event poster here. Supported formats: JPG, PNG, WEBP. Maximum size: 5MB. When the admin selects or drops an image file immediately show a full preview of the uploaded image inside the upload zone so the admin can see exactly how the poster looks before saving. Show the image filename and file size below the preview. Add a Remove Image button to clear the upload and start again. On form submission upload the image to Supabase Storage bucket event-posters using file path events/[timestamp]-[filename]. After upload retrieve the public URL and save it to the poster_url column in the events table. Paste URL tab: keep the existing URL input field. When a valid image URL is pasted show a live preview of the image below the input field. On the events list in the admin panel show a thumbnail preview of the poster image next to each event title. On the event edit page show the current poster image in full preview with an option to replace it.

- /admin/calendar: Admin calendar view showing all events — published and draft — on a monthly calendar. Published events shown in blue, draft events shown in grey. Clicking any date opens a panel to create a new event for that date with the date pre-filled. Clicking any existing event opens a quick edit panel. Add Previous Month, Next Month, and Today navigation. Show a count of events per day on the calendar grid.

- /admin/opportunities: Manage opportunities. Create form with: title, type, organization, description, eligibility, deadline, application link, optional poster image upload (same drag and drop system as events).

- /admin/notices: Manage notices. Create form with: title, category, description, contact, expiry date.

- /admin/clubs: Manage clubs. Create form with: club name, category, description, contact email, social link, logo upload (drag and drop, stored in Supabase Storage bucket club-logos).

- /admin/students: Students table showing: full name, email, registration number, faculty, year of study, verification status (verified or unverified badge), date joined. Export as CSV button.

- /admin/registrations: Registrations grouped by event. Each event shows total registration count prominently and a table of: student name, email, registration number, faculty, ticket tier selected (Regular, VIP, or VVIP), registration date. Export CSV per event.

- /admin/featured: Featured content manager. Admin selects up to 5 events or opportunities for homepage hero carousel. Drag and drop to reorder.

- /admin/spotlight: Spotlight manager. Create spotlight with: name, faculty or club, headline, story, photo upload, publish date.

- /admin/analytics: Analytics page showing total registered students, total events, registrations this week, most popular event, top 3 faculties, opportunities closing this week, ticket tier breakdown per event (how many Regular, VIP, VVIP registrations per event), and bar chart of registrations per last 5 events.

- /admin/export: Export section. Download all students as CSV, registrations per event as CSV (including ticket tier column), all opportunities as CSV.

- /admin/settings: Admin settings with Kill Switch toggle (App Enabled — when off show maintenance page to all students with message: UoN Link is currently under maintenance. Contact appixlimited@gmail.com), and contact details configuration.

NAVIGATION BAR Logo UoN Link on the left in deep blue. Centre links: Home, Events, Career Events, Uni Vibe, Opportunities, Notices, Clubs, Calendar, About, Contact. Right side: Login and Sign Up buttons when not logged in, profile picture with name when logged in. On mobile collapse to hamburger menu.

SUPABASE TABLES Create the following tables: - events: id, title, description, category, venue, date, time, is_free boolean default true, poster_url, slug, is_featured, is_published, created_at - event_tickets: id, event_id, tier_name, price, description, quantity_available, is_enabled boolean default false, created_at - registrations: id, event_id, user_id, student_name, email, registration_number, faculty, year_of_study, ticket_tier, created_at - student_profiles: user_id, full_name, registration_number, faculty, year_of_study, interests array, avatar_url, phone, is_verified boolean default false, created_at - opportunities: id, title, type, organization, description, eligibility, deadline, application_link, poster_url, is_published, created_at - notices: id, title, category, description, contact, expiry_date, is_published, created_at - clubs: id, name, category, description, contact_email, social_link, logo_url, created_at - spotlights: id, name, faculty_or_club, headline, story, photo_url, publish_date, is_active, created_at - app_config: id, app_enabled boolean default true, maintenance_message text, updated_at - newsletter_subscribers: id, email, created_at - admin_notifications: id, type, message, is_read, created_at

SUPABASE AUTH Admin login uses Supabase Auth. Admin is identified by email appixlimited@gmail.com. All /admin routes check for admin email before rendering and redirect to /auth if not logged in. Students sign up and log in with their own accounts. Enable email OTP and phone OTP verification in Supabase Auth settings.

SUPABASE STORAGE Create three buckets: event-posters (public read, admin write only), profile-pictures (authenticated read own file only, authenticated write own file only), club-logos (public read, admin write only).

NULL SAFETY Every component that reads from Supabase must show a friendly empty state if data is null or the table is empty. No component should crash on empty data. Wrap all image uploads in try/catch with user-friendly error messages. If no ticket tiers are enabled for an event show FREE badge by default.

CONTACT DETAILS Use these everywhere across the entire app: email appixlimited@gmail.com, address University of Nairobi Main Campus Nairobi Kenya. No phone number anywhere in the app.

WHATSAPP BUTTONS All WhatsApp buttons must use https://wa.me/?text= format opening in a new tab with target blank and rel noopener noreferrer. Never use api.whatsapp.com.

Do not add any placeholder or AI-generated events, opportunities, notices, or clubs. All content sections should start empty and be populated only through the admin panel."

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://uon-link.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/8125657d-2138-49c6-976e-e86822f07606).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
