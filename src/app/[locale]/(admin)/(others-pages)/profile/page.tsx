"use client";

import { useEffect, useState } from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";

type Profile = { name: string; email: string; role: string };

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile>({ name: "", email: "", role: "" });

  useEffect(() => {
    setProfile({
      name: sessionStorage.getItem("tial_admin_name") || "",
      email: sessionStorage.getItem("tial_admin_email") || "",
      role: sessionStorage.getItem("tial_admin_role") || "",
    });
  }, []);

  const initials = profile.name.trim().split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join("") || "T";

  return (
    <div className="space-y-6">
      <PageBreadcrumb pageTitle="TIAL Admin Profile" />
      <section className="rounded-2xl border border-gray-200 bg-white p-5 lg:p-6 dark:border-gray-800 dark:bg-gray-900">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#9a8151]">TIAL ADMIN STUDIO</p>
        <h1 className="mt-2 text-xl font-semibold text-gray-900 dark:text-white">Authenticated profile</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-500 dark:text-gray-400">This page displays identity details returned for the signed-in TIAL administrator. Personal address, tax, phone and social details are not collected here, so no placeholder values are shown.</p>
        <div className="mt-6 flex flex-col gap-5 rounded-xl border border-gray-100 p-5 dark:border-gray-800 sm:flex-row sm:items-center">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full border border-[#d8c9aa] bg-[#fbf8f2] text-2xl font-semibold text-[#79633b]">{initials}</div>
          <div className="min-w-0">
            <h2 className="break-words text-lg font-semibold text-gray-900 dark:text-white">{profile.name || "Identity unavailable"}</h2>
            <p className="mt-1 break-all text-sm text-gray-500 dark:text-gray-400">{profile.email || "No verified email available"}</p>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{profile.role ? `Access role: ${profile.role}` : "Access role unavailable"}</p>
          </div>
        </div>
        <div className="mt-5 rounded-xl border border-[#e7dfd0] bg-[#fbf8f2] p-4 text-sm leading-6 text-[#71695d]">Profile editing is not enabled. Changes to access and identity must be made through the authorized Supabase authentication and admin-membership records.</div>
      </section>
    </div>
  );
}
