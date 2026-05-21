"use client";

import { FormEvent, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function sendOtp(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOtp({ phone });
      if (error) throw error;
      setOtpSent(true);
      setMessage("OTP sent. Enter the code to continue.");
      setMessage("OTP sent. Please check your phone.");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  }

  async function verifyOtp(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.verifyOtp({ phone, token: otp, type: "sms" });
      if (error) throw error;
      setMessage("Logged in successfully.");
      router.push("/onboarding");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Failed to verify OTP");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="container">
      <div className="card">
        <h1>Phone OTP Login</h1>

        <form onSubmit={sendOtp} className="grid" style={{ marginBottom: 16 }}>
          <label htmlFor="phone">Phone number (E.164)</label>
          <input
            id="phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+919876543210"
            required
            style={{ padding: 12, fontSize: 18 }}
          />
          <button className="btn" type="submit" disabled={loading}>
            {loading ? "Sending..." : otpSent ? "Resend OTP" : "Send OTP"}
          </button>
        </form>

        {otpSent && (
          <form onSubmit={verifyOtp} className="grid">
            <label htmlFor="otp">Enter OTP</label>
            <input
              id="otp"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="6-digit code"
              required
              style={{ padding: 12, fontSize: 18 }}
            />
            <button className="btn" type="submit" disabled={loading}>
              {loading ? "Verifying..." : "Verify OTP"}
            </button>
          </form>
        )}

        {message && <p>{message}</p>}
      </div>
    </main>
  return (
    <main className="container"><div className="card">
      <h1>Phone OTP Login</h1>
      <form onSubmit={handleSubmit} className="grid">
        <label htmlFor="phone">Phone number (E.164)</label>
        <input id="phone" value={phone} onChange={(e)=>setPhone(e.target.value)} placeholder="+919876543210" required style={{padding:12,fontSize:18}} />
        <button className="btn" type="submit" disabled={loading}>{loading ? "Sending..." : "Send OTP"}</button>
      </form>
      {message && <p>{message}</p>}
    </div></main>
  );
}
