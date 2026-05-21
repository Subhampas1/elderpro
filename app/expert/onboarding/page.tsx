import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUserProfile } from "@/lib/auth/get-current-user";

export default async function ExpertOnboardingPage() {
  const user = await getCurrentUserProfile();

  if (!user) redirect("/login");
  if (user.role !== "expert") redirect(user.role === "student" ? "/dashboard" : "/");

  return (
    <main className="container">
      <div className="card">
        <h1>Expert Onboarding (Retired Teacher)</h1>
        <p>Language preference: {user.language === "hi" ? "Hindi" : "English"}</p>
        <p>Next step: complete your public profile for student discovery.</p>
        <Link href="/expert/profile" className="btn">Create Expert Profile</Link>
      </div>
    </main>
  );
}
