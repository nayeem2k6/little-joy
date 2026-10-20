"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { api, messageOf, taka } from "@/lib/api";

interface Order { _id?: string; orderNumber: string; status: string; total: number; createdAt: string; items?: { name?: string; productName?: string; quantity: number }[] }
interface User { name?: string; email?: string; role?: string }
export default function AccountPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    Promise.all([api<{ user?: User } & User>("/auth/me"), api<{ orders?: Order[]; data?: Order[]; items?: Order[] } | Order[]>("/orders/my-orders")])
      .then(([u, o]) => { setUser(u.user || u); setOrders(Array.isArray(o) ? o : o.orders || o.items || o.data || []); })
      .catch(err => setError(messageOf(err)))
      .finally(() => setLoading(false));
  }, []);
  async function logout() { try { await api("/auth/logout", { method: "POST" }); window.location.href = "/"; } catch (err) { setError(messageOf(err)); } }
  return <div className="container page-pad"><p className="eyebrow">Your LittleJoy corner</p><h1 className="section-title">My account</h1>
    {error && <div role="alert" className="card mt-5 p-5"><p>{error}</p><Link className="mt-2 inline-block font-bold text-forest underline" href="/login">Sign in</Link></div>}
    {loading ? <div className="mt-6 h-40 animate-pulse rounded-2xl bg-cream" /> : user && <><div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-cream p-5"><div><strong>{user.name || "Welcome back"}</strong><p className="text-sm text-gray-600">{user.email}</p></div><div className="flex gap-3"><button onClick={logout} className="text-sm font-bold text-forest underline">Sign out</button>{user.role === "admin" && <Link href="/admin" className="text-sm font-bold text-forest underline">Admin</Link>}</div></div>
      <h2 className="mt-9 font-display text-2xl">Your orders</h2>
      {!orders.length ? <div className="card mt-4 p-7 text-center"><p>No orders just yet.</p><Link href="/shop" className="btn mt-4">Find a little favorite</Link></div> : <div className="mt-4 grid gap-3">{orders.map(order => <article key={order._id || order.orderNumber} className="card flex flex-wrap items-center justify-between gap-3 p-5"><div><strong>{order.orderNumber}</strong><p className="mt-1 text-sm text-gray-500">{new Date(order.createdAt).toLocaleDateString()} · {order.items?.length || 0} item(s)</p></div><span className="pill capitalize">{order.status}</span><strong className="text-forest">{taka(order.total)}</strong></article>)}</div>}
    </>}
  </div>;
}
