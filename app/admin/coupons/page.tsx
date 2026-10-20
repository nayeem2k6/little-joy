"use client";

import { useEffect, useState } from "react";
import { api, messageOf, taka } from "@/lib/api";
import type { ApiList } from "@/lib/types";

interface Coupon { _id: string; code: string; discountType: "percentage" | "fixed"; discountValue: number; active: boolean; usedCount: number; usageLimit?: number }
function unwrap(res: ApiList<Coupon> | { coupons?: Coupon[]; items?: Coupon[] }): Coupon[] {
  if ("coupons" in res && res.coupons) return res.coupons;
  return "items" in res ? res.items || [] : [];
}
export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function load() {
    try { setCoupons(unwrap(await api<ApiList<Coupon> | { coupons?: Coupon[] }>("/admin/coupons"))); }
    catch (err) { setError(messageOf(err)); }
  }
  useEffect(() => { void load(); }, []);
  async function create(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(""); setBusy(true);
    const form = event.currentTarget;
    const data = new FormData(form);
    const usageLimit = String(data.get("usageLimit") || "");
    try {
      await api("/admin/coupons", { method: "POST", body: JSON.stringify({
        code: data.get("code"),
        discountType: data.get("discountType"),
        discountValue: Number(data.get("discountValue")),
        usageLimit: usageLimit ? Number(usageLimit) : null
      }) });
      form.reset(); await load();
    } catch (err) { setError(messageOf(err)); }
    finally { setBusy(false); }
  }
  async function toggle(coupon: Coupon) {
    try { await api(`/admin/coupons/${coupon._id}`, { method: "PATCH", body: JSON.stringify({ active: !coupon.active }) }); await load(); }
    catch (err) { setError(messageOf(err)); }
  }
  return <div className="container page-pad"><p className="eyebrow">Store management</p><h1 className="section-title">Coupons</h1>{error && <p role="alert" className="my-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
    <form onSubmit={create} className="card mt-6 grid gap-4 p-5 sm:grid-cols-2"><h2 className="font-display text-xl sm:col-span-2">Create a coupon</h2>
      <label className="field-label">Code<input required minLength={3} maxLength={40} name="code" className="field uppercase" /></label>
      <label className="field-label">Discount type<select name="discountType" className="field"><option value="percentage">Percentage</option><option value="fixed">Fixed amount (BDT)</option></select></label>
      <label className="field-label">Discount value<input required type="number" min="0.01" step="0.01" name="discountValue" className="field" /></label>
      <label className="field-label">Total uses limit (optional)<input type="number" min="1" name="usageLimit" className="field" /></label>
      <button disabled={busy} className="btn sm:col-span-2">{busy ? "Saving…" : "Create coupon"}</button>
    </form>
    <div className="mt-7 grid gap-3">{coupons.map(coupon => <article key={coupon._id} className="card flex flex-wrap items-center justify-between gap-3 p-4"><div><strong>{coupon.code}</strong><p className="text-sm text-gray-500">{coupon.discountType === "percentage" ? `${coupon.discountValue}% off` : `${taka(coupon.discountValue)} off`} · {coupon.usedCount} used{coupon.usageLimit ? ` of ${coupon.usageLimit}` : ""}</p></div><div className="flex items-center gap-3"><span className="pill">{coupon.active ? "Active" : "Inactive"}</span><button onClick={() => toggle(coupon)} className={`text-sm font-bold underline ${coupon.active ? "text-red-600" : "text-forest"}`}>{coupon.active ? "Deactivate" : "Activate"}</button></div></article>)}</div>
  </div>;
}
