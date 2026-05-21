export interface ExpertProfilePayload {
  full_name: string;
  profession: string;
  years_experience: number;
  subjects: string[];
  languages: string[];
  city: string;
  consultation_fee: number;
  bio: string;
  availability_summary: string;
}

export function validateExpertProfile(payload: Partial<ExpertProfilePayload>): string | null {
  if (!payload.full_name?.trim()) return "Full name is required";
  if (!payload.profession?.trim()) return "Profession is required";
  if (!Number.isInteger(payload.years_experience) || (payload.years_experience ?? -1) < 0) return "Years of experience must be a valid number";
  if (!payload.subjects || payload.subjects.length === 0) return "At least one subject is required";
  if (!payload.languages || payload.languages.length === 0) return "At least one language is required";
  if (!payload.city?.trim()) return "City is required";
  if (typeof payload.consultation_fee !== "number" || payload.consultation_fee < 0) return "Consultation fee must be valid";
  if (!payload.bio?.trim()) return "Bio is required";
  if (!payload.availability_summary?.trim()) return "Availability is required";
  return null;
}
