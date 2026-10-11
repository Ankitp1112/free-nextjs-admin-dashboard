"use client";

import { useEffect, useState } from "react";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export default function GoogleSignInCallback() {
  const [message, setMessage] = useState("Verifying your Google sign-in…");

  useEffect(() => {
    let active = true;

    async function completeSignIn() {
      if (!SUPABASE_URL || !SUPABASE_KEY) {
        setMessage("Sign-in is not configured. Please contact the TIAL admin.");
        return;
      }

      const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
      const query = new URLSearchParams(window.location.search);
      const authError = query.get("error_description") || query.get("error");
      if (authError) {
        setMessage("Google sign-in was not completed. Return to the sign-in page and try again.");
        return;
      }

      const accessToken = hash.get("access_token");
      const refreshToken = hash.get("refresh_token");
      if (!accessToken) {
        setMessage("No sign-in session was returned. Check that Google sign-in is enabled in Supabase, then try again.");
        return;
      }

      try {
        const userResponse = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
          headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${accessToken}` },
        });
        const user = await userResponse.json();
        if (!userResponse.ok || !user.id) throw new Error("Google account could not be verified.");

        const memberResponse = await fetch(
          `${SUPABASE_URL}/rest/v1/admin_members?select=role,is_active&user_id=eq.${encodeURIComponent(user.id)}`,
          { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${accessToken}` } },
        );
        const members = await memberResponse.json();
        if (!memberResponse.ok || !members?.[0]?.is_active || !["owner", "admin", "editor", "viewer"].includes(members?.[0]?.role)) {
          throw new Error("This Google account does not have active TIAL Admin access. Sign in with the Google account already registered as the TIAL owner.");
        }

        sessionStorage.setItem("tial_access_token", accessToken);
        if (refreshToken) sessionStorage.setItem("tial_refresh_token", refreshToken);
        sessionStorage.setItem("tial_admin_role", members[0].role);
        window.history.replaceState(null, "", window.location.pathname);
        window.location.replace("/");
      } catch (error) {
        if (active) setMessage(error instanceof Error ? error.message : "Unable to complete sign-in.");
      }
    }

    void completeSignIn();
    return () => { active = false; };
  }, []);

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center">
      <p className="text-xs font-semibold tracking-[0.24em] text-[#9a8151]">TIAL ADMIN STUDIO</p>
      <h1 className="mt-3 font-serif text-3xl text-[#29251f]">Verifying access</h1>
      <p role="status" className="mt-4 rounded-xl border border-gray-200 bg-white p-4 text-sm leading-6 text-gray-600">{message}</p>
      <a href="/signin" className="mt-5 text-sm font-semibold text-[#80683e] underline">Return to sign in</a>
    </div>
  );
}
