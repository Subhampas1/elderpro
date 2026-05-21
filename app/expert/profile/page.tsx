"use client";

import { FormEvent, useState } from "react";

export default function ExpertProfilePage() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const form = new FormData(e.currentTarget);
    const payload = {
      full_name: String(form.get("full_name") || ""),
      profession: String(form.get("profession") || "Retired Teacher"),
      years_experience: Number(form.get("years_experience") || 0),
      subjects: String(form.get("subjects") || "").split(",").map((s) => s.trim()).filter(Boolean),
      languages: String(form.get("languages") || "").split(",").map((s) => s.trim()).filter(Boolean),
      city: String(form.get("city") || ""),
      consultation_fee: Number(form.get("consultation_fee") || 0),
      bio: String(form.get("bio") || ""),
      availability_summary: String(form.get("availability_summary") || "")
    };

    const response = await fetch("/api/expert-profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const result = (await response.json()) as { error?: string };
    setMessage(response.ok ? "Profile saved. Pending verification." : (result.error ?? "Failed to save profile"));
    setLoading(false);
  }

  return (
    <main className="container">
      <div className="card">
        <h1>Expert Profile Setup</h1>
        <p>Large-field simple form for retired teachers.</p>
        <form onSubmit={handleSubmit} className="grid">
          <input name="full_name" placeholder="Full name" required style={{ padding: 12, fontSize: 18 }} />
          <input name="profession" placeholder="Profession (e.g., Mathematics Teacher)" required style={{ padding: 12, fontSize: 18 }} />
          <input name="years_experience" type="number" min="0" placeholder="Years of experience" required style={{ padding: 12, fontSize: 18 }} />
          <input name="subjects" placeholder="Subjects (comma separated)" required style={{ padding: 12, fontSize: 18 }} />
          <input name="languages" placeholder="Languages (comma separated)" required style={{ padding: 12, fontSize: 18 }} />
          <input name="city" placeholder="City" required style={{ padding: 12, fontSize: 18 }} />
          <input name="consultation_fee" type="number" min="0" placeholder="Consultation fee (INR)" required style={{ padding: 12, fontSize: 18 }} />
          <textarea name="bio" placeholder="About your teaching experience" required style={{ padding: 12, fontSize: 18, minHeight: 120 }} />
          <textarea name="availability_summary" placeholder="Availability (e.g., Mon-Fri 5pm-8pm)" required style={{ padding: 12, fontSize: 18, minHeight: 80 }} />
          <button className="btn" type="submit" disabled={loading}>{loading ? "Saving..." : "Save Profile"}</button>
        </form>
        {message && <p>{message}</p>}
      </div>
    </main>
  );
}
