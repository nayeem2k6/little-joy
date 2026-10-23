import { LoaderCircle } from "lucide-react";

export function LoadingSpinner({ label = "Loading...", className = "", compact = false }: { label?: string; className?: string; compact?: boolean }) {
  const layout = compact
    ? "inline-flex min-h-12 flex-row items-center gap-2 py-0"
    : "flex min-h-40 flex-col items-center justify-center gap-3 py-8";
  return <span role="status" aria-live="polite" className={`${layout} text-sm font-semibold text-forest ${className}`}>
    <LoaderCircle size={30} className="animate-spin" aria-hidden="true" />
    <span>{label}</span>
  </span>;
}
