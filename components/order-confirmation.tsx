"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CheckCircle2, PackageCheck } from "lucide-react";
import { taka } from "@/lib/api";

interface OrderSummary { orderNumber?: string; total?: number; subtotal?: number; deliveryFee?: number; discount?: number }
export function OrderConfirmation({ orderNumber }: { orderNumber: string }) {
  const [summary, setSummary] = useState<OrderSummary | null>(null);
  useEffect(() => {
    try {
      const stored = sessionStorage.getItem("littlejoy-last-order");
      if (stored) {
        const parsed = JSON.parse(stored) as OrderSummary;
        if (!orderNumber || parsed.orderNumber === orderNumber) setSummary(parsed);
        sessionStorage.removeItem("littlejoy-last-order");
      }
    } catch (error) {
      console.error("Could not load the order confirmation summary", error);
    }
  }, [orderNumber]);
  return <div className="container page-pad"><div className="mx-auto max-w-2xl rounded-[28px] bg-cream p-7 text-center sm:p-12">
    <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-lime text-forest"><CheckCircle2 size={34} /></div>
    <p className="eyebrow mt-6">A new adventure is on its way</p><h1 className="section-title mt-2">Thank you for your order!</h1>
    {orderNumber && <p className="mt-4 text-gray-600">Your order number is <strong className="text-forest">{orderNumber}</strong>.</p>}
    {summary?.total !== undefined && <div className="mx-auto mt-4 max-w-sm rounded-xl bg-white p-4 text-sm"><div className="flex justify-between"><span>Items subtotal</span><span>{taka(summary.subtotal || 0)}</span></div>{Boolean(summary.discount) && <div className="mt-2 flex justify-between text-forest"><span>Coupon savings</span><span>−{taka(summary.discount || 0)}</span></div>}<div className="mt-2 flex justify-between"><span>Delivery fee</span><span>{taka(summary.deliveryFee || 0)}</span></div><div className="mt-3 flex justify-between border-t pt-3 font-bold"><span>Confirmed total</span><span className="text-forest">{taka(summary.total)}</span></div></div>}
    <div className="mx-auto mt-6 flex max-w-md items-start gap-3 rounded-xl bg-white p-4 text-left text-sm leading-6"><PackageCheck className="mt-1 shrink-0 text-forest" /><p>We’ll prepare your order and collect payment when it arrives. Keep your phone nearby for delivery updates.</p></div>
    <div className="mt-7 flex flex-wrap justify-center gap-3"><Link href="/account" className="btn">Track my orders</Link><Link href="/shop" className="btn btn-light border border-forest/10">Back to the toy box</Link></div>
  </div></div>;
}
