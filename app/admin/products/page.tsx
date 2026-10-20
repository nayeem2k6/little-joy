"use client";

import { useEffect, useState } from "react";
import { api, messageOf, taka } from "@/lib/api";
import type { ApiList, Category, Product } from "@/lib/types";

function unwrap<T>(res: ApiList<T> | T[]): T[] { return Array.isArray(res) ? res : res.data || res.products || res.categories || res.items || []; }
export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  async function load() {
    try { const [p, c] = await Promise.all([api<ApiList<Product> | Product[]>("/admin/products?limit=100"), api<ApiList<Category> | Category[]>("/admin/categories")]); setProducts(unwrap(p)); setCategories(unwrap(c)); }
    catch (err) { setError(messageOf(err)); }
  }
  useEffect(() => { void load(); }, []);
  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(""); setBusy(true);
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const images = String(form.get("images") || "").split(",").map(value => value.trim()).filter(Boolean);
    try {
      const body = JSON.stringify({ name: form.get("name"), slug: form.get("slug"), description: form.get("description"), category: form.get("category"), price: Number(form.get("price")), compareAtPrice: form.get("compareAtPrice") ? Number(form.get("compareAtPrice")) : undefined, images, stockQuantity: Number(form.get("stockQuantity")), ageRecommendation: form.get("ageRecommendation"), safetyInformation: form.get("safetyInformation") });
      if (editing?._id) await api(`/admin/products/${editing._id}`, { method: "PATCH", body });
      else await api("/admin/products", { method: "POST", body });
      formElement.reset(); setEditing(null); await load();
    } catch (err) { setError(messageOf(err)); }
    finally { setBusy(false); }
  }
  async function remove(id: string) { if (!window.confirm("Remove this product from the store?")) return; try { await api(`/admin/products/${id}`, { method: "DELETE" }); await load(); } catch (err) { setError(messageOf(err)); } }
  return <div className="container page-pad"><p className="eyebrow">Store management</p><h1 className="section-title">Products</h1>
    {error && <p role="alert" className="my-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
    <form key={editing?._id || "new-product"} onSubmit={save} className="card mt-6 grid gap-4 p-5 sm:grid-cols-2">
      <h2 className="font-display text-xl sm:col-span-2">{editing ? `Edit ${editing.name}` : "Add a product"}</h2>
      <label className="field-label">Name<input required name="name" defaultValue={editing?.name} className="field" /></label>
      <label className="field-label">Slug<input required name="slug" pattern="[a-z0-9]+(?:-[a-z0-9]+)*" defaultValue={editing?.slug} className="field" placeholder="wooden-stacking-rings" /></label>
      <label className="field-label">Category<select required name="category" defaultValue={typeof editing?.category === "object" ? editing.category._id || "" : editing?.category || ""} className="field"><option value="">Choose category</option>{categories.map(c => <option key={c._id || c.slug} value={c._id || c.slug}>{c.name}</option>)}</select></label>
      <label className="field-label">Age recommendation<input name="ageRecommendation" defaultValue={editing?.ageRecommendation} className="field" placeholder="Ages 3+" /></label>
      <label className="field-label">Price (BDT)<input required min="0" step="0.01" type="number" name="price" defaultValue={editing?.price} className="field" /></label>
      <label className="field-label">Compare-at price<input min="0" step="0.01" type="number" name="compareAtPrice" defaultValue={editing?.compareAtPrice} className="field" /></label>
      <label className="field-label">Stock quantity<input required min="0" type="number" name="stockQuantity" defaultValue={editing?.stockQuantity ?? editing?.stock ?? 0} className="field" /></label>
      <label className="field-label sm:col-span-2">Image URLs (comma-separated)<input name="images" defaultValue={editing?.images?.join(", ") || editing?.imageUrl || ""} className="field" placeholder="https://..." /></label>
      <label className="field-label sm:col-span-2">Description<textarea required minLength={10} name="description" defaultValue={editing?.description} rows={3} className="field" /></label>
      <label className="field-label sm:col-span-2">Safety information<textarea name="safetyInformation" defaultValue={editing?.safetyInformation} rows={2} className="field" /></label>
      <button disabled={busy} className="btn">{busy ? "Saving…" : editing ? "Save changes" : "Add product"}</button>
      {editing && <button type="button" className="btn btn-light border" onClick={() => setEditing(null)}>Cancel edit</button>}
    </form>
    <h2 className="mt-9 font-display text-2xl">Current products</h2>
    {products.length ? <div className="mt-4 grid gap-3">{products.map(p => <div key={p._id || p.slug} className="card flex flex-wrap items-center justify-between gap-3 p-4"><div><strong>{p.name}</strong><p className="text-sm text-gray-500">{p.slug} · {p.stockQuantity ?? p.stock ?? 0} in stock</p></div><div className="flex items-center gap-4"><strong>{taka(p.price)}</strong><button onClick={() => { setEditing(p); window.scrollTo({ top: 0, behavior: "smooth" }); }} className="text-sm font-bold text-forest underline">Edit</button><button onClick={() => remove(p._id || p.id || "")} className="text-sm font-bold text-red-600 underline">Delete</button></div></div>)}</div> : <p className="mt-4 text-gray-600">No products found.</p>}
  </div>;
}
