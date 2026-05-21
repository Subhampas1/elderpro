export type UserRole = "expert" | "student" | "admin";
export type AppLanguage = "en" | "hi";

export interface UserProfile {
  id: string;
  role: UserRole;
  language: AppLanguage;
  phone: string | null;
}
