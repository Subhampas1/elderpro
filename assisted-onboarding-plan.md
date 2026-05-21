# Assisted Onboarding Path Design

## Goals

- Reduce drop-off for users who cannot self-serve onboarding.
- Give operations/admin volunteers a structured handoff and repeatable workflow.
- Preserve attribution in analytics so assisted onboarding performance can be measured.

---

## 1) WhatsApp-based onboarding handoff to ops/admin volunteer

### User flow

1. User taps **"Need help? Onboard with us on WhatsApp"** from landing page or onboarding start screen.
2. System opens WhatsApp deep link with a prefilled intro message and metadata token.
3. Message lands in an ops/admin managed WhatsApp inbox (Business account or shared number).
4. First available volunteer claims the conversation and runs the onboarding script.
5. Volunteer either:
   - completes profile directly in admin panel (assisted), or
   - sends secure self-complete link and stays on call/chat.

### UX copy (example)

- CTA label: **Get help on WhatsApp**
- Supporting text: *A volunteer can help you create your profile in a few minutes.*
- Prefilled WhatsApp message:
  - `Hi, I need help creating my profile. Ref: {{lead_id}}`

### Implementation notes

- Use `wa.me/<number>?text=<urlencoded_text>` format for cross-device compatibility.
- Include `lead_id` (non-sensitive) and campaign/source tags in prefilled text.
- Auto-create a lightweight lead record when user clicks CTA so ops can reconcile incomplete chats.

### Operational controls

- Define volunteer coverage windows and escalation fallback.
- Add “claim owner” field in admin-side lead/onboarding queue.
- SLA target: first response within 5–10 minutes during staffed hours.

---

## 2) Admin-assisted profile creation screen in admin panel

### Purpose

Allow verified admins/volunteers to create a user profile while speaking to the user.

### Required screen capabilities

- **Create profile as assisted flow** toggle (default ON when opened from WhatsApp lead).
- Structured fields matching user profile schema.
- Inline validation identical to end-user onboarding.
- Save modes:
  - **Save draft** (partial data)
  - **Submit completed profile**
- Audit fields auto-captured:
  - `created_by_admin_id`
  - `assisted_channel` (`whatsapp`, `phone`, `in-person`, etc.)
  - `onboarding_source` = `assisted`
  - timestamp + optional notes

### Safety & compliance

- Role-based access: only trained admin/volunteer role.
- PII masking in list views; full reveal only on detail page with permission.
- Immutable audit log for field changes and submit action.
- Consent checkbox: “User has consented to profile creation and data use policy.”

### Suggested form layout

1. Identity basics
2. Contact details
3. Preferences / eligibility fields
4. Emergency/support metadata (if applicable)
5. Consent + verification

---

## 3) “Call me to help onboard” CTA on landing page

### CTA behavior

- Secondary CTA near primary "Start onboarding" button.
- Opens a short callback request form:
  - Name
  - Phone number
  - Preferred call time window
  - Language preference
- On submit:
  - create callback ticket for ops queue,
  - tag lead source as `assisted_request_call`,
  - send confirmation SMS/WhatsApp if available.

### Copy suggestions

- CTA: **Call me to help onboard**
- Description: *Prefer speaking to someone? We’ll call and help complete your profile.*
- Confirmation: *Thanks — a volunteer will call you during your selected time window.*

### Prioritization logic (ops)

- Prioritize by earliest preferred time window + vulnerability flags.
- Expire stale requests after configurable threshold (e.g., 72 hours) with retry workflow.

---

## 4) Onboarding completion tracking source (`self`, `assisted`) for analytics

### Data model additions

At onboarding completion event and user profile record:

- `onboarding_source`: enum(`self`, `assisted`)
- `assisted_channel`: nullable enum (`whatsapp`, `phone`, `admin_in_person`, `other`)
- `assistant_actor_id`: nullable (admin/volunteer user id)
- `lead_id`: nullable join key for acquisition funnel tracing

### Event instrumentation

Emit at minimum:

- `onboarding_started`
- `onboarding_assistance_requested`
- `onboarding_assistance_connected`
- `onboarding_profile_submitted`
- `onboarding_completed`

Each event should include:

- `user_or_lead_id`
- `onboarding_source`
- `assisted_channel` (if assisted)
- `campaign/source/medium` attribution fields
- timestamps

### Core analytics cuts

- Completion rate by source: `self` vs `assisted`
- Time-to-complete by source/channel
- Drop-off stage by source
- Assisted conversion by volunteer/admin
- Rework/error rate (profiles needing correction)

### Quality guardrails

- Source must be set exactly once at completion; avoid null/unknown on completed profiles.
- If admin created/submitted profile, force `onboarding_source=assisted`.
- If user completed entirely unaided, set `self`.

---

## 5) Operator script/template for consistent profile data collection

Use this script in WhatsApp/chat/call flows to reduce variance.

## Operator Script (Template)

### A. Opening

> Hi, I’m {{operator_name}}, a volunteer with {{org_name}}. I can help you create your profile now. This usually takes about {{x}} minutes. Is now a good time?

### B. Consent

> Before we start: do you consent to us collecting your information to create your profile and provide services according to our privacy policy?

- Record: `consent_yes_no`
- If no: stop flow, provide policy/help link.

### C. Identity & contact

1. Full name (as preferred)
2. Phone number
3. Alternate contact (optional)
4. Email (optional)
5. City/area

Read-back confirmation:

> Let me confirm I captured that correctly: {{summary}}. Is this correct?

### D. Program-specific profile fields

- Ask each required field in plain language.
- For sensitive questions, include skip option where policy allows.
- Mark unknown vs declined distinctly.

### E. Final verification

> I’m about to submit your profile. Would you like me to review your details once more?

- Confirm final consent to submit.
- Submit in admin panel.

### F. Close-out

> Your profile is now created. Your reference ID is {{profile_id}}. If you need updates later, contact us at {{support_channel}}.

### G. Admin checklist (internal)

- [ ] Source set to `assisted`
- [ ] Assisted channel selected
- [ ] Consent recorded
- [ ] Required fields validated
- [ ] Notes added (if any exceptions)
- [ ] Completion event verified in analytics logs

---

## Rollout plan (phased)

1. **Phase 1 (1–2 weeks):** WhatsApp CTA + callback CTA + manual admin form usage.
2. **Phase 2 (2–4 weeks):** Dedicated assisted profile screen + audit logging.
3. **Phase 3 (ongoing):** Analytics dashboards and script quality calibration.

## Success metrics

- +X% onboarding completion uplift overall
- Assisted completion rate
- Median time-to-complete (assisted vs self)
- First-response SLA adherence
- User satisfaction for assisted flow
