"use client";

import { useEffect, useState } from "react";
import { api, messageOf, taka } from "@/lib/api";

interface Order { _id: string; orderNumber: string; status: string; total: number; createdAt: string; user?: { name?: string; email?: string }; shippingAddress?: { fullName?: string; phone?: string } }
export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [error, setError] = useState("");
  async function load() { try { const response = await api<{ orders?: Order[]; data?: Order[]; items?: Order[] }>("/admin/orders?limit=100"); setOrders(response.orders || response.items || response.data || []); } catch (err) { setError(messageOf(err)); } }
  useEffect(() => { void load(); }, []);
  async function update(id: string, status: string) { setError(""); try { await api(`/admin/orders/${id}/status`, { method: "PATCH", body: JSON.stringify({ status }) }); await load(); } catch (err) { setError(messageOf(err)); } }
  return <div className="container page-pad"><p className="eyebrow">Store management</p><h1 className="section-title">Orders</h1>{error && <p role="alert" className="my-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
    {orders.length ? <div className="mt-5 grid gap-3">{orders.map(o => <article key={o._id} className="card grid gap-3 p-4 sm:grid-cols-[1.3fr_1fr_.7fr_1fr] sm:items-center"><div><strong>{o.orderNumber}</strong><p className="text-sm text-gray-500">{o.shippingAddress?.fullName || o.user?.name || "Customer"} · {o.shippingAddress?.phone || o.user?.email || ""}</p></div><span className="text-sm">{new Date(o.createdAt).toLocaleDateString()}</span><strong className="text-forest">{taka(o.total)}</strong><label className="field-label"><span className="sr-only">Update order status</span><select aria-label={`Status for ${o.orderNumber}`} className="field" value={o.status} onChange={e => update(o._id, e.target.value)}><option value="pending">Pending</option><option value="confirmed">Confirmed</option><option value="processing">Processing</option><option value="shipped">Shipped</option><option value="delivered">Delivered</option><option value="cancelled">Cancelled</option></select></label></article>)}</div> : <p className="mt-5 rounded-2xl bg-cream p-6">No orders found.</p>}
  </div>;
}
