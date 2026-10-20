"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import { api, messageOf, taka } from "@/lib/api";
import { useStore } from "@/components/store-provider";

const schema = z.object({
  name: z.string().trim().min(2, "Please enter your name."),
  phone: z.string().trim().regex(/^(?:\+?8801|01)[3-9]\d{8}$/, "Enter a valid Bangladesh mobile number."),
  email: z.string().trim().email("Enter a valid email address.").optional().or(z.literal("")),
  address: z.string().trim().min(8, "Please enter your full delivery address."),
  addressLine2: z.string().trim().max(200).optional(),
  district: z.string().trim().min(2, "Please enter your district."),
  postalCode: z.string().trim().min(2, "Please enter your postal code."),
  terms: z.literal(true, { errorMap: () => ({ message: "Please accept the terms to place your order." }) })
});
type FormData = z.infer<typeof schema>;
interface AccountUser { name: string; email: string }

export default function CheckoutPage() {
  const router = useRouter();
  const { items, clear } = useStore();
  const [account, setAccount] = useState<AccountUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [couponCode, setCouponCode] = useState("");
  const [submitError, setSubmitError] = useState("");
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormData>({ resolver: zodResolver(schema) });
  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  useEffect(() => {
    api<{ user: AccountUser }>("/auth/me")
      .then(response => { setAccount(response.user); reset({ name: response.user.name, email: response.user.email }); })
      .catch(() => setAccount(null))
      .finally(() => setAuthLoading(false));
  }, [reset]);
  async function submit(values: FormData) {
    setSubmitError("");
    if (!items.length) { setSubmitError("Your bag is empty."); return; }
    try {
      const result = await api<{
        order?: { orderNumber?: string; total?: number; subtotal?: number; deliveryFee?: number; coupon?: { discount?: number } };
        orderNumber?: string;
        total?: number;
        subtotal?: number;
        deliveryFee?: number;
        coupon?: { discount?: number };
      }>("/orders", {
        method: "POST",
        body: JSON.stringify({
          items: items.map(({ product, quantity }) => ({ productId: product._id || product.id, quantity })),
          shippingAddress: {
            fullName: values.name,
            phone: values.phone,
            addressLine1: values.address,
            addressLine2: values.addressLine2 || "",
            city: values.district,
            postalCode: values.postalCode,
            country: "Bangladesh"
          },
          couponCode: couponCode.trim() || undefined
        })
      });
      const order = result.order || result;
      const orderNumber = order.orderNumber || result.orderNumber;
      try {
        sessionStorage.setItem("littlejoy-last-order", JSON.stringify({ orderNumber, total: order.total, subtotal: order.subtotal, deliveryFee: order.deliveryFee, discount: order.coupon?.discount || 0 }));
      } catch (storageError) {
        console.error("Could not save the order summary for this browser", storageError);
      }
      clear();
      router.push(`/order-confirmation${orderNumber ? `?order=${encodeURIComponent(orderNumber)}` : ""}`);
    } catch (error) { setSubmitError(messageOf(error)); }
  }
  if (!items.length) return <div className="container page-pad text-center"><h1 className="section-title">Your bag is empty</h1><Link className="btn mt-4" href="/shop">Browse toys</Link></div>;
  if (authLoading) return <div className="container page-pad"><div className="h-48 animate-pulse rounded-3xl bg-cream" /></div>;
  if (!account) return   <div className="container page-pad"><div className="card mx-auto max-w-xl p-7 text-center"><p className="eyebrow">Secure checkout</p><h1 className="section-title mt-2">Sign in before checkout</h1><p className="mt-3 text-gray-600">Your bag will be saved while you sign in or create an account. We need an account to securely link and track your order.</p><div className="mt-6 flex flex-wrap justify-center gap-3"><Link href="/login?returnTo=%2Fcheckout" className="btn">Sign in</Link><Link href="/register?returnTo=%2Fcheckout" className="btn btn-light border border-forest/10">Create account</Link></div></div></div>;
  return <div className="container page-pad"><p className="eyebrow">A few details and then it’s playtime</p><h1 className="section-title">Checkout</h1>
    <form onSubmit={handleSubmit(submit)} className="mt-7 grid gap-7 lg:grid-cols-[1.3fr_.7fr]">
      <div className="card grid gap-5 p-5 sm:grid-cols-2 sm:p-7">
        <h2 className="font-display text-2xl sm:col-span-2">Where should we deliver?</h2>
        <label className="field-label sm:col-span-2">Full name<input autoComplete="name" className="field" {...register("name")} />{errors.name && <span className="text-sm text-red-600">{errors.name.message}</span>}</label>
        <label className="field-label">Mobile number<input type="tel" autoComplete="tel" placeholder="01XXXXXXXXX" className="field" {...register("phone")} />{errors.phone && <span className="text-sm text-red-600">{errors.phone.message}</span>}</label>
        <label className="field-label">Email<input type="email" autoComplete="email" className="field" readOnly {...register("email")} />{errors.email && <span className="text-sm text-red-600">{errors.email.message}</span>}</label>
        <label className="field-label sm:col-span-2">Address line 1<textarea rows={3} autoComplete="street-address" className="field" placeholder="House, road, area" {...register("address")} />{errors.address && <span className="text-sm text-red-600">{errors.address.message}</span>}</label>
        <label className="field-label sm:col-span-2">Address line 2 (optional)<input className="field" {...register("addressLine2")} /></label>
        <label className="field-label">District / city<input autoComplete="address-level1" className="field" {...register("district")} />{errors.district && <span className="text-sm text-red-600">{errors.district.message}</span>}</label>
        <label className="field-label">Postal code<input autoComplete="postal-code" className="field" {...register("postalCode")} />{errors.postalCode && <span className="text-sm text-red-600">{errors.postalCode.message}</span>}</label>
        <label className="field-label sm:col-span-2">Coupon code (optional)<input className="field uppercase" autoComplete="off" value={couponCode} onChange={event => setCouponCode(event.target.value)} /></label>
        <div className="rounded-xl bg-mint p-4 text-sm leading-6 text-forest sm:col-span-2"><strong>Cash on Delivery</strong><br />Pay the delivery person when your toys arrive. We never ask for card details.</div>
        <label className="flex items-start gap-3 text-sm leading-6 sm:col-span-2"><input type="checkbox" className="mt-1 accent-forest" {...register("terms")} /><span>I agree to the <Link className="font-bold text-forest underline" href="/terms">Terms & Conditions</Link> and <Link className="font-bold text-forest underline" href="/returns">Return Policy</Link>.</span></label>
        {errors.terms && <p className="text-sm text-red-600 sm:col-span-2">{errors.terms.message}</p>}
        {submitError && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700 sm:col-span-2">{submitError}</p>}
        <button type="submit" disabled={isSubmitting} className="btn w-full disabled:opacity-60 sm:col-span-2">{isSubmitting ? "Placing your order…" : "Place COD order"}</button>
      </div>
      <aside className="card h-fit p-5 sm:p-6"><h2 className="font-display text-2xl">Your order</h2><div className="mt-4 grid gap-3">{items.map(({ product, quantity }) => <div key={product._id || product.slug} className="flex justify-between gap-3 text-sm"><span className="text-gray-600">{product.name} × {quantity}</span><span>{taka(product.price * quantity)}</span></div>)}</div><div className="my-4 border-t" /><div className="flex justify-between font-bold"><span>Subtotal</span><span>{taka(subtotal)}</span></div>      <p className="mt-2 text-xs text-gray-500">Delivery fees, coupons, final prices and stock are validated by the server before your order is confirmed.</p></aside>
    </form>
  </div>;
}
