"use client";

import { useState } from "react";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export default function SignInForm() {
  const [email,setEmail]=useState("");
  const [password,setPassword]=useState("");
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState("");
  function signInWithGoogle() {
    setError("");
    if (!SUPABASE_URL || !SUPABASE_KEY) {
      setError("Admin sign-in is not configured. Please try again later.");
      return;
    }
    const redirectTo = `${window.location.origin}/signin/callback`;
    const authorizeUrl = new URL(`${SUPABASE_URL}/auth/v1/authorize`);
    authorizeUrl.searchParams.set("provider", "google");
    authorizeUrl.searchParams.set("redirect_to", redirectTo);
    authorizeUrl.searchParams.set("prompt", "select_account");
    window.location.assign(authorizeUrl.toString());
  }

  async function signIn(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setBusy(true); setError("");
    if (!SUPABASE_URL || !SUPABASE_KEY) { setError("Admin sign-in is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in Vercel."); setBusy(false); return; }
    try {
      const response=await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`,{method:"POST",headers:{"Content-Type":"application/json","apikey":SUPABASE_KEY},body:JSON.stringify({email,password})});
      const payload=await response.json();
      if(!response.ok || !payload.access_token) throw new Error(payload.msg || payload.message || "Sign-in failed. Check your credentials.");
      const userResponse=await fetch(`${SUPABASE_URL}/auth/v1/user`,{headers:{"apikey":SUPABASE_KEY,"Authorization":`Bearer ${payload.access_token}`}});
      const user=await userResponse.json();
      if(!userResponse.ok || !user.id) throw new Error("Could not verify your session. Please try again.");
      const memberResponse=await fetch(`${SUPABASE_URL}/rest/v1/admin_members?select=role,is_active&user_id=eq.${encodeURIComponent(user.id)}`,{headers:{"apikey":SUPABASE_KEY,"Authorization":`Bearer ${payload.access_token}`}});
      const members=await memberResponse.json();
      if(!memberResponse.ok || !members?.[0]?.is_active || !["owner","admin","editor","viewer"].includes(members?.[0]?.role)) throw new Error("This account is not an active TIAL Admin member. Ask the owner to grant access.");
      sessionStorage.setItem("tial_access_token",payload.access_token);
      if(payload.refresh_token) sessionStorage.setItem("tial_refresh_token",payload.refresh_token);
      sessionStorage.setItem("tial_admin_role",members[0].role);
      window.location.assign("/");
    } catch(err) { setError(err instanceof Error?err.message:"Unable to sign in."); }
    finally { setBusy(false); }
  }
  return <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center">
    <div className="mb-8"><p className="text-xs font-semibold tracking-[0.24em] text-[#9a8151]">TIAL ADMIN STUDIO</p><h1 className="mt-3 font-serif text-4xl text-[#29251f]">Welcome back.</h1><p className="mt-3 text-sm leading-6 text-gray-500">Sign in with an existing TIAL admin account. Public account registration is intentionally disabled.</p></div>
    <button type="button" onClick={signInWithGoogle} className="mb-5 flex w-full items-center justify-center gap-3 rounded-xl border border-gray-200 bg-white px-5 py-3.5 text-sm font-semibold text-[#29251f] transition hover:bg-gray-50">
      <svg aria-hidden="true" viewBox="0 0 48 48" className="h-5 w-5"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.01 13.22l7.98 6.19C11.89 13.72 17.42 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.76 7.18l7.73 6C44.42 37.96 46.98 31.87 46.98 24.55z"/><path fill="#FBBC05" d="M9.99 28.59A14.4 14.4 0 0 1 9.2 24c0-1.59.27-3.12.76-4.59l-7.98-6.19A23.9 23.9 0 0 0 0 24c0 3.87.93 7.52 2.57 10.78l7.42-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.91-5.8l-7.73-6c-2.14 1.44-4.89 2.3-8.18 2.3-6.58 0-12.11-4.22-14.01-10.09l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>
      Continue with Google
    </button>
    <div className="mb-5 flex items-center gap-3 text-xs text-gray-400"><span className="h-px flex-1 bg-gray-200" />OR USE EMAIL<span className="h-px flex-1 bg-gray-200" /></div>
    <form onSubmit={signIn} className="space-y-5">
      <div><label htmlFor="email" className="text-sm font-medium text-gray-700">Email address</label><input id="email" type="email" autoComplete="username" required value={email} onChange={e=>setEmail(e.target.value)} className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-[#b99b62]" placeholder="you@example.com"/></div>
      <div><label htmlFor="password" className="text-sm font-medium text-gray-700">Password</label><input id="password" type="password" autoComplete="current-password" required value={password} onChange={e=>setPassword(e.target.value)} className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-[#b99b62]" placeholder="Enter your password"/></div>
      {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm leading-5 text-red-800">{error}</p>}
      <button disabled={busy} className="w-full rounded-xl bg-[#29251f] px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-[#514637] disabled:opacity-60">{busy?"Verifying access…":"Sign in securely"}</button>
    </form>
    <p className="mt-5 text-xs leading-5 text-gray-500">Sessions are kept in this browser tab. Never share your password or access token.</p>
  </div>;
}
