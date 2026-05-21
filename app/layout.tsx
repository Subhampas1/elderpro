import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "MentorSetu MVP",
  description: "Retired teachers mentoring students"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
