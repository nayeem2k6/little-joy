"use client";

import { useEffect, useState } from "react";
import { api, messageOf } from "@/lib/api";

interface Customer { id: string; name: string; email: string; phone?: string; createdAt: string; orderCount: number }
interface CustomerList { items: Customer[]; pagination?: { page: number; pages: number; total: number } }
export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [error, setError] = useState("");
  useEffect(() => {
    api<CustomerList>(`/admin/customers?page=${page}&limit=20`)
      .then(response => { setCustomers(response.items || []); setPages(response.pagination?.pages || 1); })
      .catch(err => setError(messageOf(err)));
  }, [page]);
  return <div className="container page-pad"><p className="eyebrow">Store management</p><h1 className="section-title">Customers</h1>{error && <p role="alert" className="my-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
    {customers.length ? <div className="mt-5 grid gap-3">{customers.map(customer => <article key={customer.id} className="card flex flex-wrap items-center justify-between gap-3 p-4"><div><strong>{customer.name}</strong><p className="text-sm text-gray-500">{customer.email}{customer.phone ? ` · ${customer.phone}` : ""}</p></div><div className="text-sm text-gray-600">{customer.orderCount} order(s)<br />Joined {new Date(customer.createdAt).toLocaleDateString()}</div></article>)}</div> : !error && <p className="mt-5 rounded-2xl bg-cream p-6">No customers found.</p>}
    {pages > 1 && <nav aria-label="Customer pages" className="mt-7 flex items-center justify-center gap-4"><button className="btn btn-light border" disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</button><span className="text-sm">Page {page} of {pages}</span><button className="btn btn-light border" disabled={page >= pages} onClick={() => setPage(page + 1)}>Next</button></nav>}
  </div>;
}
