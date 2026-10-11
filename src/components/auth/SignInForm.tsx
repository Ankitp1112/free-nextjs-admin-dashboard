"use client";

import { useState } from "react";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export default function SignInForm() {
  const [email,setEmail]=useState("");
  const [password,setPassword]=useState("");
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState("");
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
    <form onSubmit={signIn} className="space-y-5">
      <div><label htmlFor="email" className="text-sm font-medium text-gray-700">Email address</label><input id="email" type="email" autoComplete="username" required value={email} onChange={e=>setEmail(e.target.value)} className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-[#b99b62]" placeholder="you@example.com"/></div>
      <div><label htmlFor="password" className="text-sm font-medium text-gray-700">Password</label><input id="password" type="password" autoComplete="current-password" required value={password} onChange={e=>setPassword(e.target.value)} className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-[#b99b62]" placeholder="Enter your password"/></div>
      {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm leading-5 text-red-800">{error}</p>}
      <button disabled={busy} className="w-full rounded-xl bg-[#29251f] px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-[#514637] disabled:opacity-60">{busy?"Verifying access…":"Sign in securely"}</button>
    </form>
    <p className="mt-5 text-xs leading-5 text-gray-500">Sessions are kept in this browser tab. Never share your password or access token.</p>
  </div>;
}
