"use client";

import { Link } from "@/i18n/navigation";
import { useEffect, useState } from "react";

const modules = [
  { href: "/products", number: "01", title: "Products", description: "Catalog, variants, pricing and product media." },
  { href: "/inventory", number: "02", title: "Inventory", description: "Stock by variant and Shopify location." },
  { href: "/orders", number: "03", title: "Orders", description: "Recent orders, payment and fulfilment status." },
  { href: "/customers", number: "04", title: "Customers", description: "Customer records with restricted access." },
  { href: "/insights", number: "05", title: "Store insights", description: "Traffic and sales metrics when Shopify reports allow access." },
  { href: "/content", number: "06", title: "Content studio", description: "Brand stories, campaigns and editorial drafts." },
  { href: "/media", number: "07", title: "Homepage media", description: "Storefront imagery and asset review." },
  { href: "/integrations", number: "08", title: "Shopify connection", description: "OAuth setup and API health checks." },
  { href: "/team", number: "09", title: "Team & access", description: "Roles, membership and access review." },
  { href: "/settings", number: "10", title: "Settings", description: "Workspace configuration and security." },
];

export default function TialOverview() {
  const [api, setApi] = useState<"checking" | "online" | "error">("checking");
  useEffect(() => {
    const token = sessionStorage.getItem("tial_access_token");
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!token || !key) { setApi("error"); return; }
    fetch("https://fjzpknwcdecoxdvzrljy.supabase.co/functions/v1/tial-admin-status", { cache: "no-store", headers: { apikey: key, Authorization: `Bearer ${token}` } })
      .then((response) => { if (!response.ok) throw new Error("API unavailable"); return response.json(); })
      .then(() => setApi("online"))
      .catch(() => setApi("error"));
  }, []);

  return <main className="space-y-7">
    <section className="overflow-hidden rounded-2xl border border-[#e7dfd0] bg-[#fbf8f2] p-6 sm:p-9">
      <p className="text-xs font-semibold tracking-[0.24em] text-[#9a8151]">FROM EVERYDAY ELEGANCE TO A LASTING SIGNATURE</p>
      <div className="mt-4 grid gap-6 md:grid-cols-[1fr_auto] md:items-end">
        <div><h1 className="font-serif text-4xl tracking-tight text-[#29251f] sm:text-5xl">TIAL Admin Studio</h1><p className="mt-4 max-w-2xl text-sm leading-6 text-[#71695d]">Your workspace for managing the TIAL brand, store content and operations. Carefully controlled changes, with the live storefront kept separate until publishing is authorized.</p></div>
        <div className="rounded-xl border border-[#d8c9aa] bg-white px-4 py-3"><p className="text-xs uppercase tracking-widest text-[#9a8151]">Admin API</p><p className="mt-1 flex items-center gap-2 text-sm font-semibold text-[#29251f]"><span className={`h-2 w-2 rounded-full ${api === "online" ? "bg-emerald-500" : api === "error" ? "bg-red-500" : "bg-amber-400"}`}/>{api === "online" ? "Responding" : api === "error" ? "Unavailable" : "Checking…"}</p></div>
      </div>
    </section>
    <div className="flex items-end justify-between gap-3"><div><p className="text-xs font-semibold tracking-[0.2em] text-[#9a8151]">WORKSPACES</p><h2 className="mt-2 font-serif text-2xl text-gray-900 dark:text-white">Manage TIAL</h2></div><span className="text-xs text-gray-500">6 modules</span></div>
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {modules.map((item) => <Link key={item.href} href={item.href} className="group rounded-2xl border border-gray-200 bg-white p-5 transition hover:-translate-y-0.5 hover:border-[#cbb78e] hover:shadow-lg dark:border-gray-800 dark:bg-gray-900">
        <div className="flex items-center justify-between"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f6f0e4] font-serif text-sm text-[#8a7042]">{item.number}</span><span className="text-lg text-[#9a8151] transition group-hover:translate-x-1">↗</span></div>
        <h3 className="mt-5 font-serif text-xl text-gray-900 dark:text-white">{item.title}</h3><p className="mt-2 text-sm leading-6 text-gray-500">{item.description}</p>
      </Link>)}
    </section>
    <section className="rounded-2xl border border-amber-200 bg-amber-50 p-5"><h2 className="font-semibold text-amber-950">Connection status matters</h2><p className="mt-2 text-sm leading-6 text-amber-900">The admin API can respond even while Shopify authorization is incomplete. Live product edits and storefront publishing stay disabled until the secure OAuth connection and authenticated owner session are verified.</p></section>
  </main>;
}
