"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, BadgeCheck, HeartHandshake, PackageCheck, Truck } from "lucide-react";
import { api } from "@/lib/api";
import { productId, type ApiList, type Category, type Product } from "@/lib/types";
import { ProductCard } from "@/components/product-card";

const categoriesFallback = [
  { name: "Baby & toddler", slug: "baby-toddler", imageUrl: "https://images.unsplash.com/photo-1519689680058-324335c77eba?auto=format&fit=crop&w=700&q=80" },
  { name: "Pretend play", slug: "pretend-play", imageUrl: "https://images.unsplash.com/photo-1599623560574-39d485900c95?auto=format&fit=crop&w=700&q=80" },
  { name: "Building & puzzles", slug: "building-puzzles", imageUrl: "https://images.unsplash.com/photo-1587654780291-39c9404d746b?auto=format&fit=crop&w=700&q=80" },
  { name: "Creative play", slug: "creative-play", imageUrl: "https://images.unsplash.com/photo-1560961911-ba7ef651a56c?auto=format&fit=crop&w=700&q=80" }
];

function unwrap<T>(response: ApiList<T> | T[]): T[] {
  return Array.isArray(response) ? response : response.data || response.products || response.categories || response.items || [];
}

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [error, setError] = useState("");
  useEffect(() => {
    Promise.all([
      api<ApiList<Product> | Product[]>("/products?limit=4&sort=popular"),
      api<ApiList<Category> | Category[]>("/categories")
    ]).then(([p, c]) => { setProducts(unwrap(p).slice(0, 4)); setCategories(unwrap(c).slice(0, 4)); })
      .catch(() => setError("Our shelves are taking a little break. Please check back soon."));
  }, []);
  return <>
    <section className="overflow-hidden bg-cream">
      <div className="container grid min-h-[540px] items-center gap-8 py-12 md:grid-cols-[1fr_.95fr] md:py-16">
        <div className="relative z-10 py-4">
          <span className="pill">A little wonder in every box ✨</span>
          <h1 className="mt-5 max-w-xl font-display text-[clamp(3.1rem,7vw,5.5rem)] font-semibold leading-[.98] tracking-[-.04em] text-forest">Little things,<br /><span className="text-[#83a53a]">big joy.</span></h1>
          <p className="mt-5 max-w-md text-lg leading-8 text-ink/70">Thoughtful toys that turn everyday moments into big adventures. Picked with care for your little one.</p>
          <div className="mt-8 flex flex-wrap gap-3"><Link href="/shop" className="btn">Find their next favorite <ArrowRight size={18} /></Link><Link href="/about" className="btn btn-light border border-forest/10">Our little story</Link></div>
          <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm font-semibold text-forest"><span className="flex items-center gap-2"><BadgeCheck size={17} />Thoughtfully picked</span><span className="flex items-center gap-2"><Truck size={17} />Delivery all over BD</span></div>
        </div>
        <div className="relative mx-auto w-full max-w-[540px]">
          <div className="absolute -inset-4 rounded-[45%_55%_55%_45%] bg-mint" />
          <div className="relative aspect-[5/4] overflow-hidden rounded-[35%_65%_50%_50%/45%_45%_55%_55%] shadow-soft">
            <Image src="https://images.unsplash.com/photo-1599623560574-39d485900c95?auto=format&fit=crop&w=1200&q=85" alt="Colorful wooden toys ready for a day of play" fill priority sizes="(max-width: 768px) 90vw, 45vw" className="object-cover" unoptimized />
          </div>
          <div className="absolute -bottom-4 -left-4 rounded-2xl bg-white px-4 py-3 shadow-soft"><span className="block text-lg">🌱 Play with purpose</span><span className="text-xs text-gray-500">Little minds, growing every day</span></div>
        </div>
      </div>
    </section>
    <section className="container py-16">
      <div className="mb-7 flex items-end justify-between gap-4"><div><p className="eyebrow">Find their kind of fun</p><h2 className="section-title">Shop by category</h2></div><Link href="/shop" className="hidden items-center gap-2 text-sm font-bold text-forest sm:flex">All toys <ArrowRight size={16} /></Link></div>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">{(categories.length ? categories : categoriesFallback).map((category, i) => <Link key={category.slug} href={`/category/${category.slug}`} className={`group relative aspect-[.95] overflow-hidden rounded-[22px] ${i % 2 ? "bg-mint" : "bg-cream"}`}>
        <Image src={category.imageUrl || categoriesFallback[i % categoriesFallback.length].imageUrl} alt="" fill sizes="(max-width: 640px) 50vw, 25vw" className="object-cover transition duration-500 group-hover:scale-105" unoptimized />
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-4 pt-12 text-white"><strong className="font-display text-lg">{category.name}</strong><span className="ml-2 inline-flex align-middle"><ArrowRight size={15} /></span></div>
      </Link>)}</div>
    </section>
    <section className="bg-[#f8fbf7] py-16"><div className="container">
      <div className="mb-7 flex items-end justify-between gap-4"><div><p className="eyebrow">Handpicked for happy days</p><h2 className="section-title">Little favorites</h2></div><Link href="/shop" className="flex items-center gap-2 text-sm font-bold text-forest">Shop all <ArrowRight size={16} /></Link></div>
      {error ? <p role="status" className="card p-6 text-center text-gray-600">{error}</p> : products.length
        ? <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">{products.map(p => <ProductCard key={productId(p)} product={p} />)}</div>
        : <p className="py-10 text-center text-gray-500">Discover our growing collection in the shop.</p>}
    </div></section>
    <section className="container grid gap-10 py-16 md:grid-cols-2 md:items-center">
      <div><p className="eyebrow">The LittleJoy promise</p><h2 className="section-title max-w-lg">A little more thought in every toy.</h2><p className="mt-4 max-w-lg leading-7 text-gray-600">Play is how little ones make sense of a big world. We look for joyful, age-appropriate toys that invite imagination, discovery and together time.</p><Link href="/about" className="btn mt-6">Why families choose us <ArrowRight size={17} /></Link></div>
      <div className="grid gap-4 sm:grid-cols-2"><div className="card bg-cream p-5"><HeartHandshake className="text-forest" /><h3 className="mt-3 font-bold">Picked with care</h3><p className="mt-1 text-sm leading-6 text-gray-600">Thoughtful finds for every little stage.</p></div><div className="card bg-mint p-5"><PackageCheck className="text-forest" /><h3 className="mt-3 font-bold">A happy arrival</h3><p className="mt-1 text-sm leading-6 text-gray-600">Packed with care and sent across Bangladesh.</p></div><div className="card p-5 sm:col-span-2"><span className="text-2xl">💚</span><h3 className="mt-2 font-bold">Here for the grown-ups, too</h3><p className="mt-1 text-sm leading-6 text-gray-600">Friendly help when choosing the right gift or tracking an order.</p></div></div>
    </section>
    <section className="bg-lime py-14"><div className="container flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center"><div><p className="eyebrow">A note from our toy box</p><h2 className="mt-2 font-display text-3xl font-semibold text-forest">Little joys, straight to your inbox.</h2><p className="mt-2 text-forest/75">New finds and playful ideas, now and then.</p></div><a className="btn" href="mailto:hello@littlejoytoys.com?subject=Join%20the%20LittleJoy%20mailing%20list">Join the mailing list</a></div></section>
  </>;
}
