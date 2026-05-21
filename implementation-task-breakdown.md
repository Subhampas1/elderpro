# MentorSetu MVP — Complete Build Task Breakdown

This document breaks the MVP into implementation-ready tasks with ownership, dependencies, and definition of done.

## Assumptions
- Segment: Retired Teachers ↔ Students only.
- Booking mode: Scheduled sessions only (30/60 min).
- Stack: Next.js + Supabase + Razorpay + OpenAI + Google Meet links.
- Launch cities: Jamshedpur, Ranchi, Dhanbad.

---

## Phase 0 — Project Setup (Week 0)

### T0.1 Monorepo/App Bootstrap
- **Tasks**
  - Initialize Next.js app with TypeScript and App Router.
  - Set up shared UI tokens for senior-friendly accessibility.
  - Configure environment variable management.
- **Dependencies**: none
- **DoD**
  - App runs locally.
  - CI checks pass for lint/typecheck.

### T0.2 Supabase Project Setup
- **Tasks**
  - Create Supabase project.
  - Configure auth providers for OTP (phone).
  - Create initial DB migration pipeline.
- **Dependencies**: T0.1
- **DoD**
  - OTP auth works in dev.
  - Migration scripts can run forward/backward.

### T0.3 Observability + Analytics Foundation
- **Tasks**
  - Add event tracking utility.
  - Define event taxonomy for MVP KPIs.
  - Add server logs for auth, booking, payment lifecycle.
- **Dependencies**: T0.1
- **DoD**
  - Events are emitted and visible in logs.

---

## Phase 1 — Database & Backend Foundations (Week 1)

### T1.1 Finalize Schema (Production MVP)
- **Tasks**
  - Implement/adjust tables: `users`, `expert_profiles`, `skills`, `expert_skills`, `availability_slots`, `bookings`, `reviews`, `transactions`.
  - Add lifecycle enums (`booking_status`, `verification_status`, `payment_status`, etc.).
  - Add constraints, indexes, and foreign keys.
- **Dependencies**: T0.2
- **DoD**
  - Migration applies cleanly.
  - Referential integrity verified with sample inserts.

### T1.2 Row-Level Security (RLS)
- **Tasks**
  - Add RLS policies per table for student/expert/admin roles.
  - Ensure private fields are protected.
- **Dependencies**: T1.1
- **DoD**
  - Unauthorized reads/writes blocked in policy tests.

### T1.3 Seed Data + Local Fixtures
- **Tasks**
  - Seed sample experts, skills, slots, and reviews.
  - Create deterministic data for QA/UAT.
- **Dependencies**: T1.1
- **DoD**
  - One command loads sample data.

---

## Phase 2 — Authentication + Onboarding (Week 2)

### T2.1 Phone OTP Login
- **Tasks**
  - Build phone input and OTP verification flow.
  - Persist user role/language at first sign-in.
- **Dependencies**: T0.2, T1.2
- **DoD**
  - New and returning users can log in via OTP.

### T2.2 Role + Language Onboarding
- **Tasks**
  - First-run screen: choose role (`expert` or `student`) and language (English/Hindi).
  - Store completion state.
- **Dependencies**: T2.1
- **DoD**
  - Users are routed to correct dashboard.

### T2.3 Assisted Onboarding Entry
- **Tasks**
  - Add “Call me to help onboard” CTA.
  - Capture lead in admin queue.
- **Dependencies**: T2.1
- **DoD**
  - Assisted requests visible in admin panel.

---

## Phase 3 — Expert Onboarding + Voice Profile (Week 3)

### T3.1 Expert Profile Form (Senior-Friendly)
- **Tasks**
  - Build large-button, minimal-step profile form.
  - Fields: name, expertise, years, languages, fee, availability, about, city, photo.
- **Dependencies**: T2.2
- **DoD**
  - Expert can save draft and publish profile.

### T3.2 Voice Intro Upload + STT
- **Tasks**
  - Record/upload audio intro.
  - Transcribe with OpenAI speech-to-text.
- **Dependencies**: T3.1
- **DoD**
  - Audio stored and transcript generated.

### T3.3 AI Bio + Skill Extraction
- **Tasks**
  - Generate polished professional bio from transcript.
  - Extract skills and map to `skills` + `expert_skills`.
- **Dependencies**: T3.2
- **DoD**
  - Expert sees editable AI-generated bio/skills before publish.

### T3.4 Verification Pipeline Hook
- **Tasks**
  - New profiles default to `pending_verification`.
  - Surface status to expert.
- **Dependencies**: T3.1
- **DoD**
  - Unverified profiles not searchable publicly.

---

## Phase 4 — Discovery + Profile Pages (Week 4)

### T4.1 Search API + Filters
- **Tasks**
  - Build query API for subject, language, price, availability, city.
  - Pagination/sorting.
- **Dependencies**: T1.1, T3.4
- **DoD**
  - Filter combinations return correct results within target latency.

### T4.2 Search UI
- **Tasks**
  - Build results page with persistent filters.
  - Show verified badge, fee, rating summary.
- **Dependencies**: T4.1
- **DoD**
  - Student can discover experts in <=3 interactions.

### T4.3 Expert Public Profile
- **Tasks**
  - Build profile page with bio, audio intro, skills, reviews, availability snapshot.
- **Dependencies**: T4.1
- **DoD**
  - Profile info loads fully and links to booking flow.

---

## Phase 5 — Booking Lifecycle (Week 5)

### T5.1 Availability Slot Management (Expert)
- **Tasks**
  - Expert UI to create/update weekly availability slots.
- **Dependencies**: T3.1
- **DoD**
  - Slots saved and shown accurately in student timezone.

### T5.2 Booking Request Flow (Student)
- **Tasks**
  - Session type selection (30/60 min).
  - Slot selection and request submission.
- **Dependencies**: T5.1, T4.3
- **DoD**
  - Booking created with `pending` status.

### T5.3 Expert Accept/Decline + SLA Timeout
- **Tasks**
  - Expert action controls.
  - Auto-timeout job if no response in SLA window.
- **Dependencies**: T5.2
- **DoD**
  - State transitions validated for accept/decline/timeout paths.

### T5.4 Google Meet Link Generation
- **Tasks**
  - Generate and attach Meet link on confirmation.
  - Notify both parties.
- **Dependencies**: T5.3
- **DoD**
  - Confirmed booking includes meeting link in UI + notifications.

---

## Phase 6 — Payments, Reviews, and Revenue (Week 6)

### T6.1 Razorpay Checkout Integration
- **Tasks**
  - Payment order creation, checkout launch, webhook verification.
- **Dependencies**: T5.2
- **DoD**
  - Successful and failed payment flows reflected in DB.

### T6.2 Transaction Ledger + Commission Logic
- **Tasks**
  - Record gross amount, commission %, commission value, net payout.
  - Link to bookings.
- **Dependencies**: T6.1, T1.1
- **DoD**
  - Ledger entries reconcile with payments.

### T6.3 Refund + Cancellation Rules
- **Tasks**
  - Implement cancellation windows and refund states.
  - Admin override actions for disputes.
- **Dependencies**: T6.2
- **DoD**
  - Refund lifecycle works end-to-end.

### T6.4 Ratings & Reviews
- **Tasks**
  - Allow review only after completed session.
  - Aggregate ratings for search/profile.
- **Dependencies**: T5.4
- **DoD**
  - Reviews appear correctly and cannot be duplicated per booking.

---

## Phase 7 — Admin Panel (Week 6–7)

### T7.1 Authz + Admin Shell
- **Tasks**
  - Admin-only access and navigation.
- **Dependencies**: T2.1
- **DoD**
  - Non-admin blocked from admin routes.

### T7.2 Queue: Pending Verifications
- **Tasks**
  - List pending experts.
  - Approve/reject with notes.
- **Dependencies**: T3.4
- **DoD**
  - Action updates verification status and audit trail.

### T7.3 Queue: Flagged Content/Reports
- **Tasks**
  - View reports and take moderation actions.
- **Dependencies**: T7.1
- **DoD**
  - Flags can be resolved with status tracking.

### T7.4 Queue: Bookings/Disputes/Refunds/Payouts
- **Tasks**
  - Operational queues for interventions and settlement approvals.
- **Dependencies**: T6.3
- **DoD**
  - Admin can move cases through lifecycle.

### T7.5 Revenue Dashboard
- **Tasks**
  - GMV, commission, refunds by day/week/city.
- **Dependencies**: T6.2
- **DoD**
  - Dashboard matches ledger totals.

---

## Phase 8 — Notifications + Communications (Week 7)

### T8.1 Transactional Notifications
- **Tasks**
  - OTP, booking created, booking confirmed, reminders, cancellation/refund updates.
- **Dependencies**: T2.1, T5.4, T6.3
- **DoD**
  - All critical lifecycle events produce notifications.

### T8.2 WhatsApp Integration (MVP Lightweight)
- **Tasks**
  - Send booking confirmations/reminders via WhatsApp template.
- **Dependencies**: T8.1
- **DoD**
  - Message delivery observed for test users.

---

## Phase 9 — QA, Pilot Launch, and KPIs (Week 8)

### T9.1 QA Test Matrix
- **Tasks**
  - End-to-end scenarios across expert/student/admin.
  - Edge cases: no-show, timeout, payment failure, refund, rebooking.
- **Dependencies**: Phases 1–8
- **DoD**
  - Critical path pass rate >= agreed threshold.

### T9.2 Pilot Rollout (20–50 Users)
- **Tasks**
  - Controlled onboarding in one city cluster first.
  - Daily issue triage and hotfix loop.
- **Dependencies**: T9.1
- **DoD**
  - First paid bookings completed successfully.

### T9.3 KPI Review Gate
- **Tasks**
  - Review Week-8 metrics against success thresholds.
- **Dependencies**: T9.2
- **DoD**
  - Written decision: Scale / Iterate / Pause.

---

## Suggested Team Split (Parallel Execution)

- **Track A (Platform/Core):** Schema, RLS, auth, roles.
- **Track B (Expert Experience):** Onboarding form, voice flow, AI bio.
- **Track C (Student Experience):** Search, profile, booking UX.
- **Track D (Operations):** Payments, ledger, admin panel, trust & safety queues.
- **Track E (Growth/Ops):** Assisted onboarding, city rollout, KPI dashboards.

---

## Delivery Checklist (Definition of MVP Ready)

1. Expert can sign up via OTP and publish profile.
2. Student can search verified experts and request a scheduled session.
3. Student can pay online; booking transitions are reliable.
4. Session link is generated and delivered.
5. Post-session ratings/reviews are captured.
6. Admin can verify experts, moderate abuse, manage disputes/refunds/payouts.
7. KPI dashboard tracks onboarding, bookings, and revenue.
8. At least one city pilot produces repeated paid sessions.
