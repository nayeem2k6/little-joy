"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, BadgeCheck, Blocks, Gift, Heart, HeartHandshake, Lightbulb, PackageCheck, Sparkles, Truck } from "lucide-react";
import { api } from "@/lib/api";
import { productId, type ApiList, type Category, type Product } from "@/lib/types";
import { ProductCard } from "@/components/product-card";
import { LoadingSpinner } from "@/components/loading-spinner";

function unwrap<T>(response: ApiList<T> | T[]): T[] {
  return Array.isArray(response) ? response : response.data || response.products || response.categories || response.items || [];
}

const categoryImage = "https://i.ibb.co.com/XfxYbQd2/Screenshot-2026-10-23-192906.png";
const categoryImageFallback = "https://images.unsplash.com/photo-1599623560574-39d485900c95?auto=format&fit=crop&w=900&q=85";

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [failedCategoryImages, setFailedCategoryImages] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    Promise.all([
      api<ApiList<Product> | Product[]>("/products?limit=4&featured=true")
        .then(async response => {
          const featured = unwrap(response);
          return featured.length ? featured : unwrap(await api<ApiList<Product> | Product[]>("/products?limit=4&sort=popular"));
        }),
      api<ApiList<Category> | Category[]>("/categories")
    ]).then(([p, c]) => { setProducts(p.slice(0, 4)); setCategories(unwrap(c).slice(0, 4)); })
      .catch(() => setError("Our shelves are taking a little break. Please check back soon."))
      .finally(() => setLoading(false));
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
    <section className="container relative z-10 -mt-5 pb-4 sm:-mt-7" aria-label="LittleJoy shopping promises">
      <div className="grid overflow-hidden rounded-[22px] border border-emerald-950/5 bg-white shadow-[0_16px_42px_rgba(23,77,58,.09)] sm:grid-cols-2 lg:grid-cols-4">
        <div className="flex items-center gap-3 border-b border-emerald-950/5 p-4 sm:border-r lg:border-b-0"><span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-mint text-forest"><HeartHandshake size={21} /></span><div><p className="font-bold text-forest">Picked with care</p><p className="mt-0.5 text-xs text-gray-500">Thoughtful little finds</p></div></div>
        <div className="flex items-center gap-3 border-b border-emerald-950/5 p-4 lg:border-b-0 lg:border-r"><span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-[#fff3d7] text-forest"><Gift size={21} /></span><div><p className="font-bold text-forest">Made for gifting</p><p className="mt-0.5 text-xs text-gray-500">For birthdays and just-because</p></div></div>
        <div className="flex items-center gap-3 border-b border-emerald-950/5 p-4 sm:border-b-0 sm:border-r"><span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-[#fce8e0] text-forest"><Truck size={21} /></span><div><p className="font-bold text-forest">Delivered with care</p><p className="mt-0.5 text-xs text-gray-500">Across Bangladesh</p></div></div>
        <div className="flex items-center gap-3 p-4"><span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-[#f2eaff] text-forest"><BadgeCheck size={21} /></span><div><p className="font-bold text-forest">Easy COD checkout</p><p className="mt-0.5 text-xs text-gray-500">Pay when your order arrives</p></div></div>
      </div>
    </section>
    <section className="container py-16">
      <div className="mb-7 flex items-end justify-between gap-4"><div><p className="eyebrow">Find their kind of fun</p><h2 className="section-title">Shop by category</h2></div><Link href="/shop" className="hidden items-center gap-2 text-sm font-bold text-forest sm:flex">All toys <ArrowRight size={16} /></Link></div>
      {loading ? <LoadingSpinner label="Loading categories..." /> : categories.length ? <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">{categories.slice(0, 4).map((category, i) => <Link key={category.slug} href={`/category/${category.slug}`} className={`group relative aspect-[.95] overflow-hidden rounded-[22px] ${i % 2 ? "bg-mint" : "bg-cream"}`}>
        {!failedCategoryImages.includes(category.slug)
          ? <Image
            src={categoryImage}
            alt=""
            fill
            sizes="(max-width: 640px) 50vw, 25vw"
            className="object-cover transition duration-500 group-hover:scale-105"
            unoptimized
            onError={() => setFailedCategoryImages(current => current.includes(category.slug) ? current : [...current, category.slug])}
          />
          : <Image
            src={categoryImageFallback}
            alt=""
            fill
            sizes="(max-width: 640px) 50vw, 25vw"
            className="object-cover transition duration-500 group-hover:scale-105"
            unoptimized
          />}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-4 pt-12 text-white"><strong className="font-display text-lg">{category.name}</strong><span className="ml-2 inline-flex align-middle"><ArrowRight size={15} /></span></div>
      </Link>)}</div> : <p className="rounded-2xl bg-cream p-6 text-gray-600">New toy categories are on their way. Explore all available toys in the shop.</p>}
    </section>
    <section className="bg-[#f8fbf7] py-16"><div className="container">
      <div className="mb-7 flex items-end justify-between gap-4"><div><p className="eyebrow">Handpicked for happy days</p><h2 className="section-title">Little favorites</h2></div><Link href="/shop" className="flex items-center gap-2 text-sm font-bold text-forest">Shop all <ArrowRight size={16} /></Link></div>
      {loading ? <LoadingSpinner label="Loading favorite toys..." /> : error ? <p role="status" className="card p-6 text-center text-gray-600">{error}</p> : products.length
        ? <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">{products.map(p => <ProductCard key={productId(p)} product={p} />)}</div>
        : <p className="py-10 text-center text-gray-500">Discover our growing collection in the shop.</p>}
    </div></section>
    <section className="overflow-hidden bg-[#174d3a] py-16 text-white sm:py-20">
      <div className="container grid items-center gap-10 lg:grid-cols-[.9fr_1.1fr]">
        <div className="relative z-10">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-[.14em] text-lime"><Sparkles size={15} /> A little play goes a long way</span>
          <h2 className="mt-5 max-w-lg font-display text-4xl font-semibold leading-tight sm:text-5xl">Big ideas start with little hands.</h2>
          <p className="mt-5 max-w-lg leading-7 text-white/75">Every little game can become a grand adventure. Find playthings that invite your child to imagine, explore and make memories together.</p>
          <Link href="/about" className="btn btn-light mt-7">Why play matters <ArrowRight size={17} /></Link>
        </div>
        <div className="relative mx-auto grid w-full max-w-xl grid-cols-2 gap-3 sm:gap-4">
          <div className="absolute -right-8 -top-8 h-36 w-36 rounded-full bg-lime/15 blur-2xl" aria-hidden="true" />
          <article className="relative rounded-[26px] bg-[#d5fff0] p-5 text-forest sm:p-7">
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-white/75"><Lightbulb size={24} /></span>
            <h3 className="mt-8 font-display text-xl font-semibold sm:text-2xl">Imagine</h3>
            <p className="mt-2 text-sm leading-6 text-forest/75">Turn an ordinary afternoon into a whole new world.</p>
          </article>
          <article className="relative mt-8 rounded-[26px] bg-[#e5edb2] p-5 text-forest sm:mt-12 sm:p-7">
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-white/75"><Blocks size={24} /></span>
            <h3 className="mt-8 font-display text-xl font-semibold sm:text-2xl">Discover</h3>
            <p className="mt-2 text-sm leading-6 text-forest/75">Try, build, mix things up and see what happens.</p>
          </article>
          <article className="relative -mt-8 rounded-[26px] bg-[#f8e7d2] p-5 text-forest sm:-mt-12 sm:p-7">
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-white/75"><Heart size={24} /></span>
            <h3 className="mt-8 font-display text-xl font-semibold sm:text-2xl">Connect</h3>
            <p className="mt-2 text-sm leading-6 text-forest/75">Make room for the best kind of together time.</p>
          </article>
          <div className="relative flex min-h-44 flex-col items-center justify-center overflow-hidden rounded-[26px] bg-white/10 p-5 text-center sm:min-h-52">
            <span className="text-5xl" aria-hidden="true">✿</span>
            <p className="mt-3 font-display text-lg font-medium text-white">Little things,<br />big joy.</p>
          </div>
        </div>
      </div>
    </section>
    <section className="container py-16 sm:py-20">
      <div className="mx-auto max-w-2xl text-center">
        <p className="eyebrow">From our toy box to yours</p>
        <h2 className="section-title mt-2">A happy little journey, made simple.</h2>
        <p className="mt-3 leading-7 text-gray-600">A few easy steps between finding a favorite and hearing that happy little knock at the door.</p>
      </div>
      <div className="relative mt-10 grid gap-4 md:grid-cols-3">
        <div className="absolute left-[18%] right-[18%] top-8 hidden border-t-2 border-dashed border-emerald-900/15 md:block" aria-hidden="true" />
        <article className="card relative p-6 text-center sm:p-8">
          <span className="mx-auto grid h-16 w-16 place-items-center rounded-[22px] bg-mint text-forest"><span className="font-display text-2xl font-semibold">01</span></span>
          <h3 className="mt-5 font-display text-2xl font-semibold text-forest">Find the fun</h3>
          <p className="mt-2 leading-6 text-gray-600">Explore the toy box and spot something made for their kind of play.</p>
        </article>
        <article className="card relative bg-cream p-6 text-center sm:p-8">
          <span className="mx-auto grid h-16 w-16 place-items-center rounded-[22px] bg-white text-forest"><span className="font-display text-2xl font-semibold">02</span></span>
          <h3 className="mt-5 font-display text-2xl font-semibold text-forest">Make it theirs</h3>
          <p className="mt-2 leading-6 text-gray-600">Choose a little favorite, add it to your bag and place your order.</p>
        </article>
        <article className="card relative bg-[#f4f8e8] p-6 text-center sm:p-8">
          <span className="mx-auto grid h-16 w-16 place-items-center rounded-[22px] bg-white text-forest"><Truck size={25} /></span>
          <h3 className="mt-5 font-display text-2xl font-semibold text-forest">Welcome the joy</h3>
          <p className="mt-2 leading-6 text-gray-600">We deliver across Bangladesh. Pay with Cash on Delivery when it arrives.</p>
        </article>
      </div>
      <div className="mt-8 text-center"><Link href="/shop" className="btn">Start exploring <ArrowRight size={17} /></Link></div>
    </section>
    <section className="container pb-16 sm:pb-20">
      <div className="relative isolate overflow-hidden rounded-[30px] bg-[#e7f8eb] px-6 py-9 sm:px-10 sm:py-12 lg:px-14">
        <div className="absolute -right-14 -top-20 -z-10 h-64 w-64 rounded-full bg-[#d5ff70]/70 blur-2xl" aria-hidden="true" />
        <div className="absolute -bottom-24 right-[27%] -z-10 h-56 w-56 rounded-full bg-[#d5fff0] blur-2xl" aria-hidden="true" />
        <div className="grid items-center gap-8 lg:grid-cols-[1fr_auto]">
          <div className="max-w-2xl">
            <p className="eyebrow">For birthdays, big days & little surprises</p>
            <h2 className="mt-3 font-display text-3xl font-semibold leading-tight text-forest sm:text-4xl">The best gifts leave room for imagination.</h2>
            <p className="mt-4 max-w-xl leading-7 text-forest/75">Not sure where to start? Browse the toy box or get in touch. We’re happy to help you find a thoughtful little something.</p>
            <div className="mt-6 flex flex-wrap gap-3"><Link href="/shop" className="btn">Find a little gift <Gift size={17} /></Link><Link href="/contact" className="btn btn-light border border-forest/10">Ask us for help</Link></div>
          </div>
          <div className="hidden h-44 w-44 rotate-3 items-center justify-center rounded-[34px] bg-white shadow-soft sm:flex lg:h-52 lg:w-52">
            <div className="grid h-36 w-36 place-items-center rounded-[28px] bg-lime text-forest lg:h-44 lg:w-44"><Gift size={62} strokeWidth={1.4} /></div>
          </div>
        </div>
      </div>
    </section>
    <section className="container grid gap-10 py-16 md:grid-cols-2 md:items-center">
      <div><p className="eyebrow">The LittleJoy promise</p><h2 className="section-title max-w-lg">A little more thought in every toy.</h2><p className="mt-4 max-w-lg leading-7 text-gray-600">Play is how little ones make sense of a big world. We look for joyful, age-appropriate toys that invite imagination, discovery and together time.</p><Link href="/about" className="btn mt-6">Why families choose us <ArrowRight size={17} /></Link></div>
      <div className="grid gap-4 sm:grid-cols-2"><div className="card bg-cream p-5"><HeartHandshake className="text-forest" /><h3 className="mt-3 font-bold">Picked with care</h3><p className="mt-1 text-sm leading-6 text-gray-600">Thoughtful finds for every little stage.</p></div><div className="card bg-mint p-5"><PackageCheck className="text-forest" /><h3 className="mt-3 font-bold">A happy arrival</h3><p className="mt-1 text-sm leading-6 text-gray-600">Packed with care and sent across Bangladesh.</p></div><div className="card p-5 sm:col-span-2"><span className="text-2xl">💚</span><h3 className="mt-2 font-bold">Here for the grown-ups, too</h3><p className="mt-1 text-sm leading-6 text-gray-600">Friendly help when choosing the right gift or tracking an order.</p></div></div>
    </section>
    <section className="bg-lime py-14"><div className="container flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center"><div><p className="eyebrow">A note from our toy box</p><h2 className="mt-2 font-display text-3xl font-semibold text-forest">Little joys, straight to your inbox.</h2><p className="mt-2 text-forest/75">New finds and playful ideas, now and then.</p></div><a className="btn" href="mailto:hello@littlejoytoys.com?subject=Join%20the%20LittleJoy%20mailing%20list">Join the mailing list</a></div></section>
  </>;
}
