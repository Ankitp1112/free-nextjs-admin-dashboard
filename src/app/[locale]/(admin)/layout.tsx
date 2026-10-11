"use client";

import { useEffect, useState } from "react";
import { useSidebar } from "@/context/SidebarContext";
import AppHeader from "@/layout/AppHeader";
import AppSidebar from "@/layout/AppSidebar";
import Backdrop from "@/layout/Backdrop";
import React from "react";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

function AdminSessionGate({ children }: { children: React.ReactNode }) {
  const [state,setState]=useState<"checking"|"allowed"|"blocked">("checking");
  useEffect(()=>{
    let active=true;
    async function verify() {
      let token=sessionStorage.getItem("tial_access_token");
      const refreshToken=sessionStorage.getItem("tial_refresh_token");
      if(!token || !SUPABASE_URL || !SUPABASE_KEY) { window.location.replace("/signin"); return; }
      try {
        let headers={"apikey":SUPABASE_KEY,"Authorization":`Bearer ${token}`};
        let userRes=await fetch(`${SUPABASE_URL}/auth/v1/user`,{headers,cache:"no-store"});
        if(!userRes.ok && refreshToken) {
          const refreshRes=await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=refresh_token`,{
            method:"POST",headers:{"apikey":SUPABASE_KEY,"Content-Type":"application/json"},cache:"no-store",
            body:JSON.stringify({refresh_token:refreshToken})
          });
          const refreshed=await refreshRes.json();
          if(refreshRes.ok && refreshed.access_token && refreshed.refresh_token) {
            token=refreshed.access_token;
            sessionStorage.setItem("tial_access_token",refreshed.access_token);
            sessionStorage.setItem("tial_refresh_token",refreshed.refresh_token);
            headers={"apikey":SUPABASE_KEY,"Authorization":`Bearer ${token}`};
            userRes=await fetch(`${SUPABASE_URL}/auth/v1/user`,{headers,cache:"no-store"});
          }
        }
        if(!userRes.ok) throw new Error("Session expired");
        const user=await userRes.json();
        const memberRes=await fetch(`${SUPABASE_URL}/rest/v1/admin_members?select=role,is_active&user_id=eq.${encodeURIComponent(user.id)}`,{headers,cache:"no-store"});
        const members=await memberRes.json();
        if(!memberRes.ok || !members?.[0]?.is_active || !["owner","admin","editor","viewer"].includes(members?.[0]?.role)) throw new Error("No active membership");
        sessionStorage.setItem("tial_admin_role",members[0].role);
        const metadata = user.user_metadata || {};
        const displayName = metadata.full_name || metadata.name || user.email?.split("@")[0] || "TIAL Admin";
        sessionStorage.setItem("tial_admin_name", displayName);
        sessionStorage.setItem("tial_admin_email", user.email || "");
        if(active) setState("allowed");
      } catch {
        sessionStorage.removeItem("tial_access_token"); sessionStorage.removeItem("tial_refresh_token"); sessionStorage.removeItem("tial_admin_role"); sessionStorage.removeItem("tial_admin_name"); sessionStorage.removeItem("tial_admin_email");
        if(active) setState("blocked");
        window.location.replace("/signin");
      }
    }
    void verify();
    return ()=>{active=false};
  },[]);
  if(state!=="allowed") return <div className="flex min-h-screen items-center justify-center bg-[#fbf8f2] p-6"><div className="max-w-sm text-center"><div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-[#b99b62] font-serif text-xl text-[#79633b]">T</div><p className="mt-4 font-serif text-2xl text-[#29251f]">Verifying TIAL access</p><p className="mt-2 text-sm text-[#71695d]">Checking your secure session and active workspace membership…</p></div></div>;
  return <>{children}</>;
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { isExpanded, isHovered, isMobileOpen } = useSidebar();
  const mainContentMargin = isMobileOpen ? "ml-0" : isExpanded || isHovered ? "lg:ml-[290px]" : "lg:ml-[90px]";
  return <AdminSessionGate><div className="min-h-screen xl:flex"><AppSidebar /><Backdrop /><div className={`flex-1 transition-all duration-300 ease-in-out ${mainContentMargin}`}><div className="relative"><AppHeader /><button type="button" onClick={() => { sessionStorage.removeItem("tial_access_token"); sessionStorage.removeItem("tial_refresh_token"); sessionStorage.removeItem("tial_admin_role"); sessionStorage.removeItem("tial_admin_name"); sessionStorage.removeItem("tial_admin_email"); window.location.assign("/signin"); }} className="absolute right-5 top-5 z-40 rounded-lg border border-[#d8c9aa] bg-white px-3 py-2 text-xs font-medium text-[#79633b] hover:bg-[#fbf8f2]">Sign out</button></div><div className="p-4 mx-auto max-w-(--breakpoint-2xl) md:p-6">{children}</div></div></div></AdminSessionGate>;
}
