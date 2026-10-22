"use client";

import { useEffect, useState } from "react";
import { api, messageOf, taka } from "@/lib/api";

interface Order {
  _id: string;
  orderNumber: string;
  status: string;
  total: number;
  createdAt: string;
  paymentMethod?: string;
  items?: { name: string; quantity: number; unitPrice: number }[];
  user?: { name?: string; email?: string; phone?: string };
  shippingAddress?: { fullName?: string; phone?: string; addressLine1?: string; addressLine2?: string; city?: string; postalCode?: string; country?: string };
}
export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState("");
  async function load() {
    setError("");
    try {
      const response = await api<{ orders?: Order[]; data?: Order[]; items?: Order[] }>("/admin/orders?limit=100");
      setOrders(response.orders || response.items || response.data || []);
    } catch (err) {
      setError(messageOf(err));
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => { void load(); }, []);
  async function update(id: string, orderNumber: string, status: string) {
    setError("");
    setSuccess("");
    if (status === "cancelled" && !window.confirm(`Cancel order ${orderNumber}? Stock will be restored and the coupon use reversed.`)) return;
    try {
      await api(`/admin/orders/${id}/status`, { method: "PATCH", body: JSON.stringify({ status }) });
      setSuccess(`Order ${orderNumber} updated to ${status}.`);
      await load();
    } catch (err) {
      setError(messageOf(err));
    }
  }
  return <div className="container page-pad"><p className="eyebrow">Store management</p><h1 className="section-title">Orders</h1>{error && <p role="alert" className="my-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}{success && <p role="status" className="my-4 rounded-lg bg-mint p-3 text-sm text-forest">{success}</p>}
    {loading ? <div className="mt-5 h-36 animate-pulse rounded-2xl bg-cream" role="status" aria-label="Loading orders" />
      : orders.length ? <div className="mt-5 grid gap-3">{orders.map(order => <article key={order._id} className="card p-4">
        <div className="grid gap-3 sm:grid-cols-[1.3fr_1fr_.7fr_1fr] sm:items-center">
          <div><strong>{order.orderNumber}</strong><p className="text-sm text-gray-500">{order.shippingAddress?.fullName || order.user?.name || "Customer"} · {order.shippingAddress?.phone || order.user?.email || ""}</p></div>
          <span className="text-sm">{new Date(order.createdAt).toLocaleDateString()} · {order.paymentMethod || "COD"}</span>
          <strong className="text-forest">{taka(order.total)}</strong>
          <label className="field-label"><span className="sr-only">Update order status</span><select aria-label={`Update status for ${order.orderNumber}`} className="field" value={order.status} onChange={event => void update(order._id, order.orderNumber, event.target.value)}><option value="pending">Pending</option><option value="confirmed">Confirmed</option><option value="processing">Processing</option><option value="shipped">Shipped</option><option value="delivered">Delivered</option><option value="cancelled">Cancelled</option></select></label>
        </div>
        <button type="button" className="mt-3 text-sm font-bold text-forest underline" onClick={() => setExpandedOrder(current => current === order._id ? "" : order._id)} aria-expanded={expandedOrder === order._id}>{expandedOrder === order._id ? "Hide order details" : "View order details"}</button>
        {expandedOrder === order._id && <div className="mt-4 grid gap-4 border-t pt-4 sm:grid-cols-2">
          <div><h2 className="font-semibold">Items</h2><ul className="mt-2 grid gap-2 text-sm text-gray-600">{order.items?.map((item, index) => <li key={`${item.name}-${index}`} className="flex justify-between gap-3"><span>{item.name} × {item.quantity}</span><span>{taka(item.unitPrice * item.quantity)}</span></li>)}</ul></div>
          <div><h2 className="font-semibold">Customer & delivery</h2><p className="mt-2 text-sm leading-6 text-gray-600">{order.user?.name}<br />{order.user?.email}<br />{order.shippingAddress?.fullName}<br />{order.shippingAddress?.addressLine1}{order.shippingAddress?.addressLine2 ? `, ${order.shippingAddress.addressLine2}` : ""}<br />{order.shippingAddress?.city} {order.shippingAddress?.postalCode}<br />{order.shippingAddress?.country}</p></div>
        </div>}
      </article>)}</div> : !error && <p className="mt-5 rounded-2xl bg-cream p-6">No orders found.</p>}
  </div>;
}
