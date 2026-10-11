"use client";

import { useEffect, useState } from "react";

type ModuleKey = "products" | "content" | "media" | "team" | "integrations" | "settings";
type ApiStatus = "checking" | "online" | "error";
type Product = { id: string; title: string; status: string; handle: string; vendor?: string; productType?: string; image?: string | null; variantCount: number; variants: { id: string; title: string; price: string; sku?: string | null; inventoryQuantity?: number | null }[] };
type LiveShopify = { connected?: boolean; storedConnection?: boolean; apiVerified?: boolean; productRead?: boolean; shopDomain?: string | null; storeName?: string | null; scopes?: string[]; errorCode?: string | null };
const liveLabels = [{ key: "admin", title: "Supabase admin API status" }, { key: "oauth", title: "Shopify OAuth authorization" }, { key: "token", title: "Private token storage on the backend" }, { key: "scopes", title: "Required product and content scopes" }] as const;
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
  const [shopify, setShopify] = useState<LiveShopify | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [productsError, setProductsError] = useState("");
  const [productCount, setProductCount] = useState<number | null>(null);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editStatus, setEditStatus] = useState("ACTIVE");
  const [editPrices, setEditPrices] = useState<Record<string, string>>({});
  const [savingProductId, setSavingProductId] = useState<string | null>(null);
  const [saveError, setSaveError] = useState("");
  const [saveMessage, setSaveMessage] = useState("");
  const [imageUrls, setImageUrls] = useState<Record<string,string>>({});
  const [imageAlts, setImageAlts] = useState<Record<string,string>>({});
  const [imageSavingId, setImageSavingId] = useState<string | null>(null);
  const [productImages, setProductImages] = useState<Record<string,{id:string;url:string;alt:string;width?:number;height?:number}[]>>({});
  const [imagesLoadingId, setImagesLoadingId] = useState<string | null>(null);
  const [imagesOpenId, setImagesOpenId] = useState<string | null>(null);
  const [imageFileData, setImageFileData] = useState<Record<string,{filename:string;mimeType:string;base64:string}>>({});
  const [imageAltEdits, setImageAltEdits] = useState<Record<string,string>>({});
  const [collectionTitle, setCollectionTitle] = useState("");
  const [collectionDescription, setCollectionDescription] = useState("");
  const [collectionSaving, setCollectionSaving] = useState(false);
  const [collectionMessage, setCollectionMessage] = useState("");
  const [collectionError, setCollectionError] = useState("");
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
      setStatus("online"); setShopify(payload.shopify ?? null); setDetail(`API responded successfully${payload.version ? ` · version ${payload.version}` : ""}. ${payload.shopify?.apiVerified ? `Shopify API verified${payload.shopify?.storeName ? ` · ${payload.shopify.storeName}` : ""}.` : `Shopify check: ${payload.shopify?.errorCode ?? "pending authorization"}.`}`);
    } catch (error) { setStatus("error"); setDetail(error instanceof Error ? error.message : "Unable to reach the admin API."); }
  }
  async function loadProducts() {
    setProductsLoading(true); setProductsError("");
    try {
      const token = sessionStorage.getItem("tial_access_token");
      const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      if (!token || !key) throw new Error("Sign in again to view Shopify products.");
      const response = await fetch("https://fjzpknwcdecoxdvzrljy.supabase.co/functions/v1/tial-admin-products?limit=100", { cache: "no-store", headers: { apikey: key, Authorization: `Bearer ${token}` } });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || `Product API returned HTTP ${response.status}`);
      setProducts(payload.products ?? []); setProductCount(payload.count ?? 0);
    } catch (error) {
      setProductsError(error instanceof Error ? error.message : "Could not load products.");
    } finally { setProductsLoading(false); }
  }


  async function mediaAction(body: Record<string, string>) {
    const token = sessionStorage.getItem("tial_access_token"), key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!token || !key) throw new Error("Sign in again before making changes.");
    const response = await fetch("https://fjzpknwcdecoxdvzrljy.supabase.co/functions/v1/tial-admin-media-collections", { method: "POST", headers: { apikey: key, Authorization: `Bearer ${token}`, "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const payload = await response.json();
    if (!response.ok) throw new Error(payload.error || `Request failed (HTTP ${response.status}).`);
    return payload;
  }
  async function loadProductImages(product: Product) {
    setImagesOpenId(product.id);
    setImagesLoadingId(product.id);
    setSaveError("");
    try {
      const payload = await mediaAction({ action: "list-images", productId: `gid://shopify/Product/${product.id}` });
      setProductImages(old=>({...old,[product.id]:payload.images??[]}));
    } catch(e) {
      setSaveError(e instanceof Error ? e.message : "Could not load product images.");
    } finally {
      setImagesLoadingId(null);
    }
  }
  async function uploadProductImage(product: Product) {
    const file = imageFileData[product.id]; if (!file) { setSaveError("Choose an image file first."); return; }
    setImageSavingId(product.id); setSaveError(""); setSaveMessage("");
    try { await mediaAction({ action: "upload-image", productId: `gid://shopify/Product/${product.id}`, ...file, alt: imageAlts[product.id] ?? product.title }); setSaveMessage(`Image uploaded to ${product.title}.`); setImageFileData(old=>({...old,[product.id]:{...old[product.id],base64:""}})); await loadProductImages(product); await loadProducts(); }
    catch(e) { setSaveError(e instanceof Error ? e.message : "Could not upload image."); } finally { setImageSavingId(null); }
  }
  async function removeProductImage(product: Product, mediaId: string) {
    if (!window.confirm("Remove this image from the live Shopify product? This cannot be undone here.")) return;
    setImageSavingId(product.id); setSaveError(""); setSaveMessage("");
    try { await mediaAction({ action: "delete-image", productId: `gid://shopify/Product/${product.id}`, mediaId }); setSaveMessage("Image removed from Shopify."); await loadProductImages(product); await loadProducts(); }
    catch(e) { setSaveError(e instanceof Error ? e.message : "Could not remove image."); } finally { setImageSavingId(null); }
  }
  async function saveImageAlt(product: Product, mediaId: string) {
    try { await mediaAction({ action: "update-image-alt", productId: `gid://shopify/Product/${product.id}`, mediaId, alt: imageAltEdits[mediaId] ?? "" }); setSaveMessage("Image alt text updated."); await loadProductImages(product); }
    catch(e) { setSaveError(e instanceof Error ? e.message : "Could not update image."); }
  }
  async function addProductImage(product: Product) {
    setImageSavingId(product.id); setSaveError(""); setSaveMessage("");
    try {
      await mediaAction({ action: "add-image", productId: `gid://shopify/Product/${product.id}`, imageUrl: imageUrls[product.id] ?? "", alt: imageAlts[product.id] ?? product.title });
      setSaveMessage(`Image submitted for ${product.title}.`); setImageUrls(old => ({...old,[product.id]:""})); await loadProducts();
    } catch(e) { setSaveError(e instanceof Error ? e.message : "Could not add image."); }
    finally { setImageSavingId(null); }
  }
  async function createCollection(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setCollectionSaving(true); setCollectionError(""); setCollectionMessage("");
    try {
      const payload = await mediaAction({ action: "create-collection", title: collectionTitle, description: collectionDescription });
      setCollectionMessage(`Created “${payload.collection?.title ?? collectionTitle}” in Shopify.`); setCollectionTitle(""); setCollectionDescription("");
    } catch(e) { setCollectionError(e instanceof Error ? e.message : "Could not create collection."); }
    finally { setCollectionSaving(false); }
  }

  function startEditing(product: Product) {
    setEditingProductId(product.id); setEditTitle(product.title); setEditStatus(product.status.toUpperCase());
    setEditPrices(Object.fromEntries(product.variants.map(v => [v.id, v.price])));
    setSaveError(""); setSaveMessage("");
  }
  async function saveProduct(product: Product) {
    setSavingProductId(product.id); setSaveError(""); setSaveMessage("");
    try {
      const token = sessionStorage.getItem("tial_access_token");
      const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      if (!token || !key) throw new Error("Sign in again before saving product changes.");
      const changedVariants = product.variants.filter(v => editPrices[v.id] !== v.price).map(v => ({ id: `gid://shopify/ProductVariant/${v.id}`, price: editPrices[v.id] }));
      const response = await fetch("https://fjzpknwcdecoxdvzrljy.supabase.co/functions/v1/tial-admin-product-update", {
        method: "PATCH", headers: { apikey: key, Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ productId: `gid://shopify/Product/${product.id}`, ...(editTitle.trim() !== product.title ? { title: editTitle.trim() } : {}), ...(editStatus !== product.status.toUpperCase() ? { status: editStatus } : {}), variants: changedVariants })
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || `Save failed (HTTP ${response.status}).`);
      setSaveMessage("Saved to Shopify successfully."); setEditingProductId(null); await loadProducts();
    } catch (error) { setSaveError(error instanceof Error ? error.message : "Could not save changes."); }
    finally { setSavingProductId(null); }
  }

  useEffect(() => { if (module === "integrations" || module === "settings") void checkStatus(); if (module === "products") void loadProducts(); }, [module]);
  return <main className="space-y-6">
    <header className="rounded-2xl border border-[#e7dfd0] bg-[#fbf8f2] p-6 sm:p-8">
      <p className="text-xs font-semibold tracking-[0.24em] text-[#9a8151]">{data.eyebrow}</p>
      <div className="mt-3 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div><h1 className="font-serif text-3xl text-[#29251f] sm:text-4xl">{data.title}</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-[#71695d]">{data.description}</p></div>
        <span className="inline-flex w-fit items-center rounded-full border border-[#d8c9aa] bg-white px-3 py-1.5 text-xs font-medium text-[#79633b]">TIAL Admin Studio</span>
      </div>
    </header>
    {module === "products" && <section className="rounded-2xl border border-[#e7dfd0] bg-white p-5"><form onSubmit={createCollection} className="mb-5 rounded-xl border border-[#d8c9aa] bg-[#fbf8f2] p-4">
        <h2 className="text-lg font-semibold text-[#29251f]">Create a new collection</h2><p className="mt-1 text-sm text-[#71695d]">Creates a collection in the live Shopify store.</p>
        <label className="mt-3 block text-xs font-semibold text-[#71695d]">Collection name</label><input required maxLength={255} value={collectionTitle} onChange={e=>setCollectionTitle(e.target.value)} placeholder="e.g. Everyday Kurtis" className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900"/>
        <label className="mt-3 block text-xs font-semibold text-[#71695d]">Description (optional)</label><textarea value={collectionDescription} onChange={e=>setCollectionDescription(e.target.value)} rows={2} placeholder="Describe this collection…" className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900"/>
        {collectionError && <p role="alert" className="mt-3 rounded-lg bg-red-50 p-2 text-sm text-red-800">{collectionError}</p>}{collectionMessage && <p className="mt-3 rounded-lg bg-green-50 p-2 text-sm text-green-800">{collectionMessage}</p>}
        <button type="submit" disabled={collectionSaving || !collectionTitle.trim()} className="mt-3 rounded-lg bg-[#29251f] px-4 py-2 text-sm font-medium text-white disabled:opacity-50">{collectionSaving ? "Creating collection…" : "Create collection in Shopify"}</button>
      </form></section>}
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
    {module === "products" && <section className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-5 dark:border-gray-800 dark:bg-gray-900">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div><h2 className="text-lg font-semibold text-gray-900 dark:text-white">Live Shopify products</h2><p className="mt-1 text-sm text-gray-500">{productCount === null ? "Loading your store catalogue…" : `${productCount} products returned from Shopify · read-only mode`}</p></div>
        <button onClick={() => void loadProducts()} disabled={productsLoading} className="rounded-lg border border-[#cbb78e] px-4 py-2 text-sm font-medium text-[#79633b] disabled:opacity-60">{productsLoading ? "Refreshing…" : "Refresh products"}</button>
      </div>
      {productsError && <div role="alert" className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">{productsError}<p className="mt-1">If this mentions a missing scope, reconnect Shopify after confirming the app has read_products access.</p></div>}
      {productsLoading && products.length === 0 && <p className="py-8 text-center text-sm text-gray-500">Fetching real products securely from Shopify…</p>}
      {!productsLoading && !productsError && products.length === 0 && productCount === 0 && <p className="py-8 text-center text-sm text-gray-500">Shopify returned no products for this store.</p>}
      {products.length > 0 && <div className="mt-4 space-y-3">{products.map((product) => <article key={product.id} className="flex gap-3 rounded-xl border border-gray-100 p-3 dark:border-gray-800">
        {product.image ? <img src={product.image} alt="" loading="lazy" className="h-20 w-20 rounded-lg border border-gray-100 object-cover dark:border-gray-800" /> : <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-xs text-gray-500 dark:bg-gray-800">No image</div>}
        <div className="min-w-0 flex-1"><h3 className="font-semibold text-gray-900 dark:text-white">{product.title}</h3><p className="mt-1 break-all text-xs text-gray-500">{product.handle}</p><div className="mt-2 flex flex-wrap gap-2 text-xs"><span className="rounded-full bg-gray-100 px-2 py-1 text-gray-700 dark:bg-gray-800 dark:text-gray-300">{product.status}</span><span className="rounded-full bg-gray-100 px-2 py-1 text-gray-700 dark:bg-gray-800 dark:text-gray-300">{product.variantCount} variants</span></div>{product.variants?.[0] && <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">From ₹{product.variants[0].price} · {product.variants[0].title}</p>}
        <div className="mt-3"><button onClick={()=>imagesOpenId===product.id?setImagesOpenId(null):void loadProductImages(product)} className="rounded-lg border border-[#cbb78e] px-3 py-2 text-sm font-medium text-[#79633b]">{imagesLoadingId===product.id?"Loading images…":imagesOpenId===product.id?"Close image manager":"Manage product images"}</button></div>
        {imagesOpenId===product.id && <div className="mt-3 space-y-3 rounded-xl border border-[#d8c9aa] bg-[#fbf8f2] p-3">
          <h4 className="font-semibold text-[#29251f]">Existing Shopify images</h4>
          {imagesLoadingId===product.id && <p role="status" className="rounded-lg bg-white p-3 text-sm text-gray-600">Connecting to Shopify and loading this product's images…</p>}
          {saveError && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">{saveError}</p>}
          {!imagesLoadingId && !saveError && (productImages[product.id]??[]).length===0 && <p className="text-sm text-gray-500">No product images found.</p>}
          {(productImages[product.id]??[]).map(img=><div key={img.id} className="flex gap-3 rounded-lg border border-gray-200 bg-white p-2">
            <img src={img.url} alt={img.alt} className="h-20 w-20 shrink-0 rounded-lg object-cover"/>
            <div className="min-w-0 flex-1"><label className="text-xs font-semibold text-gray-600">Alt text</label><input value={imageAltEdits[img.id]??img.alt} onChange={e=>setImageAltEdits(old=>({...old,[img.id]:e.target.value}))} className="mt-1 w-full rounded-lg border border-gray-300 px-2 py-2 text-sm text-gray-900"/><div className="mt-2 flex flex-wrap gap-2"><button onClick={()=>void saveImageAlt(product,img.id)} className="rounded-lg border px-3 py-1.5 text-xs font-medium">Save alt text</button><button onClick={()=>void removeProductImage(product,img.id)} disabled={imageSavingId===product.id} className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-700 disabled:opacity-50">Remove image</button></div></div>
          </div>)}
          <div className="border-t border-[#d8c9aa] pt-3"><h4 className="font-semibold text-[#29251f]">Upload image from your device</h4><p className="mt-1 text-xs text-gray-500">JPG, PNG, WEBP or GIF · maximum 8 MB. This uploads the file and attaches it to Shopify.</p>
            <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={async e=>{const file=e.target.files?.[0];if(!file)return;if(file.size>8*1024*1024){setSaveError("Image must be 8 MB or smaller.");return;}const base64=await new Promise<string>((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(String(reader.result).split(",")[1]??"");reader.onerror=()=>reject(new Error("Could not read image file."));reader.readAsDataURL(file);});setImageFileData(old=>({...old,[product.id]:{filename:file.name,mimeType:file.type,base64}}));}} className="mt-2 block w-full text-sm text-gray-700"/>
            <label className="mt-2 block text-xs font-semibold text-gray-600">Image alt text</label><input value={imageAlts[product.id]??product.title} onChange={e=>setImageAlts(old=>({...old,[product.id]:e.target.value}))} className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900"/>
            <button onClick={()=>void uploadProductImage(product)} disabled={imageSavingId===product.id||!(imageFileData[product.id]?.base64)} className="mt-3 rounded-lg bg-[#29251f] px-4 py-2 text-sm font-medium text-white disabled:opacity-50">{imageSavingId===product.id?"Uploading…":"Upload and attach image"}</button>
          </div>
          <div className="border-t border-[#d8c9aa] pt-3"><details><summary className="cursor-pointer text-sm text-[#79633b]">Add image by URL instead</summary><label className="mt-2 block text-xs font-semibold text-gray-600">Public HTTPS image URL</label><input type="url" value={imageUrls[product.id]??""} onChange={e=>setImageUrls(old=>({...old,[product.id]:e.target.value}))} placeholder="https://example.com/image.jpg" className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900"/><button onClick={()=>void addProductImage(product)} disabled={imageSavingId===product.id||!(imageUrls[product.id]??"").trim()} className="mt-2 rounded-lg border px-3 py-2 text-sm">Add from URL</button></details></div>
        </div>}<div className="mt-3"><button onClick={() => editingProductId === product.id ? setEditingProductId(null) : startEditing(product)} className="rounded-lg bg-[#29251f] px-4 py-2 text-sm font-medium text-white">{editingProductId === product.id ? "Cancel edit" : "Edit product"}</button></div>
        {editingProductId === product.id && <div className="mt-4 space-y-3 rounded-xl border border-[#d8c9aa] bg-[#fbf8f2] p-3">
          <div><label className="text-xs font-semibold text-[#71695d]">Product title</label><input value={editTitle} onChange={e=>setEditTitle(e.target.value)} maxLength={255} className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900"/></div>
          <div><label className="text-xs font-semibold text-[#71695d]">Status</label><select value={editStatus} onChange={e=>setEditStatus(e.target.value)} className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900"><option value="ACTIVE">Active (visible on sales channels if published)</option><option value="DRAFT">Draft</option><option value="ARCHIVED">Archived</option></select></div>
          {product.variants.map(v=><div key={v.id}><label className="text-xs font-semibold text-[#71695d]">Price · {v.title}</label><input type="number" min="0" max="10000000" step="0.01" value={editPrices[v.id] ?? v.price} onChange={e=>setEditPrices(old=>({...old,[v.id]:e.target.value}))} className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900"/></div>)}
          {saveError && <p role="alert" className="rounded-lg bg-red-50 p-2 text-sm text-red-800">{saveError}</p>}
          <button disabled={savingProductId === product.id || !editTitle.trim()} onClick={() => void saveProduct(product)} className="rounded-lg bg-[#29251f] px-4 py-2 text-sm font-medium text-white disabled:opacity-50">{savingProductId === product.id ? "Saving to Shopify…" : "Save changes to Shopify"}</button>
        </div>}</div>
      </article>)}</div>}
      <p className="mt-4 rounded-lg bg-amber-50 p-3 text-xs leading-5 text-amber-900">Edits to title, status and variant prices save directly to the live Shopify store. Verify every change before saving; changes may affect what customers see and pay.</p>{saveMessage && <p className="mt-3 rounded-lg bg-green-50 p-3 text-sm text-green-800">{saveMessage}</p>}
    </section>}
    {module !== "products" && <section className="grid gap-4 md:grid-cols-2">
      {(module === "integrations" ? liveLabels.map((item) => ({ title: item.title, key: item.key })) : data.items.map((item) => ({ title: item, key: item }))).map((item, index) => {
        const verified = item.key === "admin" ? status === "online" : item.key === "oauth" ? Boolean(shopify?.storedConnection) : item.key === "token" ? Boolean(shopify?.storedConnection) : item.key === "scopes" ? Boolean(shopify?.productRead) : false;
        const label = item.key === "admin" ? (status === "online" ? "Verified · API online" : status === "error" ? "Check failed" : "Checking") : item.key === "oauth" ? (shopify?.storedConnection ? "Connected in database" : "Not connected") : item.key === "token" ? (shopify?.storedConnection ? "Credential record found" : "Not verified") : item.key === "scopes" ? (shopify?.productRead ? "Product API read verified" : shopify?.connected ? "Connection verified; product read pending" : "Pending Shopify verification") : "Workspace capability";
        return <article key={item.key} className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900"><div className="flex items-start gap-3"><span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-sm font-semibold ${verified ? "bg-green-50 text-green-700" : "bg-[#f6f0e4] text-[#8a7042]"}`}>{verified ? "✓" : `0${index + 1}`}</span><div><h2 className="font-semibold text-gray-900 dark:text-white">{item.title}</h2><p className={`mt-1 text-sm leading-5 ${verified ? "text-green-700" : "text-gray-500"}`}>{label}</p></div></div></article>;
      })}
    </section>}
    {module === "integrations" && shopify?.shopDomain && <p className="rounded-xl border border-gray-200 bg-white p-4 text-sm leading-6 text-gray-700">Store: <strong>{shopify.storeName ?? shopify.shopDomain}</strong>{shopify.scopes?.length ? ` · Granted scopes: ${shopify.scopes.join(", ")}` : ""}</p>}
    {module !== "products" && <p className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">{shopify?.productRead ? "Shopify product read access is verified. Product image management and collection creation can change the live store. Content publishing and direct theme editing are not available in this workspace yet." : "Shopify product access is not fully verified. No sample records are presented as live store data; confirm the connection before making live changes."}</p>}
  </main>;
}
