export const API_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api").replace(/\/$/, "");

export class ApiError extends Error {
  constructor(message: string, readonly status: number, readonly code?: string) {
    super(message);
    this.name = "ApiError";
  }
}

export async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    credentials: "include",
    headers: { "Content-Type": "application/json", ...options.headers }
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    const errorBody = body && typeof body === "object" ? body : {};
    const detail = errorBody.error;
    const message = errorBody.message || (typeof detail === "string" ? detail : detail?.message) || `Request failed (${response.status})`;
    const code = detail && typeof detail === "object" && "code" in detail ? String(detail.code) : undefined;
    throw new ApiError(String(message), response.status, code);
  }
  return (body && typeof body === "object" && "data" in body ? body.data : body) as T;
}

export function messageOf(error: unknown): string {
  return error instanceof Error ? error.message : "Something went wrong. Please try again.";
}

export const taka = (value: number) =>
  new Intl.NumberFormat("en-BD", { style: "currency", currency: "BDT", maximumFractionDigits: 0 }).format(value);
