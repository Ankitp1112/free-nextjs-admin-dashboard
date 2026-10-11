"use client";

import { useEffect, useState } from "react";

type ModuleKey = "products" | "content" | "media" | "team" | "integrations" | "settings";

const copy: Record<ModuleKey, { eyebrow: string; title: string; description: string; items: string[]; action: string }> = {
  products: { eyebrow: "CATALOG", title: "Product management", description: "A dedicated workspace for TIAL's Shopify catalog. Live product editing becomes available after the secure Shopify connection is verified.", items: ["Product catalogue and variants", "Pricing, inventory and availability", "Product images and descriptions", "Draft changes before publishing"], action: "Shopify connection" },
  content: { eyebrow: "BRAND CONTENT", title: "Content studio", description: "Prepare and review brand stories, campaign copy and editorial content before publishing.", items: ["Brand story and about-page copy", "Campaign and collection content", "Draft / review / publish workflow", "Editorial history and audit trail"], action: "Open settings" },
  media: { eyebrow: "STOREFRONT", title: "Homepage media", description: "Manage the visual assets planned for TIAL's storefront without changing the published Shopify theme directly.", items: ["Homepage hero and campaign imagery", "Image previews and alt text", "Asset review before publishing", "Safe separation from the live theme"], action: "Shopify connection" },
  team: { eyebrow: "ACCESS CONTROL", title: "Team & access", description: "The backend has an admin-membership model. Team changes should only be enabled after authenticated owner access is connected.", items: ["Owner and editor roles", "Active / inactive membership", "Access review and audit events", "Least-privilege permissions"], action: "Open settings" },
  integrations: { eyebrow: "CONNECTIONS", title: "Shopify connection", description: "Check the TIAL admin API and prepare the OAuth connection. A healthy API response does not by itself prove that Shopify authorization is complete.", items: ["Supabase admin API status", "Shopify OAuth authorization", "Private token storage on the backend", "Product and content scopes"], action: "Check API status" },
  settings: { eyebrow: "WORKSPACE", title: "Admin settings", description: "Workspace configuration and operational health for the TIAL Admin Studio.", items: ["API endpoint and service health", "Store domain configuration", "Admin role and security review", "Connection troubleshooting"], action: "Check API status" },
};

export default function AdminModule({ module }: { module: ModuleKey }) {
  const [status, setStatus] = useState<"checking" | "online" | "error">("checking");
  const [detail, setDetail] = useState("Checking the admin API…");
  const data = copy[module];

  async function checkStatus() {
    setStatus("checking");
    setDetail("Checking the admin API…");
    try {
      const response = await fetch("https://fjzpknwcdecoxdvzrljy.supabase.co/functions/v1/tial-admin-status", { cache: "no-store" });
      if (!response.ok) throw new Error(`API returned HTTP ${response.status}`);
      const payload = await response.json();
      setStatus("online");
      setDetail(`API responded successfully${payload.version ? ` · version ${payload.version}` : ""}. Shopify authorization must be checked separately.`);
    } catch (error) {
      setStatus("error");
      setDetail(error instanceof Error ? error.message : "Unable to reach the admin API.");
    }
  }

  useEffect(() => { if (module === "integrations" || module === "settings") void checkStatus(); }, [module]);

  return (
    <main className="space-y-6">
      <div className="rounded-2xl border border-[#e7dfd0] bg-[#fbf8f2] p-6 sm:p-8">
        <p className="text-xs font-semibold tracking-[0.24em] text-[#9a8151]">{data.eyebrow}</p>
        <div className="mt-3 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div><h1 className="font-serif text-3xl text-[#29251f] sm:text-4xl">{data.title}</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-[#71695d]">{data.description}</p></div>
          <span className="inline-flex w-fit items-center rounded-full border border-[#d8c9aa] bg-white px-3 py-1.5 text-xs font-medium text-[#79633b]">TIAL Admin Studio</span>
        </div>
      </div>
      {(module === "integrations" || module === "settings") && <section className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
        <div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="font-semibold text-gray-900 dark:text-white">Admin API health</h2><p className="mt-1 text-sm text-gray-500">{detail}</p></div><span className={`rounded-full px-3 py-1 text-xs font-semibold ${status === "online" ? "bg-green-50 text-green-700" : status === "error" ? "bg-red-50 text-red-700" : "bg-gray-100 text-gray-600"}`}>{status === "online" ? "API online" : status === "error" ? "Check failed" : "Checking…"}</span></div>
        <button onClick={() => void checkStatus()} className="mt-4 rounded-lg border border-[#cbb78e] px-4 py-2 text-sm font-medium text-[#79633b] hover:bg-[#fbf8f2]">Refresh status</button>
      </section>}
      <section className="grid gap-4 md:grid-cols-2">
        {data.items.map((item, index) => <article key={item} className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900"><div className="flex items-start gap-3"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#f6f0e4] text-sm font-semibold text-[#8a7042]">0{index + 1}</span><div><h2 className="font-semibold text-gray-900 dark:text-white">{item}</h2><p className="mt-1 text-sm leading-5 text-gray-500">Planned workspace capability</p></div></div></article>)}
      </section>
      <p className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">Some controls are intentionally not active yet. Product writes and content publishing must wait until authenticated admin access and the Shopify OAuth exchange are verified; this avoids showing mock data as live store data.</p>
    </main>
  );
}
