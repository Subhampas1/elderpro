"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { AppLanguage, UserRole } from "@/lib/supabase/types";

export default function OnboardingPage() {
  const router = useRouter();
  const [role, setRole] = useState<UserRole>("student");
  const [language, setLanguage] = useState<AppLanguage>("en");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const run = async () => {
      const supabase = createClient();
      const { data } = await supabase.auth.getSession();
      if (!data.session) router.replace("/login");
    };
    void run();
  }, [router]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      const response = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role, language })
      });

      if (!response.ok) {
        const payload = (await response.json()) as { error?: string };
        throw new Error(payload.error ?? "Failed to save onboarding");
      }

      router.push(role === "expert" ? "/expert/onboarding" : "/dashboard");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Failed to save onboarding");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="container">
      <div className="card">
        <h1>Complete Your Onboarding</h1>
        <p>Select your role and preferred language.</p>
        <form onSubmit={handleSubmit} className="grid">
          <label htmlFor="role">Role</label>
          <select id="role" value={role} onChange={(e) => setRole(e.target.value as UserRole)} style={{ padding: 12, fontSize: 18 }}>
            <option value="student">Student</option>
            <option value="expert">Retired Teacher (Expert)</option>
          </select>

          <label htmlFor="language">Language</label>
          <select id="language" value={language} onChange={(e) => setLanguage(e.target.value as AppLanguage)} style={{ padding: 12, fontSize: 18 }}>
            <option value="en">English</option>
            <option value="hi">Hindi</option>
          </select>

          <button className="btn" type="submit" disabled={loading}>{loading ? "Saving..." : "Continue"}</button>
        </form>
        {message && <p>{message}</p>}
      </div>
    </main>
  );
}
