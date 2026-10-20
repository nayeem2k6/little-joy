"use client";

import { useEffect, useState } from "react";
import { api, messageOf } from "@/lib/api";
import type { ApiList, Category } from "@/lib/types";
function unwrap(res: ApiList<Category> | Category[]): Category[] { return Array.isArray(res) ? res : res.data || res.categories || res.items || []; }
export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState<Category | null>(null);
  async function load() { try { setCategories(unwrap(await api<ApiList<Category> | Category[]>("/admin/categories"))); } catch (err) { setError(messageOf(err)); } }
  useEffect(() => { void load(); }, []);
  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError("");
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const body = JSON.stringify({ name: form.get("name"), slug: form.get("slug"), description: form.get("description"), imageUrl: form.get("imageUrl") });
    try {
      if (editing?._id) await api(`/admin/categories/${editing._id}`, { method: "PATCH", body });
      else await api("/admin/categories", { method: "POST", body });
      formElement.reset(); setEditing(null); await load();
    }
    catch (err) { setError(messageOf(err)); }
  }
  async function remove(id: string) { if (!window.confirm("Remove this category?")) return; try { await api(`/admin/categories/${id}`, { method: "DELETE" }); await load(); } catch (err) { setError(messageOf(err)); } }
  return <div className="container page-pad"><p className="eyebrow">Store management</p><h1 className="section-title">Categories</h1>{error && <p role="alert" className="my-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
    <form key={editing?._id || "new-category"} onSubmit={save} className="card mt-6 grid gap-4 p-5 sm:grid-cols-2"><h2 className="font-display text-xl sm:col-span-2">{editing ? `Edit ${editing.name}` : "Add a category"}</h2><label className="field-label">Name<input required name="name" defaultValue={editing?.name} className="field" /></label><label className="field-label">Slug<input required name="slug" pattern="[a-z0-9]+(?:-[a-z0-9]+)*" defaultValue={editing?.slug} className="field" /></label><label className="field-label sm:col-span-2">Image URL<input type="url" name="imageUrl" defaultValue={editing?.imageUrl} className="field" /></label><label className="field-label sm:col-span-2">Description<textarea name="description" defaultValue={editing?.description} className="field" rows={3} /></label><button className="btn">{editing ? "Save changes" : "Add category"}</button>{editing && <button type="button" className="btn btn-light border" onClick={() => setEditing(null)}>Cancel edit</button>}</form>
    <div className="mt-7 grid gap-3">{categories.map(c => <div key={c._id || c.slug} className="card flex items-center justify-between gap-4 p-4"><div><strong>{c.name}</strong><p className="text-sm text-gray-500">{c.slug}</p></div><div className="flex gap-4"><button onClick={() => { setEditing(c); window.scrollTo({ top: 0, behavior: "smooth" }); }} className="text-sm font-bold text-forest underline">Edit</button><button onClick={() => remove(c._id || c.id || "")} className="text-sm font-bold text-red-600 underline">Delete</button></div></div>)}</div>
  </div>;
}
