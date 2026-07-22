"use client";

import { createClient } from "@/utils/supabase/client";

export default function LoginOptions() {
  const database = createClient();
  async function handleGoogleLogin() {
    await database.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  }

  return (
    <button
      onClick={handleGoogleLogin}
      className="p-2 bg-emerald-800 cursor-pointer hover:bg-emerald-900"
    >
      Kirjaudu Googlella
    </button>
  );
}
