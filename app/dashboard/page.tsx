import Link from "next/link";

export default function DashboardPage() {
  return (
    <main className="container grid">
      <section className="card">
        <h1>Student Dashboard</h1>
        <p>Your onboarding is complete. Search and booking screens are next implementation.</p>
        <Link href="/" className="btn">Back to Home</Link>
      </section>
    </main>
  );
}
