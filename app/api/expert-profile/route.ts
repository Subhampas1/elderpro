import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { validateExpertProfile, type ExpertProfilePayload } from "@/lib/validators/expert-profile";

export async function POST(request: NextRequest) {
  try {
    const payload = (await request.json()) as Partial<ExpertProfilePayload>;
    const validationError = validateExpertProfile(payload);
    if (validationError) return NextResponse.json({ error: validationError }, { status: 400 });

    const supabase = createServerSupabaseClient();
    const { data: authData, error: authError } = await supabase.auth.getUser();
    if (authError || !authData.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const userId = authData.user.id;
    const { data: userRow } = await supabase.from("users").select("role").eq("id", userId).maybeSingle();
    if (!userRow || userRow.role !== "expert") {
      return NextResponse.json({ error: "Only experts can submit profile" }, { status: 403 });
    }

    const { error } = await supabase.from("expert_profiles").upsert(
      {
        user_id: userId,
        full_name: payload.full_name,
        profession: payload.profession,
        years_experience: payload.years_experience,
        bio: payload.bio,
        consultation_fee: payload.consultation_fee,
        city: payload.city,
        verified: false,
        organization: null,
        audio_intro: null,
        profile_image: null,
        availability_summary: payload.availability_summary,
        subjects: payload.subjects,
        languages: payload.languages
      },
      { onConflict: "user_id" }
    );

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
