import { NextRequest, NextResponse } from "next/server";
import type { AppLanguage, UserRole } from "@/lib/supabase/types";

const allowedRoles: UserRole[] = ["expert", "student", "admin"];
const allowedLanguages: AppLanguage[] = ["en", "hi"];

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { role?: UserRole; language?: AppLanguage };

    if (!body.role || !allowedRoles.includes(body.role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    if (!body.language || !allowedLanguages.includes(body.language)) {
      return NextResponse.json({ error: "Invalid language" }, { status: 400 });
    }

    return NextResponse.json({ ok: true, role: body.role, language: body.language });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
