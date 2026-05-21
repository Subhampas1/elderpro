import Link from "next/link";

export default function HomePage() {
  return (
    <main className="container grid">
      <section className="card">
        <h1>MentorSetu (MVP)</h1>
        <p>India's experience network for retired teachers and students.</p>
        <Link href="/login" className="btn">Start with OTP Login</Link>
      </section>
    </main>
  );
}
