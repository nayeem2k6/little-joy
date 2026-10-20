"use client";

import Image from "next/image";
import Link from "next/link";
import { use, useEffect, useState } from "react";
import { ArrowLeft, Minus, Plus, ShieldCheck, ShoppingBag, Truck } from "lucide-react";
import { api, messageOf, taka } from "@/lib/api";
import { productId, productImage, productStock, type ApiList, type Product } from "@/lib/types";
import { useStore } from "@/components/store-provider";
import { ProductCard } from "@/components/product-card";

const fallback = "https://images.unsplash.com/photo-1599623560574-39d485900c95?auto=format&fit=crop&w=1000&q=80";
function unwrap<T>(res: ApiList<T> | T[]): T[] { return Array.isArray(res) ? res : res.data || res.products || res.items || []; }
interface Review { _id: string; rating: number; comment: string; user?: { name?: string }; createdAt: string }

export default function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [error, setError] = useState("");
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewError, setReviewError] = useState("");
  const [reviewMessage, setReviewMessage] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const { add } = useStore();
  useEffect(() => {
    api<Product | { product: Product }>(`/products/${encodeURIComponent(slug)}`)
      .then(res => {
        const item = "product" in res ? res.product : res;
        setProduct(item);
        const category = typeof item.category === "object" ? item.category.slug : item.category;
        const productRef = item.slug || productId(item);
        void api<ApiList<Review>>(`/products/${encodeURIComponent(productRef)}/reviews`)
          .then(response => setReviews(response.items || []))
          .catch(err => setReviewError(messageOf(err)));
        return category
          ? api<ApiList<Product> | Product[]>(`/products?category=${encodeURIComponent(String(category))}&limit=5`)
          : Promise.resolve({ items: [] } as ApiList<Product>);
      })
      .then(res => setRelated(unwrap(res).filter(item => item.slug !== slug).slice(0, 4)))
      .catch(err => setError(messageOf(err)));
  }, [slug]);
  async function submitReview(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setReviewError(""); setReviewMessage("");
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    try {
      await api(`/products/${encodeURIComponent(product?.slug || productId(product!))}/reviews`, {
        method: "POST",
        body: JSON.stringify({ rating: Number(form.get("rating")), comment: form.get("comment") })
      });
      setReviewMessage("Thanks! Your verified-purchase review has been submitted for moderation.");
      formElement.reset();
    } catch (err) { setReviewError(messageOf(err)); }
  }
  if (error) return <div className="container page-pad"><p role="alert" className="card p-8 text-center">{error} <Link className="text-forest underline" href="/shop">Browse the shop</Link></p></div>;
  if (!product) return <div className="container page-pad"><div className="h-96 animate-pulse rounded-3xl bg-cream" /></div>;
  const image = productImage(product) || fallback;
  const stock = productStock(product);
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: product.images?.length ? product.images : [image],
    offers: {
      "@type": "Offer",
      priceCurrency: "BDT",
      price: product.price,
      availability: stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock"
    }
  };
  return <div className="container page-pad">
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }} />
    <Link href="/shop" className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-forest"><ArrowLeft size={16} />Back to shop</Link>
    <div className="grid gap-9 lg:grid-cols-2 lg:gap-14">
      <div className="relative aspect-square overflow-hidden rounded-[28px] bg-cream"><Image src={image} alt={product.name} fill priority sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" unoptimized /></div>
      <div className="py-2">
        <span className="pill">{product.ageRecommendation || "Made for little explorers"}</span>
        <h1 className="mt-4 font-display text-4xl font-semibold leading-tight">{product.name}</h1>
        <div className="mt-4 flex items-center gap-3"><strong className="text-2xl text-forest">{taka(product.price)}</strong>{product.compareAtPrice && product.compareAtPrice > product.price && <del className="text-gray-400">{taka(product.compareAtPrice)}</del>}</div>
        <p className="mt-5 whitespace-pre-line leading-7 text-gray-600">{product.description}</p>
        <p className={`mt-5 text-sm font-semibold ${stock > 0 ? "text-forest" : "text-red-600"}`} role="status">{stock > 0 ? `${stock} ready for play` : "Currently out of stock"}</p>
        {product.safetyInformation && <div className="mt-4 flex items-start gap-2 rounded-xl bg-cream p-4 text-sm leading-6 text-gray-700"><ShieldCheck size={18} className="mt-1 shrink-0 text-forest" /><p><strong>Safety notes</strong><br />{product.safetyInformation}</p></div>}
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <div className="flex items-center rounded-full border border-gray-200"><button aria-label="Decrease quantity" className="p-3" onClick={() => setQuantity(q => Math.max(1, q - 1))}><Minus size={15} /></button><span className="min-w-8 text-center">{quantity}</span><button aria-label="Increase quantity" className="p-3" disabled={quantity >= stock} onClick={() => setQuantity(q => Math.min(stock, q + 1))}><Plus size={15} /></button></div>
          <button disabled={!stock} className="btn flex-1 disabled:cursor-not-allowed disabled:opacity-40" onClick={() => { add(product, quantity); setAdded(true); setTimeout(() => setAdded(false), 2500); }}><ShoppingBag size={18} />{added ? "Added to bag!" : "Add to bag"}</button>
          <Link href="/cart" className="btn btn-light border border-forest/10">View bag</Link>
        </div>
        <div className="mt-7 flex gap-3 rounded-2xl bg-mint p-4 text-sm text-forest"><Truck className="shrink-0" /><p><strong>Delivered with care</strong><br />Cash on Delivery available across Bangladesh.</p></div>
      </div>
    </div>
    <section className="mt-16 grid gap-8 lg:grid-cols-[1.2fr_.8fr]">
      <div><h2 className="section-title text-3xl">LittleJoy reviews</h2>{reviewError && <p role="status" className="mt-3 text-sm text-gray-600">Reviews are temporarily unavailable.</p>}
        {reviews.length ? <div className="mt-5 grid gap-3">{reviews.map(review => <article key={review._id} className="card p-4"><div className="flex items-center justify-between gap-3"><strong>{review.user?.name || "LittleJoy customer"}</strong><span aria-label={`${review.rating} out of 5 stars`} className="text-sm text-amber-600">{"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}</span></div><p className="mt-2 leading-6 text-gray-600">{review.comment}</p><p className="mt-2 text-xs text-gray-400">Verified purchase · {new Date(review.createdAt).toLocaleDateString()}</p></article>)}</div> : !reviewError && <p className="mt-4 text-gray-600">No approved reviews yet. Your experience could be the first!</p>}
      </div>
      <form onSubmit={submitReview} className="card h-fit p-5"><h3 className="font-display text-xl">Share your experience</h3><p className="mt-1 text-sm leading-6 text-gray-600">Reviews are available to customers who received this product.</p><label className="field-label mt-4">Rating<select required name="rating" className="field"><option value="5">5 - Loved it</option><option value="4">4 - Great</option><option value="3">3 - Good</option><option value="2">2 - Not for me</option><option value="1">1 - Disappointed</option></select></label><label className="field-label mt-4">Your review<textarea required minLength={3} maxLength={2000} name="comment" rows={4} className="field" /></label>{reviewError && <p role="alert" className="mt-3 text-sm text-red-700">{reviewError}</p>}{reviewMessage && <p role="status" className="mt-3 text-sm text-forest">{reviewMessage}</p>}<button className="btn mt-4 w-full">Submit review</button></form>
    </section>
    {related.length > 0 && <section className="mt-16"><h2 className="section-title text-3xl">More little favorites</h2><div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-5">{related.map(item => <ProductCard key={productId(item)} product={item} />)}</div></section>}
  </div>;
}
