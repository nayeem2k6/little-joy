"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { api, messageOf } from "@/lib/api";

const schema = z.object({ email: z.string().trim().email("Enter a valid email address."), password: z.string().min(8, "Password must be at least 8 characters.") });
type Values = z.infer<typeof schema>;
export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<Values>({ resolver: zodResolver(schema) });
  async function submit(values: Values) {
    setError("");
    try {
      await api("/auth/login", { method: "POST", body: JSON.stringify(values) });
      const returnTo = new URLSearchParams(window.location.search).get("returnTo");
      router.push(returnTo?.startsWith("/") && !returnTo.startsWith("//") ? returnTo : "/account");
    }
    catch (err) { setError(messageOf(err)); }
  }
  return <div className="container page-pad"><div className="card mx-auto max-w-lg p-6 sm:p-9"><p className="eyebrow">Hello again</p><h1 className="section-title">Welcome back</h1><p className="mb-6 text-gray-600">Sign in to see your orders and keep the fun going.</p>
    <form onSubmit={handleSubmit(submit)} className="grid gap-4"><label className="field-label">Email<input type="email" autoComplete="email" className="field" {...register("email")} />{errors.email && <span className="text-sm text-red-600">{errors.email.message}</span>}</label><label className="field-label">Password<input type="password" autoComplete="current-password" className="field" {...register("password")} />{errors.password && <span className="text-sm text-red-600">{errors.password.message}</span>}</label>
      {error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}<button className="btn w-full" disabled={isSubmitting}>{isSubmitting ? "Signing in…" : "Sign in"}</button>
    </form><p className="mt-5 text-center text-sm text-gray-600">New to LittleJoy? <Link className="font-bold text-forest underline" href="/register">Create an account</Link></p>
  </div></div>;
}
