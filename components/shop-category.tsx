"use client";

import { useEffect, useState } from "react";
import { api, messageOf } from "@/lib/api";
import type { ApiList, Category, Product } from "@/lib/types";
import { ProductCard } from "./product-card";

function unwrap<T>(res: ApiList<T> | T[]): T[] { return Array.isArray(res) ? res : res.data || res.products || res.categories || res.items || []; }
export function ShopCategory({ slug }: { slug: string }) {
  const [category, setCategory] = useState<Category | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("newest");
  const [availability, setAvailability] = useState("all");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    api<ApiList<Category> | Category[]>("/categories")
      .then(response => setCategory(unwrap(response).find(item => item.slug === slug) || { name: slug.replace(/-/g, " "), slug }))
      .catch(() => setCategory({ name: slug.replace(/-/g, " "), slug }));
  }, [slug]);
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(true); setError("");
      const params = new URLSearchParams({ category: slug, limit: "50", sort });
      if (query.trim()) params.set("search", query.trim());
      if (availability !== "all") params.set("availability", availability);
      if (minPrice) params.set("minPrice", minPrice);
      if (maxPrice) params.set("maxPrice", maxPrice);
      api<ApiList<Product> | Product[]>(`/products?${params}`)
        .then(response => setProducts(unwrap(response)))
        .catch(err => setError(messageOf(err)))
        .finally(() => setLoading(false));
    }, 200);
    return () => clearTimeout(timer);
  }, [slug, query, sort, availability, minPrice, maxPrice]);
  return <div className="container page-pad"><p className="eyebrow">Find a little something</p><h1 className="section-title capitalize">{category?.name || slug.replace(/-/g, " ")}</h1>{category?.description && <p className="mb-8 max-w-2xl text-gray-600">{category.description}</p>}
    <div className="my-6 grid gap-3 rounded-2xl bg-cream p-4 sm:grid-cols-2 lg:grid-cols-5"><label><span className="sr-only">Search within this category</span><input className="field" placeholder="Search this category…" value={query} onChange={event => setQuery(event.target.value)} /></label><label><span className="sr-only">Sort category products</span><select className="field" value={sort} onChange={event => setSort(event.target.value)}><option value="newest">Newest</option><option value="price-asc">Price: low to high</option><option value="price-desc">Price: high to low</option><option value="popular">Most loved</option></select></label><label><span className="sr-only">Minimum price</span><input className="field" type="number" min="0" placeholder="Min ৳" value={minPrice} onChange={event => setMinPrice(event.target.value)} /></label><label><span className="sr-only">Maximum price</span><input className="field" type="number" min="0" placeholder="Max ৳" value={maxPrice} onChange={event => setMaxPrice(event.target.value)} /></label><label><span className="sr-only">Availability</span><select className="field" value={availability} onChange={event => setAvailability(event.target.value)}><option value="all">All stock</option><option value="in-stock">In stock</option><option value="out-of-stock">Out of stock</option></select></label></div>
    {loading ? <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">{Array.from({ length: 4 }, (_, i) => <div key={i} className="aspect-[.8] animate-pulse rounded-2xl bg-cream" />)}</div> : error ? <p role="alert" className="card p-8 text-center">{error}</p> : products.length ? <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4">{products.map(p => <ProductCard key={p._id || p.slug} product={p} />)}</div> : <p className="card p-8 text-center text-gray-600">No toys in this category yet. <a className="font-bold text-forest underline" href="/shop">Browse all toys</a></p>}
  </div>;
}
