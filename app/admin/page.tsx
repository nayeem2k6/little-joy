"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { api, messageOf, taka } from "@/lib/api";

interface Dashboard {
  counts: { orders: number; products: number; customers: number; categories: number };
  revenue: number;
  recentOrders?: { orderNumber: string; status: string; total: number; createdAt: string }[];
}
export default function AdminPage() {
  const [data, setData] = useState<Dashboard | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    api<Dashboard>("/admin/dashboard")
      .then(result => { if (active) setData(result); })
      .catch(reason => { if (active) setError(messageOf(reason)); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [retry]);

  const stats = data ? [
    ["Products", data.counts.products],
    ["Categories", data.counts.categories],
    ["Orders", data.counts.orders],
    ["Customers", data.counts.customers],
    ["Delivered revenue", taka(data.revenue)]
  ] as const : [];

  return <div className="page-pad">
    <p className="eyebrow">LittleJoy team</p><h1 className="section-title">Admin dashboard</h1>
    {error && <div role="alert" className="mt-5 rounded-xl bg-red-50 p-4 text-sm text-red-700">
      <p>{error}</p><button className="mt-3 font-bold underline" onClick={() => setRetry(value => value + 1)}>Try again</button>
    </div>}
    {loading
      ? <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-5" role="status" aria-label="Loading dashboard">
        {Array.from({ length: 5 }, (_, index) => <div key={index} className="card h-24 animate-pulse bg-cream" />)}
      </div>
      : data && <>
        <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {stats.map(([name, value]) => <div key={name} className="card p-5"><p className="text-sm text-gray-500">{name}</p><p className="mt-2 font-display text-3xl font-semibold text-forest">{value}</p></div>)}
        </div>
        <section className="mt-9"><h2 className="font-display text-2xl">Recent orders</h2>
          {data.recentOrders?.length ? <div className="mt-4 overflow-x-auto rounded-2xl border">
            <table className="w-full min-w-[500px] text-left text-sm"><thead className="bg-cream"><tr><th className="p-4">Order</th><th className="p-4">Status</th><th className="p-4">Total</th><th className="p-4">Placed</th></tr></thead>
              <tbody>{data.recentOrders.map(order => <tr key={order.orderNumber} className="border-t"><td className="p-4 font-semibold">{order.orderNumber}</td><td className="p-4 capitalize">{order.status}</td><td className="p-4">{taka(order.total)}</td><td className="p-4">{new Date(order.createdAt).toLocaleDateString()}</td></tr>)}</tbody>
            </table>
          </div> : <p className="mt-4 rounded-2xl bg-cream p-6 text-gray-600">No orders have been placed yet.</p>}
        </section>
      </>}
    <div className="mt-9 flex flex-wrap gap-2 xl:hidden" aria-label="Quick admin links">
      <Link className="btn btn-light border" href="/admin/products">Manage products</Link>
      <Link className="btn btn-light border" href="/admin/orders">Manage orders</Link>
    </div>
  </div>;
}
