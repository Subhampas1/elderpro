# Admin Panel Re-Scope: Priority Queues

This document re-scopes the admin panel into six operational queues. Each queue includes recommended table columns, default filters, and bulk actions to optimize moderator and finance workflows.

## 1) Pending expert verifications

### Required columns
- **Verification ID** (clickable)
- **Submitted at** (timestamp)
- **SLA due by** (timestamp + SLA breach indicator)
- **Expert name**
- **Expert email**
- **Country / timezone**
- **Primary specialty**
- **Credential type** (license, degree, certification)
- **Credential status** (unverified / partial / verified / rejected)
- **Risk score** (0-100)
- **Prior verification attempts**
- **Assigned reviewer**
- **Current status** (pending review / awaiting info / approved / rejected)

### Filters
- Status
- Specialty
- Country/region
- Submission date range
- SLA status (within SLA / nearing breach / breached)
- Risk score band (low / medium / high)
- Assigned reviewer
- Has prior rejection (yes/no)

### Bulk actions
- Assign selected cases to reviewer
- Mark as **needs more information** with template message
- Approve selected (only if all required checks pass)
- Reject selected with reason code
- Set priority (normal/high/urgent)
- Export selected rows (CSV)

---

## 2) Flagged profiles/content

### Required columns
- **Flag ID**
- **Flagged at**
- **Entity type** (profile / post / message / media / review)
- **Entity ID** (clickable)
- **Reported account**
- **Reporter type** (user / expert / system)
- **Flag reason** (spam / abuse / fraud / policy)
- **Severity** (low/medium/high/critical)
- **Auto-moderation signal score**
- **Repeat offender count (30d)**
- **Current visibility** (live / hidden / limited)
- **Assigned moderator**
- **Disposition status** (open / under review / actioned / dismissed)

### Filters
- Entity type
- Reason category
- Severity
- Flag date range
- Auto-signal score band
- Repeat offender only
- Current visibility state
- Assigned moderator
- Disposition status

### Bulk actions
- Hide selected content
- Restore selected content
- Apply warning to account
- Temporarily suspend selected accounts
- Escalate to trust & safety tier-2
- Close as no violation with reason code
- Export evidence package

---

## 3) Upcoming sessions needing intervention

### Required columns
- **Session ID**
- **Scheduled start time**
- **Time to session** (countdown)
- **Client name**
- **Expert name**
- **Session type** (chat / audio / video)
- **Intervention trigger** (no-confirmation / high-risk topic / prior no-show / dispute history)
- **Trigger score**
- **Payment status** (authorized / failed / pending)
- **Tech readiness** (not checked / pass / fail)
- **Assigned ops owner**
- **Intervention status** (pending outreach / contacted / resolved / escalated)

### Filters
- Session window (next 2h / 24h / 72h)
- Intervention trigger type
- Trigger score band
- Payment status
- Expert risk tier
- Assigned ops owner
- Intervention status

### Bulk actions
- Send pre-session check-in (client/expert templates)
- Reconfirm attendance
- Force backup expert shortlist notification
- Escalate selected to live operations
- Mark intervention resolved
- Export call list

---

## 4) Refund/dispute queue

### Required columns
- **Case ID**
- **Opened at**
- **Order/session ID**
- **Customer name**
- **Expert name**
- **Transaction amount**
- **Requested refund amount**
- **Dispute reason**
- **Evidence completeness**
- **Policy eligibility** (eligible / partial / ineligible)
- **Chargeback risk score**
- **Case owner**
- **Case status** (new / investigating / awaiting customer / approved / denied / escalated)
- **SLA deadline**

### Filters
- Case status
- Opened date range
- Dispute reason
- Amount bands
- Eligibility result
- Chargeback risk band
- SLA status
- Case owner

### Bulk actions
- Assign cases to owner
- Request additional evidence (templated)
- Approve full refund
- Approve partial refund
- Deny with policy reason code
- Escalate to finance/legal
- Extend SLA with note
- Export ledger-impact report

---

## 5) Weekly payout approval queue

### Required columns
- **Payout batch ID**
- **Payout week (start/end)**
- **Expert ID/name**
- **Completed sessions count**
- **Gross earnings**
- **Platform commission**
- **Adjustments** (bonuses/penalties)
- **Net payable**
- **Tax/withholding amount**
- **KYC/KYB status**
- **Bank account status** (verified / invalid / pending)
- **Fraud/risk hold flag**
- **Approver**
- **Approval status** (pending / approved / held / rejected)

### Filters
- Payout week
- Approval status
- KYC status
- Bank account status
- Net payable range
- Has risk hold
- Approver

### Bulk actions
- Approve selected payouts
- Place selected payouts on hold
- Reject selected payouts with reason
- Recalculate selected payouts
- Export bank transfer file
- Export approval audit log

---

## 6) Basic revenue dashboard (daily GMV, commission, refunds)

### Required columns (daily grain)
- **Date**
- **Gross merchandise value (GMV)**
- **Platform commission earned**
- **Refunds issued**
- **Net revenue** (commission - refunds adjustments)
- **Orders/sessions count**
- **Average order value**
- **Refund rate** (% of GMV)
- **Commission margin** (% of GMV)
- **Day-over-day change** (GMV and net revenue)

### Filters
- Date range (last 7 / 30 / 90 days / custom)
- Geography
- Service category/specialty
- Session type
- Payment channel

### Bulk actions (data operations)
- Export selected date range to CSV
- Schedule daily finance summary email
- Pin comparison baseline (WoW / MoM)
- Annotate date ranges (campaign, outage, policy change)

---

## Cross-queue UX standards (recommended)
- Saved views per role (Ops, Trust & Safety, Finance).
- Shared filter chips and consistent status taxonomy.
- Bulk action confirmation modals with affected-count preview.
- Mandatory reason codes for destructive actions.
- Full audit trail: actor, timestamp, before/after state.
- SLA breach highlighting and queue aging metrics.
