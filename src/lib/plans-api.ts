const configuredBase = import.meta.env.VITE_API_BASE_URL;
const configuredFrontend = import.meta.env.VITE_FRONTEND_URL;

export const API_BASE = (
  typeof configuredBase === "string" && configuredBase.trim()
    ? configuredBase
    : "http://localhost:3000"
).replace(/\/+$/, "");

export const FRONTEND_BASE = (
  typeof configuredFrontend === "string" && configuredFrontend.trim()
    ? configuredFrontend
    : "http://localhost:3001"
).replace(/\/+$/, "");

export const REGISTER_URL = `${FRONTEND_BASE}/register`;

export interface Plan {
  id: string;
  name: string;
  badge: string | null;
  pricePaise: number;
  currency: string;
  period: string | null;
  description: string | null;
  features: string[];
  highlights: string[];
  validity: string | null;
  ctaLabel: string | null;
  createdAt: string;
  updatedAt: string;
}

export async function fetchPlans(): Promise<Plan[]> {
  const res = await fetch(`${API_BASE}/plans`, {
    headers: { Accept: "application/json" },
  });
  const text = await res.text();
  let data: unknown = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = null;
    }
  }

  if (!res.ok) {
    const message =
      data &&
      typeof data === "object" &&
      "error" in data &&
      typeof (data as { error: unknown }).error === "string"
        ? (data as { error: string }).error
        : `Could not load plans (${res.status})`;
    throw new Error(message);
  }

  if (!data || typeof data !== "object" || !("plans" in data)) {
    throw new Error("Unexpected response while loading plans");
  }

  return (data as { plans: Plan[] }).plans;
}

export function formatAmount(paise: number): string {
  const amount = paise / 100;
  return amount.toLocaleString("en-IN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: amount % 1 === 0 ? 0 : 2,
  });
}

export function formatPaise(paise: number): string {
  return `\u20B9${formatAmount(paise)}`;
}
