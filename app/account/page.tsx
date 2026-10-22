"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { ApiError, api, messageOf, taka } from "@/lib/api";

interface Order {
  _id: string;
  orderNumber: string;
  status: string;
  total: number;
  createdAt: string;
  paymentMethod?: string;
  shippingAddress?: { fullName?: string; phone?: string; addressLine1?: string; addressLine2?: string; city?: string; postalCode?: string; country?: string };
  items?: { name?: string; quantity: number; unitPrice?: number }[];
}
interface User { id?: string; name: string; email: string; phone?: string; role?: string }

export default function AccountPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [unauthenticated, setUnauthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [orderLoading, setOrderLoading] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    let active = true;
    Promise.all([
      api<{ user: User }>("/auth/me"),
      api<{ items?: Order[] }>("/orders/my-orders")
    ])
      .then(([account, result]) => {
        if (!active) return;
        setUser(account.user);
        setName(account.user.name);
        setPhone(account.user.phone || "");
        setOrders(result.items || []);
      })
      .catch(reason => {
        if (!active) return;
        if (reason instanceof ApiError && reason.status === 401) {
          setUnauthenticated(true);
          router.replace("/login?returnTo=%2Faccount");
        } else {
          setError(messageOf(reason));
        }
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [router]);

  async function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");
    setSaving(true);
    try {
      const response = await api<{ user: User }>("/auth/profile", {
        method: "PATCH",
        body: JSON.stringify({ name, phone })
      });
      setUser(response.user);
      setName(response.user.name);
      setPhone(response.user.phone || "");
      setSuccess("Your profile has been updated.");
    } catch (reason) {
      setError(messageOf(reason));
    } finally {
      setSaving(false);
    }
  }

  async function logout() {
    setError("");
    setLoggingOut(true);
    try {
      await api("/auth/logout", { method: "POST" });
      router.replace("/");
    } catch (reason) {
      setError(messageOf(reason));
    } finally {
      setLoggingOut(false);
    }
  }

  async function showOrder(orderId: string) {
    if (selectedOrder?._id === orderId) {
      setSelectedOrder(null);
      return;
    }
    setError("");
    setOrderLoading(orderId);
    try {
      const response = await api<{ order: Order }>(`/orders/${encodeURIComponent(orderId)}`);
      setSelectedOrder(response.order);
    } catch (reason) {
      setError(messageOf(reason));
    } finally {
      setOrderLoading("");
    }
  }

  return <div className="container page-pad">
    <p className="eyebrow">Your LittleJoy corner</p>
    <h1 className="section-title">My account</h1>
    {error && <p role="alert" className="card mt-5 p-4 text-red-700">{error}</p>}
    {success && <p role="status" className="mt-5 rounded-xl bg-mint p-4 text-forest">{success}</p>}
    {loading
      ? <div className="mt-6 h-40 animate-pulse rounded-2xl bg-cream" role="status" aria-label="Loading account" />
      : unauthenticated ? <div className="card mt-5 p-5">Taking you to sign in…</div>
        : user && <>
          <section className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-cream p-5">
            <div><strong>{user.name || "Welcome back"}</strong><p className="text-sm text-gray-600">{user.email}</p>{user.phone && <p className="text-sm text-gray-600">{user.phone}</p>}</div>
            <div className="flex flex-wrap gap-4">
              <button type="button" onClick={logout} disabled={loggingOut} className="text-sm font-bold text-forest underline disabled:opacity-60">{loggingOut ? "Signing out…" : "Sign out"}</button>
              {user.role === "admin" && <Link href="/admin" className="text-sm font-bold text-forest underline">Admin dashboard</Link>}
            </div>
          </section>

          <form onSubmit={saveProfile} className="card mt-5 grid gap-4 p-5 sm:grid-cols-2">
            <h2 className="font-display text-xl sm:col-span-2">Profile details</h2>
            <label className="field-label">Full name<input required minLength={2} maxLength={100} autoComplete="name" className="field" value={name} onChange={event => setName(event.target.value)} /></label>
            <label className="field-label">Email<input type="email" className="field bg-gray-50" value={user.email} readOnly /></label>
            <label className="field-label">Phone number<input type="tel" maxLength={30} autoComplete="tel" className="field" value={phone} onChange={event => setPhone(event.target.value)} /></label>
            <button className="btn sm:col-span-2 sm:justify-self-start" disabled={saving}>{saving ? "Saving…" : "Save profile"}</button>
          </form>

          <section className="mt-9">
            <h2 className="font-display text-2xl">Your orders</h2>
            {!orders.length
              ? <div className="card mt-4 p-7 text-center"><p>No orders just yet.</p><Link href="/shop" className="btn mt-4">Find a little favorite</Link></div>
              : <div className="mt-4 grid gap-3">{orders.map(order => <article key={order._id} className="card p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div><strong>{order.orderNumber}</strong><p className="mt-1 text-sm text-gray-500">{new Date(order.createdAt).toLocaleDateString()} · {order.items?.length || 0} item(s)</p></div>
                  <span className="pill capitalize">{order.status}</span>
                  <strong className="text-forest">{taka(order.total)}</strong>
                  <button type="button" onClick={() => showOrder(order._id)} disabled={orderLoading === order._id} className="text-sm font-bold text-forest underline disabled:opacity-60">
                    {orderLoading === order._id ? "Loading…" : selectedOrder?._id === order._id ? "Hide details" : "View details"}
                  </button>
                </div>
                {selectedOrder?._id === order._id && <div className="mt-5 grid gap-4 border-t pt-4 sm:grid-cols-2">
                  <div><h3 className="font-semibold">Items</h3><ul className="mt-2 grid gap-2 text-sm text-gray-600">{selectedOrder.items?.map((item, index) => <li key={`${item.name}-${index}`} className="flex justify-between gap-3"><span>{item.name} × {item.quantity}</span><span>{taka((item.unitPrice || 0) * item.quantity)}</span></li>)}</ul></div>
                  <div><h3 className="font-semibold">Delivery & payment</h3><p className="mt-2 text-sm leading-6 text-gray-600">{selectedOrder.shippingAddress?.fullName}<br />{selectedOrder.shippingAddress?.addressLine1}{selectedOrder.shippingAddress?.addressLine2 ? `, ${selectedOrder.shippingAddress.addressLine2}` : ""}<br />{selectedOrder.shippingAddress?.city} {selectedOrder.shippingAddress?.postalCode}<br />{selectedOrder.shippingAddress?.phone}</p><p className="mt-2 text-sm text-gray-600">Payment: {selectedOrder.paymentMethod || "COD"}</p><p className="mt-1 text-sm text-gray-600">Tracking status: <span className="font-semibold capitalize text-forest">{selectedOrder.status}</span></p></div>
                </div>}
              </article>)}</div>}
          </section>
        </>}
  </div>;
}
