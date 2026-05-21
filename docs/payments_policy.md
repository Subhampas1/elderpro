# Payments Policy and Data Model

This document defines payment operations for bookings, including charge timing, commissions, payouts, refunds, disputes, and ledger data requirements.

## 1) Charge Timing

Two charge modes are supported per booking:

- **Charge at booking (prepaid):**
  - Student payment method is authorized and captured immediately at booking confirmation.
  - Funds are held by platform until payout eligibility.
  - Recommended for first-time students/teachers and high no-show risk.
- **Charge post-session (postpaid):**
  - Payment method is authorized at booking time.
  - Capture occurs after the scheduled session end when session is marked `completed` (or auto-completed by timeout rule).
  - If session is canceled in-policy before capture, authorization is voided/released.

Suggested control fields:
- `bookings.charge_timing`: `at_booking | post_session`
- `bookings.payment_capture_status`: `not_captured | authorized | captured | voided | failed`

## 2) Commission Split Logic (10–15%)

Platform commission rate is stored per booking at transaction time to ensure historical immutability.

- Commission rate range: **10.00% to 15.00%**
- Commission amount formula:
  - `commission_amount = round(gross_amount * commission_rate, 2)`
- Teacher net payout formula:
  - `net_payout_amount = gross_amount - commission_amount - refund_amount`

Policy controls:
- Default commission configured globally (e.g., 12%).
- Per-teacher override allowed but constrained to `[0.10, 0.15]`.
- Commission is applied on captured gross, before payout.

## 3) Teacher Payout Schedule (T+7 Weekly)

Default payout cadence: **weekly, T+7**.

- Session (or capture) becomes payout-eligible after 7 calendar days.
- Weekly payout batch runs once per week (e.g., Monday 00:00 UTC).
- Only transactions with `status = settled` and no open dispute are included.
- Payouts are idempotent via `payout_batch_id` and transaction status transitions.

Suggested status flow:
- `captured -> settled -> payout_pending -> paid_out`

## 4) Refund Policy

### Teacher no-show
- Student is eligible for **100% refund**.
- Booking state transitions to `refund_pending` then `refunded`.
- If payout already executed, create adjustment/debit in next payout cycle.

### Student cancellation windows (example policy)
- **>=24 hours before start:** 100% refund.
- **<24 hours and >=2 hours:** 50% refund.
- **<2 hours or no-show:** 0% refund.

Operational notes:
- Refunds should be represented as explicit transaction records (`type = refund`) linked to original charge.
- Partial refunds are supported; cumulative refunded amount cannot exceed captured gross.

## 5) Dispute Handling Workflow and SLA

Workflow:
1. **Dispute opened** by student/teacher with reason and evidence.
2. **Triage** by support queue.
3. **Investigation** (logs, attendance evidence, messaging).
4. **Decision**: uphold charge, partial refund, or full refund.
5. **Execution**: apply refund/adjustment and close case.

SLA targets:
- Acknowledge dispute within **24 hours**.
- Initial decision within **72 hours**.
- Final resolution within **5 business days** (unless external payment network arbitration is required).

Disputed transactions are marked and excluded from payout while open.

## 6) Ledger Fields Required in DB

Minimum ledger fields for each monetary event:

- `gross_amount`
- `commission_rate`
- `commission_amount`
- `net_payout_amount`
- `refund_amount`
- Status timestamps:
  - `authorized_at`
  - `captured_at`
  - `settled_at`
  - `payout_pending_at`
  - `paid_out_at`
  - `refunded_at`
  - `disputed_at`
  - `resolved_at`

Also include:
- `currency` (ISO 4217)
- `payment_provider`
- `provider_charge_id`
- `provider_refund_id`
- `idempotency_key`

---

## Booking State Design (reflect payment states in `bookings`)

`bookings` should track product/session lifecycle plus high-level payment state:

- `booking_status`:
  - `pending_confirmation`
  - `confirmed`
  - `completed`
  - `canceled_by_student`
  - `canceled_by_teacher`
  - `no_show_student`
  - `no_show_teacher`
  - `disputed`
  - `closed`
- `payment_state`:
  - `unpaid`
  - `authorized`
  - `captured`
  - `partially_refunded`
  - `refunded`
  - `charge_failed`
  - `in_dispute`
  - `paid_out`

Suggested `bookings` columns (payment-relevant subset):

```sql
-- Existing table extended
bookings (
  id                       uuid primary key,
  student_id               uuid not null,
  teacher_id               uuid not null,
  starts_at                timestamptz not null,
  ends_at                  timestamptz not null,
  booking_status           text not null,
  charge_timing            text not null check (charge_timing in ('at_booking','post_session')),
  payment_state            text not null,
  currency                 char(3) not null,
  listed_price_amount      numeric(12,2) not null,
  captured_amount          numeric(12,2),
  total_refunded_amount    numeric(12,2) default 0,
  latest_transaction_id    uuid,
  completed_at             timestamptz,
  canceled_at              timestamptz,
  disputed_at              timestamptz,
  created_at               timestamptz not null,
  updated_at               timestamptz not null
)
```

## New `transactions` Table Design

Create an immutable ledger-style `transactions` table for every monetary movement.

```sql
transactions (
  id                         uuid primary key,
  booking_id                 uuid not null references bookings(id),
  parent_transaction_id      uuid references transactions(id), -- e.g., refund linked to charge
  type                       text not null check (type in ('authorization','capture','refund','adjustment','payout')),
  status                     text not null check (status in (
                               'created','authorized','captured','settled',
                               'payout_pending','paid_out',
                               'refund_pending','refunded',
                               'failed','disputed','resolved','canceled'
                             )),
  gross_amount               numeric(12,2) not null,
  commission_rate            numeric(5,4) not null check (commission_rate between 0.10 and 0.15),
  commission_amount          numeric(12,2) not null,
  net_payout_amount          numeric(12,2) not null,
  refund_amount              numeric(12,2) default 0,
  currency                   char(3) not null,

  payment_provider           text,
  provider_charge_id         text,
  provider_refund_id         text,
  idempotency_key            text not null,
  payout_batch_id            text,

  authorized_at              timestamptz,
  captured_at                timestamptz,
  settled_at                 timestamptz,
  payout_pending_at          timestamptz,
  paid_out_at                timestamptz,
  refunded_at                timestamptz,
  disputed_at                timestamptz,
  resolved_at                timestamptz,

  dispute_reason             text,
  metadata                   jsonb,

  created_at                 timestamptz not null,
  updated_at                 timestamptz not null
)
```

Recommended indexes:
- `(booking_id, created_at)`
- `(status, payout_pending_at)`
- `unique(idempotency_key)`
- `(provider_charge_id)`
- `(payout_batch_id)`

## Consistency Rules

- `bookings.payment_state` must be derived from latest successful transaction state.
- `transactions` rows are append-only for auditability (no destructive edits).
- Sum of all refund transactions for a booking must be `<=` captured gross.
- A transaction marked `in dispute`/`disputed` blocks payout until resolved.
