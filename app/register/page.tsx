"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { api, confirmAuthenticatedSession, messageOf } from "@/lib/api";
import { GoogleSignInButton } from "@/components/google-sign-in-button";
import { useToast } from "@/components/toast-provider";

const schema = z.object({
  name: z.string().trim().min(2, "Please enter your name."),
  email: z.string().trim().email("Enter a valid email address."),
  phone: z.string().trim().regex(/^(?:\+?8801|01)[3-9]\d{8}$/, "Enter a valid Bangladesh mobile number."),
  password: z.string().min(8, "Use at least 8 characters.")
});
type Values = z.infer<typeof schema>;
export default function RegisterPage() {
  const router = useRouter();
  const { show } = useToast();
  const [error, setError] = useState("");
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<Values>({ resolver: zodResolver(schema) });
  async function submit(values: Values) {
    setError("");
    try {
      await api("/auth/register", { method: "POST", body: JSON.stringify(values) });
      await confirmAuthenticatedSession();
      show("Your account was created successfully!");
      continueAfterSignIn();
    }
    catch (err) { setError(messageOf(err)); }
  }
  function continueAfterSignIn() {
    const returnTo = new URLSearchParams(window.location.search).get("returnTo");
    router.push(returnTo?.startsWith("/") && !returnTo.startsWith("//") ? returnTo : "/account");
  }
  async function signInWithGoogle(credential: string) {
    setError("");
    await api("/auth/google", { method: "POST", body: JSON.stringify({ credential }) });
    await confirmAuthenticatedSession();
    show("Login successful. Welcome!");
    continueAfterSignIn();
  }
  return <div className="container page-pad"><div className="card mx-auto max-w-lg p-6 sm:p-9"><p className="eyebrow">Join our little community</p><h1 className="section-title">Create an account</h1>
    <GoogleSignInButton onCredential={signInWithGoogle} onError={(err) => setError(messageOf(err))} />
    <p className="my-5 text-center text-sm text-gray-500">or create an account with email</p>
    <form onSubmit={handleSubmit(submit)} className="grid gap-4">
    <label className="field-label">Full name<input autoComplete="name" className="field" {...register("name")} />{errors.name && <span className="text-sm text-red-600">{errors.name.message}</span>}</label>
    <label className="field-label">Email<input type="email" autoComplete="email" className="field" {...register("email")} />{errors.email && <span className="text-sm text-red-600">{errors.email.message}</span>}</label>
    <label className="field-label">Mobile number<input type="tel" autoComplete="tel" placeholder="01XXXXXXXXX" className="field" {...register("phone")} />{errors.phone && <span className="text-sm text-red-600">{errors.phone.message}</span>}</label>
    <label className="field-label">Password<input type="password" autoComplete="new-password" className="field" {...register("password")} />{errors.password && <span className="text-sm text-red-600">{errors.password.message}</span>}</label>
    {error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}<button className="btn w-full" disabled={isSubmitting}>{isSubmitting ? "Creating account…" : "Create account"}</button></form>
    <p className="mt-5 text-center text-sm text-gray-600">Already have an account? <Link className="font-bold text-forest underline" href="/login">Sign in</Link></p></div></div>;
}
