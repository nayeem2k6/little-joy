"use client";

import { useEffect, useState } from "react";
import { api, messageOf } from "@/lib/api";
import type { ApiList } from "@/lib/types";
import { LoadingSpinner } from "@/components/loading-spinner";
import { useToast } from "@/components/toast-provider";

interface Review { _id: string; rating: number; comment: string; status: "pending" | "approved" | "rejected"; product?: { name?: string }; user?: { name?: string }; createdAt: string }
export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [status, setStatus] = useState("pending");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const { show } = useToast();
  async function load(filter: string) {
    setLoading(true);
    setError("");
    try { const response = await api<ApiList<Review>>(`/admin/reviews?status=${filter}&limit=100`); setReviews(response.items || []); }
    catch (err) { setError(messageOf(err)); }
    finally { setLoading(false); }
  }
  useEffect(() => { void load(status); }, [status]);
  async function moderate(id: string, next: "approved" | "rejected") {
    try { await api(`/admin/reviews/${id}/status`, { method: "PATCH", body: JSON.stringify({ status: next }) }); show(`Review ${next} successfully.`); await load(status); }
    catch (err) { setError(messageOf(err)); }
  }
  return <div className="container page-pad"><p className="eyebrow">Store management</p><h1 className="section-title">Review moderation</h1>{error && <p role="alert" className="my-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
    <label className="field-label mt-5 max-w-xs">Review status<select className="field" value={status} onChange={event => setStatus(event.target.value)}><option value="pending">Pending</option><option value="approved">Approved</option><option value="rejected">Rejected</option></select></label>
    {loading ? <LoadingSpinner label="Loading reviews..." className="mt-4 rounded-2xl bg-cream" /> : <div className="mt-5 grid gap-3">{reviews.length ? reviews.map(review => <article key={review._id} className="card p-5"><div className="flex flex-wrap items-center justify-between gap-2"><strong>{review.product?.name || "Product"} · {review.rating}/5</strong><span className="pill capitalize">{review.status}</span></div><p className="mt-3 leading-7 text-gray-700">{review.comment}</p><p className="mt-2 text-sm text-gray-500">By {review.user?.name || "Customer"} · {new Date(review.createdAt).toLocaleDateString()} · verified purchase</p>{review.status === "pending" && <div className="mt-4 flex gap-3"><button className="btn" onClick={() => moderate(review._id, "approved")}>Approve</button><button className="btn btn-light border border-red-200 text-red-700" onClick={() => moderate(review._id, "rejected")}>Reject</button></div>}</article>) : <p className="rounded-2xl bg-cream p-6">No {status} reviews.</p>}</div>}
  </div>;
}
