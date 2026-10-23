"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2 } from "lucide-react";
import { useStore } from "@/components/store-provider";
import { taka } from "@/lib/api";
import { productId, productImage, productStock } from "@/lib/types";
import { LoadingSpinner } from "@/components/loading-spinner";
import { useToast } from "@/components/toast-provider";

export default function CartPage() {
  const { items, update, remove, ready } = useStore();
  const { show } = useToast();
  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  if (!ready) return <div className="container page-pad"><LoadingSpinner label="Loading your bag..." /></div>;
  if (!items.length) return <div className="container page-pad text-center"><span className="text-5xl">🧸</span><h1 className="section-title mt-4">Your bag is taking a nap</h1><p className="mb-6 text-gray-600">Add a little joy to your day.</p><Link href="/shop" className="btn">Explore the toy box</Link></div>;
  return <div className="container page-pad"><p className="eyebrow">Almost time for play</p><h1 className="section-title">Your bag</h1>
    <div className="mt-7 grid gap-7 lg:grid-cols-[1.5fr_.8fr]">
      <div className="grid content-start gap-3">{items.map(({ product, quantity }) => {
        const id = productId(product);
        return <article key={id} className="card flex gap-4 p-3 sm:gap-5 sm:p-4">
          <Link href={`/product/${product.slug || id}`} className="relative aspect-square w-24 shrink-0 overflow-hidden rounded-xl bg-cream sm:w-32"><Image src={productImage(product) || "https://images.unsplash.com/photo-1599623560574-39d485900c95?auto=format&fit=crop&w=400&q=75"} alt={product.name} fill sizes="128px" className="object-cover" unoptimized /></Link>
          <div className="flex min-w-0 flex-1 flex-col justify-between py-1"><div className="flex items-start justify-between gap-2"><div><Link href={`/product/${product.slug || id}`} className="font-display text-lg font-medium">{product.name}</Link><p className="mt-1 text-sm text-gray-500">{taka(product.price)} each</p></div><button aria-label={`Remove ${product.name}`} onClick={() => { remove(id); show(`${product.name} removed from your bag.`); }} className="rounded-full p-2 text-gray-500 hover:bg-red-50 hover:text-red-600"><Trash2 size={17} /></button></div>
            <div className="flex items-center justify-between"><div className="flex items-center rounded-full border border-gray-200"><button aria-label="Decrease quantity" onClick={() => { if (quantity > 1) { update(id, quantity - 1); show("Bag quantity updated."); } else { remove(id); show(`${product.name} removed from your bag.`); } }} className="p-2"><Minus size={14} /></button><span className="min-w-7 text-center text-sm">{quantity}</span><button aria-label="Increase quantity" disabled={quantity >= productStock(product)} onClick={() => { update(id, quantity + 1); show("Bag quantity updated."); }} className="p-2 disabled:opacity-30"><Plus size={14} /></button></div><strong className="text-forest">{taka(product.price * quantity)}</strong></div>
          </div>
        </article>;
      })}</div>
      <aside className="card h-fit p-5 sm:p-6"><h2 className="font-display text-2xl">Order summary</h2><div className="mt-5 grid gap-3 text-sm"><div className="flex justify-between"><span className="text-gray-600">Subtotal estimate</span><span>{taka(subtotal)}</span></div><div className="flex justify-between"><span className="text-gray-600">Delivery</span><span>Calculated at checkout</span></div><div className="my-1 border-t" /><div className="flex justify-between text-base font-bold"><span>Items subtotal</span><span className="text-forest">{taka(subtotal)}</span></div></div><p className="mt-4 text-xs leading-5 text-gray-500">The server confirms current prices, stock, coupon discounts and delivery charges when you place your order.</p><Link href="/checkout" className="btn mt-5 w-full">Continue to checkout</Link><Link href="/shop" className="mt-4 block text-center text-sm font-semibold text-forest">Keep exploring</Link></aside>
    </div>
  </div>;
}
