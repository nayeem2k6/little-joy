"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { api, messageOf, taka } from "@/lib/api";

interface Dashboard {
  totalOrders?: number;
  totalSales?: number;
  productCount?: number;
  totalProducts?: number;
  counts?: { orders?: number; products?: number; customers?: number; categories?: number };
  revenue?: number;
  recentOrders?: { orderNumber: string; status: string; total: number; createdAt: string }[];
}
export default function AdminPage() {
  const [data, setData] = useState<Dashboard | null>(null);
  const [error, setError] = useState("");
  useEffect(() => { api<Dashboard>("/admin/dashboard").then(setData).catch(err => setError(messageOf(err))); }, []);
  if (error) return <div className="container page-pad"><div role="alert" className="card mx-auto max-w-xl p-8 text-center"><h1 className="font-display text-2xl">Admin sign-in required</h1><p className="mt-2 text-gray-600">{error}</p><Link href="/login" className="btn mt-5">Sign in</Link></div></div>;
  const stats = [["Orders", data?.counts?.orders ?? data?.totalOrders ?? 0], ["Sales", taka(data?.revenue ?? data?.totalSales ?? 0)], ["Products", data?.counts?.products ?? data?.productCount ?? data?.totalProducts ?? 0]];
  return <div className="container page-pad"><div className="flex flex-wrap items-end justify-between gap-4"><div><p className="eyebrow">LittleJoy team</p><h1 className="section-title">Admin dashboard</h1></div><nav className="flex flex-wrap gap-2" aria-label="Admin pages"><Link className="btn btn-light border" href="/admin/products">Products</Link><Link className="btn btn-light border" href="/admin/categories">Categories</Link><Link className="btn btn-light border" href="/admin/orders">Orders</Link><Link className="btn btn-light border" href="/admin/customers">Customers</Link><Link className="btn btn-light border" href="/admin/coupons">Coupons</Link><Link className="btn btn-light border" href="/admin/reviews">Reviews</Link></nav></div>
    <div className="mt-7 grid gap-4 sm:grid-cols-3">{stats.map(([name, value]) => <div key={name} className="card p-5"><p className="text-sm text-gray-500">{name}</p><p className="mt-2 font-display text-3xl font-semibold text-forest">{value}</p></div>)}</div>
    <section className="mt-9"><h2 className="font-display text-2xl">Recent orders</h2>{data?.recentOrders?.length ? <div className="mt-4 overflow-x-auto rounded-2xl border"><table className="w-full min-w-[500px] text-left text-sm"><thead className="bg-cream"><tr><th className="p-4">Order</th><th className="p-4">Status</th><th className="p-4">Total</th><th className="p-4">Placed</th></tr></thead><tbody>{data.recentOrders.map(o => <tr key={o.orderNumber} className="border-t"><td className="p-4 font-semibold">{o.orderNumber}</td><td className="p-4 capitalize">{o.status}</td><td className="p-4">{taka(o.total)}</td><td className="p-4">{new Date(o.createdAt).toLocaleDateString()}</td></tr>)}</tbody></table></div> : <p className="mt-4 rounded-2xl bg-cream p-6 text-gray-600">Dashboard data will appear here when your shop has orders.</p>}</section>
  </div>;
}
