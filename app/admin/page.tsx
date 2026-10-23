"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, Boxes, ClipboardList, Package, Users, WalletCards } from "lucide-react";
import { api, messageOf, taka } from "@/lib/api";
import { LoadingSpinner } from "@/components/loading-spinner";

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
    { label: "Products", value: data.counts.products, icon: Package, href: "/admin/products" },
    { label: "Categories", value: data.counts.categories, icon: Boxes, href: "/admin/categories" },
    { label: "Orders", value: data.counts.orders, icon: ClipboardList, href: "/admin/orders" },
    { label: "Customers", value: data.counts.customers, icon: Users, href: "/admin/customers" }
  ] as const : [];

  return <div className="page-pad">
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <p className="eyebrow">LittleJoy team · Store overview</p>
        <h1 className="section-title">Good to see you.</h1>
        <p className="mt-2 text-sm text-gray-600">Here’s how your store is doing today.</p>
      </div>
      <Link href="/admin/products" className="btn"><Package size={17} /> Manage products</Link>
    </div>
    {error && <div role="alert" className="mt-5 rounded-xl bg-red-50 p-4 text-sm text-red-700">
      <p>{error}</p><button className="mt-3 font-bold underline" onClick={() => setRetry(value => value + 1)}>Try again</button>
    </div>}
    {loading
      ? <LoadingSpinner label="Loading your store dashboard..." className="mt-6" />
      : data && <>
        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-5">
          {stats.map(({ label, value, icon: Icon, href }) => <Link key={label} href={href} className="card group flex min-h-36 flex-col justify-between p-4 transition hover:-translate-y-1 hover:border-emerald-900/15 hover:shadow-soft sm:p-5">
            <div className="flex items-center justify-between">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-mint text-forest"><Icon size={19} /></span>
              <ArrowRight size={17} className="text-gray-400 transition group-hover:translate-x-1 group-hover:text-forest" />
            </div>
            <div><p className="text-sm font-medium text-gray-500">{label}</p><p className="mt-1 font-display text-3xl font-semibold text-forest">{value}</p></div>
          </Link>)}
          <div className="col-span-2 flex min-h-36 flex-col justify-between rounded-2xl bg-forest p-5 text-white shadow-soft sm:col-span-2 xl:col-span-1">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-white/10 text-lime"><WalletCards size={19} /></span>
            <div><p className="text-sm font-medium text-white/70">Delivered revenue</p><p className="mt-1 whitespace-nowrap font-display text-2xl font-semibold text-white sm:text-3xl xl:text-lg">{taka(data.revenue)}</p></div>
          </div>
        </div>
        <section className="mt-10">
          <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
            <div><p className="eyebrow">The latest</p><h2 className="mt-1 font-display text-2xl font-semibold text-forest">Recent orders</h2></div>
            <Link href="/admin/orders" className="inline-flex items-center gap-2 text-sm font-bold text-forest hover:underline">View all orders <ArrowRight size={16} /></Link>
          </div>
          {data.recentOrders?.length ? <div className="overflow-hidden rounded-2xl border border-emerald-950/10 bg-white shadow-[0_8px_24px_rgba(23,77,58,.04)]">
            <div className="hidden overflow-x-auto sm:block">
              <table className="w-full min-w-[520px] text-left text-sm">
                <thead className="bg-[#f5f9f5] text-xs uppercase tracking-wide text-gray-500"><tr><th className="px-5 py-4 font-bold">Order</th><th className="px-5 py-4 font-bold">Status</th><th className="px-5 py-4 font-bold">Total</th><th className="px-5 py-4 font-bold">Placed</th></tr></thead>
                <tbody>{data.recentOrders.map(order => <tr key={order.orderNumber} className="border-t border-emerald-950/5 transition-colors hover:bg-cream/60">
                  <td className="px-5 py-4 font-bold text-forest">{order.orderNumber}</td>
                  <td className="px-5 py-4"><span className="inline-flex rounded-full bg-mint px-3 py-1 text-xs font-bold capitalize text-forest">{order.status}</span></td>
                  <td className="px-5 py-4 font-semibold">{taka(order.total)}</td>
                  <td className="px-5 py-4 text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</td>
                </tr>)}</tbody>
              </table>
            </div>
            <div className="divide-y divide-emerald-950/5 sm:hidden">
              {data.recentOrders.map(order => <article key={order.orderNumber} className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div><p className="font-bold text-forest">{order.orderNumber}</p><p className="mt-1 text-xs text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</p></div>
                  <span className="inline-flex rounded-full bg-mint px-3 py-1 text-xs font-bold capitalize text-forest">{order.status}</span>
                </div>
                <p className="mt-3 font-semibold">{taka(order.total)}</p>
              </article>)}
            </div>
          </div> : <p className="mt-4 rounded-2xl bg-cream p-6 text-gray-600">No orders have been placed yet.</p>}
        </section>
      </>}
  </div>;
}
