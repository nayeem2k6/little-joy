"use client";

import { useCallback, useEffect, useState } from "react";
import { api, messageOf, taka } from "@/lib/api";
import type { ApiList, Category, Product } from "@/lib/types";
import { LoadingSpinner } from "@/components/loading-spinner";
import { useToast } from "@/components/toast-provider";

function unwrap<T>(res: ApiList<T> | T[]): T[] { return Array.isArray(res) ? res : res.data || res.products || res.categories || res.items || []; }
export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [error, setError] = useState("");
  const { show } = useToast();
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [stock, setStock] = useState("all");
  const [featured, setFeatured] = useState("all");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [editing, setEditing] = useState<Product | null>(null);
  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    const params = new URLSearchParams({ page: String(page), limit: "20", stock, featured, status });
    if (search.trim()) params.set("search", search.trim());
    if (category) params.set("category", category);
    try {
      const response = await api<ApiList<Product> | Product[]>(`/admin/products?${params}`);
      setProducts(unwrap(response));
      setPages(!Array.isArray(response) && response.pagination?.pages ? response.pagination.pages : 1);
    } catch (err) {
      setError(messageOf(err));
    } finally {
      setLoading(false);
    }
  }, [category, featured, page, search, status, stock]);
  useEffect(() => {
    const timer = setTimeout(() => { void load(); }, 250);
    return () => clearTimeout(timer);
  }, [load]);
  useEffect(() => {
    api<ApiList<Category> | Category[]>("/admin/categories")
      .then(response => setCategories(unwrap(response)))
      .catch(err => setError(messageOf(err)))
      .finally(() => setCategoriesLoading(false));
  }, []);
  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(""); setBusy(true);
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const images = String(form.get("images") || "").split(",").map(value => value.trim()).filter(Boolean);
    try {
      const body = JSON.stringify({ name: form.get("name"), slug: form.get("slug"), description: form.get("description"), category: form.get("category"), price: Number(form.get("price")), compareAtPrice: form.get("compareAtPrice") ? Number(form.get("compareAtPrice")) : undefined, images, stockQuantity: Number(form.get("stockQuantity")), featured: form.get("featured") === "on", active: form.get("active") === "on", ageRecommendation: form.get("ageRecommendation"), safetyInformation: form.get("safetyInformation") });
      if (editing?._id) await api(`/admin/products/${editing._id}`, { method: "PATCH", body });
      else await api("/admin/products", { method: "POST", body });
      formElement.reset(); setEditing(null); show(editing ? "Product updated successfully." : "Product added successfully."); await load();
    } catch (err) { setError(messageOf(err)); }
    finally { setBusy(false); }
  }
  async function remove(id: string, name: string) { if (!window.confirm(`Archive ${name} from the storefront? Existing orders will be preserved.`)) return; setError(""); try { await api(`/admin/products/${id}`, { method: "DELETE" }); show(`${name} archived successfully.`); await load(); } catch (err) { setError(messageOf(err)); } }
  return <div className="container page-pad"><p className="eyebrow">Store management</p><h1 className="section-title">Products</h1>
    {error && <p role="alert" className="my-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
    <form key={editing?._id || "new-product"} onSubmit={save} className="card mt-6 grid gap-4 p-5 sm:grid-cols-2">
      <h2 className="font-display text-xl sm:col-span-2">{editing ? `Edit ${editing.name}` : "Add a product"}</h2>
      <label className="field-label">Name<input required name="name" defaultValue={editing?.name} className="field" /></label>
      <label className="field-label">Slug<input required name="slug" pattern="[a-z0-9]+(?:-[a-z0-9]+)*" defaultValue={editing?.slug} className="field" placeholder="wooden-stacking-rings" /></label>
      <label className="field-label">Category{categoriesLoading ? <LoadingSpinner label="Loading categories..." compact /> : <select required name="category" defaultValue={typeof editing?.category === "object" ? editing.category._id || "" : editing?.category || ""} className="field"><option value="">Choose category</option>{categories.map(c => <option key={c._id || c.slug} value={c._id || c.slug}>{c.name}</option>)}</select>}</label>
      <label className="field-label">Age recommendation<input name="ageRecommendation" defaultValue={editing?.ageRecommendation} className="field" placeholder="Ages 3+" /></label>
      <label className="field-label">Price (BDT)<input required min="0" step="0.01" type="number" name="price" defaultValue={editing?.price} className="field" /></label>
      <label className="field-label">Compare-at price<input min="0" step="0.01" type="number" name="compareAtPrice" defaultValue={editing?.compareAtPrice} className="field" /></label>
      <label className="field-label">Stock quantity<input required min="0" type="number" name="stockQuantity" defaultValue={editing?.stockQuantity ?? editing?.stock ?? 0} className="field" /></label>
      <label className="flex min-h-12 items-center gap-3 text-sm font-semibold"><input type="checkbox" name="featured" defaultChecked={editing?.featured ?? false} className="h-5 w-5 accent-forest" />Feature this product on the homepage</label>
      <label className="flex min-h-12 items-center gap-3 text-sm font-semibold"><input type="checkbox" name="active" defaultChecked={editing?.active !== false} className="h-5 w-5 accent-forest" />Available in the storefront</label>
      <label className="field-label sm:col-span-2">Image URLs (comma-separated)<input name="images" defaultValue={editing?.images?.join(", ") || editing?.imageUrl || ""} className="field" placeholder="https://..." /></label>
      <label className="field-label sm:col-span-2">Description<textarea required minLength={10} name="description" defaultValue={editing?.description} rows={3} className="field" /></label>
      <label className="field-label sm:col-span-2">Safety information<textarea name="safetyInformation" defaultValue={editing?.safetyInformation} rows={2} className="field" /></label>
      <button disabled={busy} className="btn">{busy ? "Saving…" : editing ? "Save changes" : "Add product"}</button>
      {editing && <button type="button" className="btn btn-light border" onClick={() => setEditing(null)}>Cancel edit</button>}
    </form>
    <h2 className="mt-9 font-display text-2xl">Current products</h2>
    <div className="mt-4 grid gap-3 rounded-2xl bg-cream p-4 sm:grid-cols-2 lg:grid-cols-3">
      <label className="field-label">Search<input className="field" type="search" value={search} onChange={event => { setSearch(event.target.value); setPage(1); }} placeholder="Name or partial name" /></label>
      <label className="field-label">Category<select className="field" value={category} onChange={event => { setCategory(event.target.value); setPage(1); }}><option value="">All categories</option>{categories.map(item => <option key={item._id || item.slug} value={item._id}>{item.name}</option>)}</select></label>
      <label className="field-label">Availability<select className="field" value={status} onChange={event => { setStatus(event.target.value); setPage(1); }}><option value="all">All products</option><option value="active">Storefront active</option><option value="archived">Archived</option></select></label>
      <label className="field-label">Stock<select className="field" value={stock} onChange={event => { setStock(event.target.value); setPage(1); }}><option value="all">Any stock</option><option value="in-stock">In stock</option><option value="out-of-stock">Out of stock</option></select></label>
      <label className="field-label">Featured<select className="field" value={featured} onChange={event => { setFeatured(event.target.value); setPage(1); }}><option value="all">All</option><option value="featured">Featured</option><option value="not-featured">Not featured</option></select></label>
    </div>
    {loading ? <LoadingSpinner label="Loading products..." className="mt-3 rounded-2xl bg-cream" />
      : products.length ? <div className="mt-4 grid gap-3">{products.map(product => <div key={product._id || product.slug} className="card flex flex-wrap items-center justify-between gap-3 p-4"><div><strong>{product.name}</strong><p className="text-sm text-gray-500">{product.slug} · {product.stockQuantity ?? product.stock ?? 0} in stock · {product.featured ? "Featured" : "Not featured"} · {product.active === false ? "Archived" : "Active"}</p></div><div className="flex items-center gap-4"><strong>{taka(product.price)}</strong><button onClick={() => { setEditing(product); window.scrollTo({ top: 0, behavior: "smooth" }); }} className="text-sm font-bold text-forest underline">Edit</button><button onClick={() => remove(product._id || product.id || "", product.name)} className="text-sm font-bold text-red-600 underline">Archive</button></div></div>)}</div>
        : !error && <p className="mt-4 text-gray-600">No products match these filters.</p>}
    {!loading && pages > 1 && <nav aria-label="Admin product pages" className="mt-6 flex items-center justify-center gap-4"><button className="btn btn-light border" disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</button><span className="text-sm">Page {page} of {pages}</span><button className="btn btn-light border" disabled={page >= pages} onClick={() => setPage(page + 1)}>Next</button></nav>}
  </div>;
}
