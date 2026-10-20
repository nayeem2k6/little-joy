"use client";

import Image from "next/image";
import Link from "next/link";
import { ShoppingBag, Star } from "lucide-react";
import { productId, productImage, productStock, type Product } from "@/lib/types";
import { taka } from "@/lib/api";
import { useStore } from "./store-provider";

const fallback = "https://images.unsplash.com/photo-1599623560574-39d485900c95?auto=format&fit=crop&w=800&q=80";

export function ProductCard({ product }: { product: Product }) {
  const { add } = useStore();
  const image = productImage(product) || fallback;
  const stock = productStock(product);
  const sale = product.compareAtPrice && product.compareAtPrice > product.price
    ? Math.round((1 - product.price / product.compareAtPrice) * 100) : 0;
  return <article className="group overflow-hidden rounded-[20px] border border-emerald-950/5 bg-white transition hover:-translate-y-1 hover:shadow-soft">
    <Link href={`/product/${product.slug || productId(product)}`} className="relative block aspect-[4/3] overflow-hidden bg-cream">
      <Image src={image} alt={product.name} fill sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw" className="object-cover transition duration-500 group-hover:scale-105" unoptimized />
      {sale > 0 && <span className="absolute left-3 top-3 rounded-full bg-lime px-3 py-1 text-xs font-bold text-forest">{sale}% off</span>}
      {stock <= 0 && <span className="absolute bottom-3 left-3 rounded-full bg-white px-3 py-1 text-xs font-bold">Sold out</span>}
    </Link>
    <div className="p-4">
      <div className="flex items-center justify-between gap-2">
        <span className="pill">{typeof product.category === "object" ? product.category.name : product.ageRecommendation || "Made for play"}</span>
        <span className="flex items-center gap-1 text-xs font-semibold text-amber-600"><Star size={13} fill="currentColor" />{product.averageRating?.toFixed(1) || "New"}</span>
      </div>
      <Link href={`/product/${product.slug || productId(product)}`} className="mt-3 block font-display text-lg font-medium leading-snug hover:text-forest">{product.name}</Link>
      <div className="mt-3 flex items-center justify-between gap-2">
        <div className="flex flex-wrap items-baseline gap-2"><strong className="text-forest">{taka(product.price)}</strong>{product.compareAtPrice && product.compareAtPrice > product.price && <del className="text-xs text-gray-400">{taka(product.compareAtPrice)}</del>}</div>
        <button onClick={() => add(product)} disabled={stock <= 0} aria-label={`Add ${product.name} to cart`} className="grid h-10 w-10 place-items-center rounded-full bg-mint text-forest transition hover:bg-lime disabled:cursor-not-allowed disabled:opacity-40"><ShoppingBag size={18} /></button>
      </div>
    </div>
  </article>;
}
