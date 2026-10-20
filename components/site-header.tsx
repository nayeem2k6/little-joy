"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, Search, ShoppingBag, X, UserRound } from "lucide-react";
import { useStore } from "./store-provider";

const links = [["Shop", "/shop"], ["Our story", "/about"], ["FAQs", "/faq"], ["Contact", "/contact"]];

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const { count } = useStore();
  return (
    <>
      <div className="bg-forest py-2 text-center text-xs font-semibold text-white">Little smiles, delivered across Bangladesh · Cash on Delivery available</div>
      <header className="sticky top-0 z-40 border-b border-emerald-950/5 bg-white/95 backdrop-blur">
        <div className="container flex h-[76px] items-center justify-between gap-5">
          <button className="rounded-lg p-2 md:hidden" aria-label={open ? "Close navigation" : "Open navigation"} onClick={() => setOpen(!open)}>{open ? <X /> : <Menu />}</button>
          <Link href="/" className="flex shrink-0 items-center gap-2" aria-label="LittleJoy Toys home">
            <span className="grid h-10 w-10 place-items-center rounded-[15px] bg-lime text-xl">✿</span>
            <span className="font-display text-[1.45rem] font-semibold leading-none text-forest">littlejoy<span className="text-ink">.</span><span className="block pt-1 text-[.64rem] font-bold tracking-[.17em] text-emerald-800">TOYS & LITTLE THINGS</span></span>
          </Link>
          <nav className="hidden items-center gap-8 md:flex" aria-label="Main navigation">
            {links.map(([label, href]) => <Link key={href} href={href} className="text-sm font-semibold text-ink/80 hover:text-forest">{label}</Link>)}
          </nav>
          <div className="flex items-center gap-1">
            <Link href="/shop" className="rounded-full p-2.5 hover:bg-cream" aria-label="Search products"><Search size={20} /></Link>
            <Link href="/login" className="rounded-full p-2.5 hover:bg-cream" aria-label="My account"><UserRound size={20} /></Link>
            <Link href="/cart" className="relative rounded-full p-2.5 hover:bg-cream" aria-label={`Shopping bag, ${count} items`}><ShoppingBag size={20} />{count > 0 && <span className="absolute -right-0.5 -top-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-lime px-1 text-[10px] font-bold text-forest">{count}</span>}</Link>
          </div>
        </div>
        {open && <nav className="grid gap-1 border-t px-5 py-3 md:hidden" aria-label="Mobile navigation">
          {links.map(([label, href]) => <Link onClick={() => setOpen(false)} key={href} href={href} className="rounded-lg px-3 py-3 font-semibold hover:bg-cream">{label}</Link>)}
        </nav>}
      </header>
    </>
  );
}
