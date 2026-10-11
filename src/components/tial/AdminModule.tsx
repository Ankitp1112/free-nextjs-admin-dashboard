"use client";

import { useEffect, useState } from "react";

type ModuleKey = "products" | "content" | "media" | "team" | "integrations" | "settings";
type ApiStatus = "checking" | "online" | "error";
const copy: Record<ModuleKey, { eyebrow: string; title: string; description: string; items: string[] }> = {
  products: { eyebrow: "CATALOG", title: "Product management", description: "A dedicated workspace for TIAL's Shopify catalog. Real products and edits require a verified secure Shopify connection.", items: ["Product catalogue and variants", "Pricing, inventory and availability", "Product images and descriptions", "Review changes before publishing"] },
  content: { eyebrow: "BRAND CONTENT", title: "Content Studio", description: "Prepare brand stories, campaign copy and editorial content for review before publishing.", items: ["Brand story and about-page copy", "Campaign and collection content", "Draft / review / publish workflow", "Editorial history and audit trail"] },
  media: { eyebrow: "STOREFRONT", title: "Homepage Media", description: "Review visual assets planned for TIAL's storefront without changing the published Shopify theme directly.", items: ["Homepage hero and campaign imagery", "Image previews and alt text", "Asset review before publishing", "Safe separation from the live theme"] },
  team: { eyebrow: "ACCESS CONTROL", title: "Team & Access", description: "The backend has an admin-membership model. Invitations and role changes require authenticated owner access.", items: ["Owner, admin, editor and viewer roles", "Active / inactive membership", "Access review and audit events", "Least-privilege permissions"] },
  integrations: { eyebrow: "CONNECTIONS", title: "Shopify Connection", description: "Check the TIAL admin API and prepare the OAuth connection. An API health response alone does not prove Shopify authorization is complete.", items: ["Supabase admin API status", "Shopify OAuth authorization", "Private token storage on the backend", "Required product and content scopes"] },
  settings: { eyebrow: "WORKSPACE", title: "Admin Settings", description: "Workspace configuration and operational health for TIAL Admin Studio.", items: ["API endpoint and service health", "Store domain configuration", "Admin role and security review", "Connection troubleshooting"] },
};
export default function AdminModule({ module }: { module: ModuleKey }) {
  const [status, setStatus] = useState<ApiStatus>("checking");
  const [detail, setDetail] = useState("Check the admin API to confirm service availability.");
  const [draftTitle, setDraftTitle] = useState("");
  const [draftBody, setDraftBody] = useState("");
  const [preview, setPreview] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [connectError, setConnectError] = useState("");
  const data = copy[module];
  async function checkStatus() {
    setStatus("checking"); setDetail("Checking the admin API…");
    try {
      const token = sessionStorage.getItem("tial_access_token");
      const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      if (!token || !key) throw new Error("Sign in again to check the admin API.");
      const response = await fetch("https://fjzpknwcdecoxdvzrljy.supabase.co/functions/v1/tial-admin-status", { cache: "no-store", headers: { apikey: key, Authorization: `Bearer ${token}` } });
      if (!response.ok) throw new Error(`API returned HTTP ${response.status}`);
      const payload = await response.json();
      setStatus("online"); setDetail(`API responded successfully${payload.version ? ` · version ${payload.version}` : ""}. Shopify authorization is a separate check.`);
    } catch (error) { setStatus("error"); setDetail(error instanceof Error ? error.message : "Unable to reach the admin API."); }
  }
  useEffect(() => { if (module === "integrations" || module === "settings") void checkStatus(); }, [module]);
  return <main className="space-y-6">
    <header className="rounded-2xl border border-[#e7dfd0] bg-[#fbf8f2] p-6 sm:p-8">
      <p className="text-xs font-semibold tracking-[0.24em] text-[#9a8151]">{data.eyebrow}</p>
      <div className="mt-3 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div><h1 className="font-serif text-3xl text-[#29251f] sm:text-4xl">{data.title}</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-[#71695d]">{data.description}</p></div>
        <span className="inline-flex w-fit items-center rounded-full border border-[#d8c9aa] bg-white px-3 py-1.5 text-xs font-medium text-[#79633b]">TIAL Admin Studio</span>
      </div>
    </header>
    {(module === "integrations" || module === "settings") && <section className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
      <div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="font-semibold text-gray-900 dark:text-white">Admin API health</h2><p className="mt-1 text-sm text-gray-500">{detail}</p></div><span className={`rounded-full px-3 py-1 text-xs font-semibold ${status === "online" ? "bg-green-50 text-green-700" : status === "error" ? "bg-red-50 text-red-700" : "bg-gray-100 text-gray-600"}`}>{status === "online" ? "API online" : status === "error" ? "Check failed" : "Checking…"}</span></div>
      <div className="mt-4 flex flex-wrap gap-3">
        <button onClick={() => void checkStatus()} className="rounded-lg border border-[#cbb78e] px-4 py-2 text-sm font-medium text-[#79633b] hover:bg-[#fbf8f2]">Refresh status</button>
        {module === "integrations" && <button disabled={connecting} onClick={async () => { setConnecting(true); setConnectError(""); try { const token = sessionStorage.getItem("tial_access_token"); const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY; if (!token || !key) throw new Error("Sign in again before connecting Shopify."); const res = await fetch("https://fjzpknwcdecoxdvzrljy.supabase.co/functions/v1/tial-shopify-oauth-start", { headers: { apikey: key, Authorization: `Bearer ${token}` } }); const payload = await res.json(); if (!res.ok || !payload.authorizationUrl) throw new Error(payload.error || "Could not start Shopify authorization."); window.location.assign(payload.authorizationUrl); } catch (e) { setConnectError(e instanceof Error ? e.message : "Could not start Shopify authorization."); setConnecting(false); } }} className="rounded-lg bg-[#29251f] px-4 py-2 text-sm font-medium text-white disabled:opacity-60">{connecting ? "Opening Shopify…" : "Connect Shopify securely"}</button>}
      </div>
      {connectError && <p role="alert" className="mt-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">{connectError}</p>}
    </section>}
    {module === "content" && <section className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
      <h2 className="font-serif text-xl text-gray-900 dark:text-white">Editorial draft pad</h2><p className="mt-1 text-sm text-gray-500">Create a local preview. Database save and publishing are not enabled yet.</p>
      <form className="mt-4 space-y-4" onSubmit={e=>{e.preventDefault();setPreview(true)}}>
        <div><label htmlFor="draft-title" className="text-sm font-medium">Draft title</label><input id="draft-title" required maxLength={180} value={draftTitle} onChange={e=>{setDraftTitle(e.target.value);setPreview(false)}} className="mt-2 w-full rounded-xl border border-gray-200 bg-transparent px-3 py-3 text-sm" placeholder="e.g. The TIAL woman"/></div>
        <div><label htmlFor="draft-copy" className="text-sm font-medium">Copy / notes</label><textarea id="draft-copy" rows={5} value={draftBody} onChange={e=>{setDraftBody(e.target.value);setPreview(false)}} className="mt-2 w-full rounded-xl border border-gray-200 bg-transparent px-3 py-3 text-sm" placeholder="Write a draft for review…"/></div>
        <button className="rounded-xl bg-[#29251f] px-5 py-3 text-sm font-medium text-white hover:bg-[#514637]" type="submit">Preview draft</button>
      </form>
      {preview && <div className="mt-4 rounded-xl border border-[#d8c9aa] bg-[#fbf8f2] p-4"><p className="text-xs font-semibold tracking-widest text-[#9a8151]">LOCAL PREVIEW · NOT SAVED</p><h3 className="mt-2 font-serif text-xl text-[#29251f]">{draftTitle}</h3><p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-[#71695d]">{draftBody || "No body text added yet."}</p></div>}
    </section>}
    <section className="grid gap-4 md:grid-cols-2">
      {data.items.map((item, index) => <article key={item} className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900"><div className="flex items-start gap-3"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#f6f0e4] text-sm font-semibold text-[#8a7042]">0{index + 1}</span><div><h2 className="font-semibold text-gray-900 dark:text-white">{item}</h2><p className="mt-1 text-sm leading-5 text-gray-500">Workspace capability · pending live integration</p></div></div></article>)}
    </section>
    <p className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">Live product writes, media replacement and content publishing remain disabled until authenticated admin access and Shopify OAuth are verified. No sample records are presented as live store data.</p>
  </main>;
}
