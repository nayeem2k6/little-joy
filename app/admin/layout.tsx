"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Boxes, ClipboardList, LayoutDashboard, LogOut, MessageSquareText, Package, Tags, Users } from "lucide-react";
import { api, messageOf } from "@/lib/api";
import { LoadingSpinner } from "@/components/loading-spinner";
import { useToast } from "@/components/toast-provider";

const adminLinks = [
  { label: "Overview", href: "/admin", icon: LayoutDashboard },
  { label: "Products", href: "/admin/products", icon: Package },
  { label: "Categories", href: "/admin/categories", icon: Boxes },
  { label: "Orders", href: "/admin/orders", icon: ClipboardList },
  { label: "Customers", href: "/admin/customers", icon: Users },
  { label: "Coupons", href: "/admin/coupons", icon: Tags },
  { label: "Reviews", href: "/admin/reviews", icon: MessageSquareText }
];

interface CurrentUser { role: string }

export default function AdminLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const pathname = usePathname();
  const router = useRouter();
  const { show } = useToast();
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
      show("You have signed out successfully.");
      router.replace("/login");
    } catch (reason) {
      setError(messageOf(reason));
    } finally {
      setLoggingOut(false);
    }
  }

  if (checking) {
    return <div className="container page-pad"><LoadingSpinner label="Checking administrator access..." /></div>;
  }
  if (error && !authorized) {
    return <div className="container page-pad"><div className="card mx-auto max-w-xl p-7 text-center" role="alert">
      <h1 className="font-display text-2xl">Could not verify administrator access</h1>
      <p className="mt-2 text-gray-600">{error}</p>
      <button className="btn mt-5" onClick={() => window.location.reload()}>Try again</button>
    </div></div>;
  }
  if (!authorized) return null;

  return <div className="container grid min-h-[70vh] grid-cols-1 gap-4 py-4 sm:gap-5 sm:py-6 lg:grid-cols-[232px_minmax(0,1fr)] lg:gap-7 lg:py-8">
    <aside className="h-fit min-w-0 rounded-2xl border border-emerald-950/10 bg-white p-3 shadow-soft lg:sticky lg:top-24">
      <div className="flex items-center gap-3 px-2 pb-3 pt-1 lg:px-3 lg:pb-4 lg:pt-2">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-lime font-display text-xl font-semibold text-forest">L</span>
        <div>
          <p className="text-xs font-bold uppercase tracking-[.13em] text-emerald-800">LittleJoy team</p>
          <h2 className="font-display text-lg font-semibold leading-tight text-forest">Store admin</h2>
        </div>
      </div>
      <nav aria-label="Admin navigation" className="admin-nav flex gap-1 overflow-x-auto pb-1 lg:grid lg:overflow-visible lg:pb-0">
        {adminLinks.map(({ label, href, icon: Icon }) => {
          const current = pathname === href || (href !== "/admin" && pathname.startsWith(`${href}/`));
          return <Link
            key={href}
            href={href}
            aria-current={current ? "page" : undefined}
            className={`flex shrink-0 items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors lg:shrink ${current ? "bg-mint text-forest" : "text-gray-600 hover:bg-cream hover:text-forest"}`}
          ><Icon size={17} aria-hidden="true" />{label}</Link>;
        })}
      </nav>
      <button
        type="button"
        onClick={logout}
        disabled={loggingOut}
        className="mt-2 flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-gray-600 transition-colors hover:bg-cream hover:text-forest disabled:opacity-60"
      ><LogOut size={17} aria-hidden="true" />{loggingOut ? "Signing out…" : "Sign out"}</button>
      {error && <p className="mt-2 px-3 text-sm text-red-700" role="alert">{error}</p>}
    </aside>
    <div className="min-w-0">{children}</div>
  </div>;
}
