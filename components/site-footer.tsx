import Link from "next/link";
import { Instagram, Facebook} from "lucide-react";

export function SiteFooter() {
  return <footer className="bg-forest text-white">
    <div className="container grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1.2fr]">
      <div><Link href="/" className="font-display text-3xl font-semibold">littlejoy<span className="text-lime">.</span></Link><p className="mt-4 max-w-xs text-sm leading-6 text-white/75">Thoughtful playthings for curious little minds. Carefully picked, joyfully delivered.</p> </div>
      <div><h2 className="font-bold">Explore</h2><div className="mt-4 grid gap-3 text-sm text-white/75"><Link href="/shop">Shop all toys</Link><Link href="/about">Our story</Link><Link href="/contact">Contact us</Link><Link href="/faq">FAQs</Link></div></div>
      <div><h2 className="font-bold">Here to help</h2><div className="mt-4 grid gap-3 text-sm text-white/75"><Link href="/shipping">Shipping & delivery</Link><Link href="/returns">Returns & refunds</Link><Link href="/privacy">Privacy policy</Link><Link href="/terms">Terms & conditions</Link></div></div>
      <div><h2 className="font-bold">Say hello</h2><p className="mt-4 text-sm text-white/75">Kushtia,Khulna, Bangladesh<br />nayeembabu2k6@gmail.com<br />Sat–Thu, 10am–6pm</p><div className="mt-4 flex gap-3"><a aria-label="Instagram" href="https://instagram.com" className="rounded-full bg-white/10 p-2"><Instagram size={18} /></a><a aria-label="Facebook" href="https://facebook.com" className="rounded-full bg-white/10 p-2"><Facebook size={18} /></a></div></div>
    </div>
    <div className="border-t border-white/15"><div className="container flex flex-wrap justify-between gap-3 py-5 text-xs text-white/65"><span>© {new Date().getFullYear()} LittleJoy Toys. All rights reserved.</span><span>Cash on Delivery · Secure checkout</span></div></div>
  </footer>;
}
