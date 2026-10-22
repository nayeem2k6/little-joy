"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { api, messageOf } from "@/lib/api";

const adminLinks = [
  { label: "Overview", href: "/admin" },
  { label: "Products", href: "/admin/products" },
  { label: "Categories", href: "/admin/categories" },
  { label: "Orders", href: "/admin/orders" },
  { label: "Customers", href: "/admin/customers" },
  { label: "Coupons", href: "/admin/coupons" },
  { label: "Reviews", href: "/admin/reviews" }
];

interface CurrentUser { role: string }

export default function AdminLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const pathname = usePathname();
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [error, setError] = useState("");
  const [checking, setChecking] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    let active = true;
    api<{ user: CurrentUser }>("/auth/me")
      .then(({ user }) => {
        if (!active) return;
        if (user.role !== "admin") {
          router.replace("/account");
          return;
        }
        setAuthorized(true);
      })
      .catch((reason: unknown) => {
        if (!active) return;
        if (reason instanceof Error && "status" in reason && reason.status === 401) {
          router.replace(`/login?returnTo=${encodeURIComponent(pathname)}`);
          return;
        }
        setError(messageOf(reason));
      })
      .finally(() => { if (active) setChecking(false); });
    return () => { active = false; };
  }, [pathname, router]);

  async function logout() {
    setError("");
    setLoggingOut(true);
    try {
      await api("/auth/logout", { method: "POST" });
      router.replace("/login");
    } catch (reason) {
      setError(messageOf(reason));
    } finally {
      setLoggingOut(false);
    }
  }

  if (checking) {
    return <div className="container page-pad" role="status" aria-live="polite">Checking administrator access…</div>;
  }
  if (error && !authorized) {
    return <div className="container page-pad"><div className="card mx-auto max-w-xl p-7 text-center" role="alert">
      <h1 className="font-display text-2xl">Could not verify administrator access</h1>
      <p className="mt-2 text-gray-600">{error}</p>
      <button className="btn mt-5" onClick={() => window.location.reload()}>Try again</button>
    </div></div>;
  }
  if (!authorized) return null;

  return <div className="container grid min-h-[70vh] gap-5 py-5 lg:grid-cols-[220px_minmax(0,1fr)] lg:py-8">
    <aside className="h-fit rounded-2xl border border-emerald-950/10 bg-white p-3 shadow-soft lg:sticky lg:top-24">
      <div className="hidden px-3 pb-3 pt-2 lg:block">
        <p className="eyebrow">LittleJoy team</p>
        <h2 className="mt-1 font-display text-xl font-semibold text-forest">Store admin</h2>
      </div>
      <nav aria-label="Admin navigation" className="flex gap-1 overflow-x-auto lg:grid lg:overflow-visible">
        {adminLinks.map(({ label, href }) => {
          const current = pathname === href || (href !== "/admin" && pathname.startsWith(`${href}/`));
          return <Link
            key={href}
            href={href}
            aria-current={current ? "page" : undefined}
            className={`shrink-0 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors ${current ? "bg-mint text-forest" : "text-gray-600 hover:bg-cream hover:text-forest"}`}
          >{label}</Link>;
        })}
      </nav>
      <button
        type="button"
        onClick={logout}
        disabled={loggingOut}
        className="mt-3 w-full rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-gray-600 hover:bg-cream hover:text-forest disabled:opacity-60"
      >{loggingOut ? "Signing out…" : "Sign out"}</button>
      {error && <p className="mt-2 px-3 text-sm text-red-700" role="alert">{error}</p>}
    </aside>
    <div className="min-w-0">{children}</div>
  </div>;
}
