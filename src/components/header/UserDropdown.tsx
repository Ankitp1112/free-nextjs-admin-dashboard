"use client";

import { Link, useRouter } from "@/i18n/navigation";
import { ChevronDownIcon } from "@/icons";
import { useEffect, useState } from "react";
import { Dropdown } from "../ui/dropdown/Dropdown";

type AdminProfile = { name: string; email: string; role: string };

export default function UserDropdown() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [profile, setProfile] = useState<AdminProfile>({ name: "", email: "", role: "" });

  useEffect(() => {
    setProfile({
      name: sessionStorage.getItem("tial_admin_name") || "",
      email: sessionStorage.getItem("tial_admin_email") || "",
      role: sessionStorage.getItem("tial_admin_role") || "",
    });
  }, []);

  const signOut = () => {
    ["tial_access_token", "tial_refresh_token", "tial_admin_name", "tial_admin_email", "tial_admin_role"].forEach((key) => sessionStorage.removeItem(key));
    setIsOpen(false);
    router.replace("/signin");
  };

  const initials = profile.name.trim().split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join("") || "T";

  return (
    <div className="relative">
      <button type="button" onClick={() => setIsOpen((value) => !value)} aria-expanded={isOpen} className="dropdown-toggle flex items-center text-gray-700 dark:text-gray-400">
        <span className="me-3 flex h-11 w-11 items-center justify-center overflow-hidden rounded-full border border-[#d8c9aa] bg-[#fbf8f2] text-sm font-semibold text-[#79633b]" aria-label="Signed-in TIAL administrator">{initials}</span>
        <span className="me-1 block max-w-28 truncate text-theme-sm font-medium">{profile.name || "TIAL admin"}</span>
        <ChevronDownIcon className={`size-5 text-gray-500 transition-transform duration-200 dark:text-gray-400 ${isOpen ? "rotate-180" : ""}`} />
      </button>
      <Dropdown isOpen={isOpen} onClose={() => setIsOpen(false)} className="absolute mt-4.25 flex w-72 flex-col rounded-2xl border border-gray-200 bg-white p-4 shadow-theme-lg ltr:right-0 rtl:right-auto rtl:left-0 dark:border-gray-800 dark:bg-gray-dark">
        <p className="text-xs font-semibold uppercase tracking-widest text-[#9a8151]">TIAL administrator</p>
        <p className="mt-2 break-words text-sm font-semibold text-gray-800 dark:text-gray-200">{profile.name || "Identity unavailable"}</p>
        <p className="mt-1 break-all text-sm text-gray-500 dark:text-gray-400">{profile.email || "No verified email available"}</p>
        {profile.role && <p className="mt-2 text-xs capitalize text-gray-500 dark:text-gray-400">Access role: {profile.role}</p>}
        <div className="mt-4 border-t border-gray-100 pt-3 dark:border-gray-800">
          <Link href="/profile" onClick={() => setIsOpen(false)} className="block rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/5">Admin profile</Link>
          <button type="button" onClick={signOut} className="mt-1 w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10">Sign out</button>
        </div>
      </Dropdown>
    </div>
  );
}
