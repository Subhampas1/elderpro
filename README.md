# MentorSetu MVP App

Current implementation status:

## Implemented
- Next.js + TypeScript app foundation
- Landing page (`/`)
- Phone OTP login flow (`/login`): send + verify OTP
- Role/language onboarding (`/onboarding`)
- Student dashboard placeholder (`/dashboard`)
- Expert onboarding placeholder (`/expert/onboarding`)
- Supabase browser client utility
- Onboarding API contract (`POST /api/onboarding`) with request validation

## Environment
Copy `.env.example` and set:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Next Milestones
- Persist onboarding into Supabase `users` table with authenticated server-side session checks
- Build expert profile form + voice intro upload/transcription
- Add search + booking lifecycle
# MentorSetu MVP App (Initial Scaffold)

Initial app scaffold for MVP development.

## Included
- Next.js + TypeScript foundation
- Landing page (`/`)
- OTP login page (`/login`) using Supabase auth
- Expert onboarding placeholder (`/expert/onboarding`)
