import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const cookieStore = await cookies();
  const database = createClient(cookieStore);
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  if (code) {
    const { error } = await database.auth.exchangeCodeForSession(code);
    if (!error) {
      // Kirjautuminen OK > sivulle
      return NextResponse.redirect(`${origin}/`);
    }
  }
  return NextResponse.redirect(`${origin}/?error=auth-fail`);
}
