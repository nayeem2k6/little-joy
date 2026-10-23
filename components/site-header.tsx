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
      <div className="bg-forest px-3 py-2 text-center text-[10px] font-semibold text-white sm:text-xs">বিনামূল্যে হোম ডেলিভারি | পণ্য হাতে পেয়ে টাকা পরিশোধ করুন</div>
      <header className="sticky top-0 z-40 border-b border-emerald-950/5 bg-white/95 backdrop-blur">
        <div className="container flex h-[68px] items-center justify-between gap-1 sm:h-[76px] sm:gap-3">
          <button className="grid h-10 w-9 shrink-0 place-items-center rounded-xl text-forest transition-colors hover:bg-cream md:hidden" aria-label={open ? "Close navigation" : "Open navigation"} aria-expanded={open} onClick={() => setOpen(!open)}>{open ? <X size={21} /> : <Menu size={21} />}</button>
          <Link href="/" className="flex min-w-0 shrink items-center gap-1.5 sm:gap-2" aria-label="LittleJoy Toys home">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-[13px] bg-lime text-lg sm:h-10 sm:w-10 sm:text-xl">✿</span>
            <span className="font-display text-[1.2rem] font-semibold leading-none text-forest sm:text-[1.45rem]">littlejoy<span className="text-ink">.</span><span className="block pt-1 text-[.55rem] font-bold tracking-[.13em] text-emerald-800 sm:text-[.64rem] sm:tracking-[.17em]">TOYS & LITTLE THINGS</span></span>
          </Link>
          <nav className="hidden items-center gap-8 md:flex" aria-label="Main navigation">
            {links.map(([label, href]) => <Link key={href} href={href} className="rounded-full px-2 py-2 text-sm font-semibold text-ink/80 transition-colors hover:bg-cream hover:text-forest">{label}</Link>)}
          </nav>
          <div className="flex shrink-0 items-center gap-0 sm:gap-1">
            <Link href="/shop" className="hidden rounded-full p-2.5 transition-colors hover:bg-cream min-[390px]:inline-flex" aria-label="Search products"><Search size={19} /></Link>
            <Link href="/login" className="rounded-full p-2 transition-colors hover:bg-cream sm:p-2.5" aria-label="My account"><UserRound size={19} /></Link>
            <Link href="/cart" className="relative rounded-full p-2 transition-colors hover:bg-cream sm:p-2.5" aria-label={`Shopping bag, ${count} items`}><ShoppingBag size={19} />{count > 0 && <span className="absolute -right-0.5 -top-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-lime px-1 text-[10px] font-bold text-forest">{count}</span>}</Link>
          </div>
        </div>
        {open && <nav className="grid gap-1 border-t px-5 py-3 md:hidden" aria-label="Mobile navigation">
          {links.map(([label, href]) => <Link onClick={() => setOpen(false)} key={href} href={href} className="rounded-lg px-3 py-3 font-semibold hover:bg-cream">{label}</Link>)}
        </nav>}
      </header>
    </>
  );
}
