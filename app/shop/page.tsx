"use client";

import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { api, messageOf, taka } from "@/lib/api";
import { productId, type ApiList, type Category, type Product } from "@/lib/types";
import { ProductCard } from "@/components/product-card";
import { LoadingSpinner } from "@/components/loading-spinner";

function list<T>(res: ApiList<T> | T[]): T[] {
  return Array.isArray(res) ? res : res.data || res.products || res.categories || res.items || [];
}

export default function ShopPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [sort, setSort] = useState("newest");
  const [min, setMin] = useState("");
  const [max, setMax] = useState("");
  const [availability, setAvailability] = useState("all");
  const [page, setPage] = useState(1);
  const [retry, setRetry] = useState(0);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    setCategoriesLoading(true);
    api<ApiList<Category> | Category[]>("/categories")
      .then(res => setCategories(list(res)))
      .catch(() => setCategories([]))
      .finally(() => setCategoriesLoading(false));
  }, []);
  useEffect(() => {
    setLoading(true);
    setError("");
    const timer = setTimeout(() => {
      const params = new URLSearchParams({ page: String(page), limit: "12", sort });
      if (query.trim()) params.set("search", query.trim());
      if (category) params.set("category", category);
      if (min) params.set("minPrice", min);
      if (max) params.set("maxPrice", max);
      if (availability !== "all") params.set("availability", availability);
      api<ApiList<Product> | Product[]>(`/products?${params}`)
        .then(res => {
          setProducts(list(res));
          setPages(!Array.isArray(res) && res.pagination?.pages ? res.pagination.pages : 1);
        })
        .catch(err => setError(messageOf(err)))
        .finally(() => setLoading(false));
    }, 250);
    return () => clearTimeout(timer);
  }, [page, query, category, sort, min, max, availability, retry]);
  return <div className="container page-pad">
    <p className="eyebrow">A toy for every little adventure</p><h1 className="section-title">The toy box</h1><p className="mb-8 max-w-2xl text-gray-600">Explore thoughtful finds for playtime, growing minds and gifting days.</p>
    <div className="mb-7 grid gap-3 rounded-2xl bg-cream p-4 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1fr_1fr_1fr]">
      <label className="relative sm:col-span-2 lg:col-span-1"><span className="sr-only">Search toys</span><Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" /><input className="field pl-10" placeholder="Search toys…" value={query} onChange={e => { setQuery(e.target.value); setPage(1); }} /></label>
      <label className="field-label"><span className="sr-only">Category</span>{categoriesLoading ? <LoadingSpinner label="Loading categories..." compact /> : <select className="field" value={category} onChange={e => { setCategory(e.target.value); setPage(1); }}><option value="">All categories</option>{categories.map(c => <option key={c.slug} value={c.slug}>{c.name}</option>)}</select>}</label>
      <label className="field-label"><span className="sr-only">Sort by</span><select className="field" value={sort} onChange={e => setSort(e.target.value)}><option value="newest">Newest</option><option value="price-asc">Price: low to high</option><option value="price-desc">Price: high to low</option><option value="popular">Most loved</option></select></label>
      <label><span className="sr-only">Minimum price in taka</span><input className="field" type="number" min="0" placeholder="Min ৳" value={min} onChange={e => { setMin(e.target.value); setPage(1); }} /></label>
      <label><span className="sr-only">Maximum price in taka</span><input className="field" type="number" min="0" placeholder="Max ৳" value={max} onChange={e => { setMax(e.target.value); setPage(1); }} /></label>
      <label className="field-label"><span className="sr-only">Availability</span><select className="field" value={availability} onChange={e => { setAvailability(e.target.value); setPage(1); }}><option value="all">All stock</option><option value="in-stock">In stock</option><option value="out-of-stock">Out of stock</option></select></label>
    </div>
    {loading ? <LoadingSpinner label="Loading toys..." />
      : error ? <div role="alert" className="card p-8 text-center"><p className="font-semibold">We couldn’t load the toys.</p><p className="mt-2 text-sm text-gray-600">{error}</p><button className="btn mt-4" onClick={() => setRetry(value => value + 1)}>Try again</button></div>
        : products.length ? <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4">{products.map(p => <ProductCard key={productId(p)} product={p} />)}</div>
          : <div className="card p-10 text-center"><p className="font-display text-2xl">No toys found just yet</p><p className="mt-2 text-gray-600">Try another search or clear your filters.</p><button className="btn mt-4" onClick={() => { setQuery(""); setCategory(""); setMin(""); setMax(""); setAvailability("all"); }}>Clear filters</button></div>}
    {!loading && products.length > 0 && <nav aria-label="Product pages" className="mt-9 flex items-center justify-center gap-4"><button className="btn btn-light border" disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</button><span className="text-sm">Page {page} of {pages}</span><button className="btn btn-light border" disabled={page >= pages} onClick={() => setPage(page + 1)}>Next</button></nav>}
    <span className="sr-only">{taka(products[0]?.price || 0)}</span>
  </div>;
}
