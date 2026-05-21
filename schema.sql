-- ElderPro platform relational schema (revised)

-- Enums
CREATE TYPE user_role AS ENUM ('expert', 'student', 'admin');
CREATE TYPE verification_status AS ENUM ('unverified', 'pending', 'verified', 'rejected');
CREATE TYPE booking_status AS ENUM (
  'pending',
  'confirmed',
  'completed',
  'cancelled',
  'refunded',
  'no_show'
);
CREATE TYPE transaction_type AS ENUM ('payment', 'refund', 'payout');
CREATE TYPE transaction_status AS ENUM ('pending', 'succeeded', 'failed', 'cancelled');

-- Core users table with primary role
CREATE TABLE users (
  id BIGSERIAL PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  role user_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Optional multi-role strategy:
-- Keep users.role as primary role while allowing secondary roles in user_roles.
CREATE TABLE user_roles (
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role user_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, role)
);

CREATE TABLE expert_profiles (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  headline TEXT,
  bio TEXT,
  verification_status verification_status NOT NULL DEFAULT 'unverified',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Expert availability windows.
CREATE TABLE availability_slots (
  id BIGSERIAL PRIMARY KEY,
  expert_user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ NOT NULL,
  timezone TEXT NOT NULL,
  is_bookable BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (ends_at > starts_at)
);

CREATE TABLE bookings (
  id BIGSERIAL PRIMARY KEY,
  expert_user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  student_user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  availability_slot_id BIGINT REFERENCES availability_slots(id) ON DELETE SET NULL,
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ NOT NULL,
  session_type TEXT NOT NULL,
  status booking_status NOT NULL DEFAULT 'pending',
  price_at_booking NUMERIC(12,2) NOT NULL CHECK (price_at_booking >= 0),
  commission_amount NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (commission_amount >= 0),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (ends_at > starts_at)
);

CREATE TABLE transactions (
  id BIGSERIAL PRIMARY KEY,
  booking_id BIGINT NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  transaction_type transaction_type NOT NULL,
  status transaction_status NOT NULL DEFAULT 'pending',
  amount NUMERIC(12,2) NOT NULL CHECK (amount >= 0),
  currency CHAR(3) NOT NULL,
  provider TEXT,
  provider_reference TEXT,
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Helpful indexes
CREATE INDEX idx_bookings_expert_starts_at ON bookings (expert_user_id, starts_at);
CREATE INDEX idx_bookings_student_starts_at ON bookings (student_user_id, starts_at);
CREATE INDEX idx_bookings_status ON bookings (status);
CREATE INDEX idx_availability_slots_expert_starts_at ON availability_slots (expert_user_id, starts_at);
CREATE INDEX idx_transactions_booking_id ON transactions (booking_id);
CREATE INDEX idx_transactions_type_status ON transactions (transaction_type, status);
