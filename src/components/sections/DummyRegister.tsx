import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

const API_BASE = "http://localhost:3000";

type Role = "client" | "astrologer";

interface SessionUser {
  id: string;
  name: string;
  email: string;
  username: string;
  role: "Client" | "Astrologer" | "Admin";
}

interface DummyRegisterResponse {
  user: SessionUser;
  profile?: { id: string; slug: string } | null;
  accessToken: string;
  refreshToken: string;
}

interface Plan {
  id: string;
  name: string;
  badge?: string | null;
  pricePaise: number;
  currency: string;
  period?: string | null;
  description?: string | null;
  ctaLabel?: string | null;
}

interface PlanPurchase {
  id: string;
  status: string;
  pricePaise: number;
  currency: string;
}

interface CompletedPayment {
  id: string;
  amountPaise: number;
  currency: string;
  status: string;
  provider?: string;
  purpose?: string;
}

interface PlanPurchaseResult {
  purchase: PlanPurchase;
  payment: CompletedPayment | null;
}

interface PaymentOutcome {
  payment: CompletedPayment;
  planPurchase?: PlanPurchase | null;
}

interface InitiatePaymentResult {
  mode: "mock" | "gateway";
  redirectUrl: string | null;
  payment: CompletedPayment;
}

class ApiFailure extends Error {
  status: number;
  data: unknown;

  constructor(status: number, message: string, data: unknown) {
    super(message);
    this.name = "ApiFailure";
    this.status = status;
    this.data = data;
  }
}

async function api<T>(
  path: string,
  options: { method?: "GET" | "POST"; body?: unknown; headers?: Record<string, string> } = {},
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers ?? {}),
  };
  const token = localStorage.getItem("accessToken");
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, {
    method: options.method ?? "GET",
    headers,
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  });

  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const message =
      data && typeof data === "object" && "error" in data && typeof data.error === "string"
        ? data.error
        : `Request failed (${res.status})`;
    throw new ApiFailure(res.status, message, data);
  }
  return data as T;
}

function formatInr(paise: number): string {
  return (paise / 100).toLocaleString("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  });
}

function errorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  return "Something went wrong";
}

function fieldError(err: unknown, field: string): string | null {
  if (!(err instanceof ApiFailure)) return null;
  const details = (err.data as { details?: Record<string, string[]> } | null)?.details;
  return details?.[field]?.[0] ?? null;
}

function storedUser(): SessionUser | null {
  try {
    const raw = localStorage.getItem("user");
    return raw ? (JSON.parse(raw) as SessionUser) : null;
  } catch {
    return null;
  }
}

export default function DummyRegisterPage() {
  const [searchParams] = useSearchParams();
  const paymentId = searchParams.get("paymentId");
  const planIdParam = searchParams.get("planId");
  const returnedStatus = searchParams.get("status");

  const [sessionUser, setSessionUser] = useState<SessionUser | null>(() => storedUser());

  const [role, setRole] = useState<Role>("client");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [profileImageUrl, setProfileImageUrl] = useState("");
  const [selectedPlanId, setSelectedPlanId] = useState("");
  const [submitError, setSubmitError] = useState<unknown>(null);
  const [submitting, setSubmitting] = useState(false);

  const [plans, setPlans] = useState<Plan[]>([]);
  const [plansError, setPlansError] = useState<string | null>(null);
  const [plansLoading, setPlansLoading] = useState(true);

  const [busyPlanId, setBusyPlanId] = useState<string | null>(null);
  const [payment, setPayment] = useState<PaymentOutcome | null>(null);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    api<{ plans: Plan[] }>("/plans")
      .then((data) => {
        if (!cancelled) setPlans(data.plans);
      })
      .catch((err: unknown) => {
        if (!cancelled) setPlansError(errorMessage(err));
      })
      .finally(() => {
        if (!cancelled) setPlansLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!planIdParam) return;
    if (plans.some((plan) => plan.id === planIdParam)) {
      setSelectedPlanId(planIdParam);
    }
  }, [planIdParam, plans]);

  useEffect(() => {
    if (!paymentId) return;
    let cancelled = false;

    const load = async () => {
      if (!localStorage.getItem("accessToken")) return;
      try {
        const outcome = await api<PaymentOutcome>(`/payments/${paymentId}`);
        if (!cancelled) {
          setPayment(outcome);
          setPaymentError(null);
        }
      } catch (err) {
        if (!cancelled) setPaymentError(errorMessage(err));
      }
    };

    void load();
    const timer = window.setInterval(() => {
      void load();
    }, 3000);

    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [paymentId]);

  const fillTestValues = () => {
    const suffix = Date.now().toString(36);
    setRole("astrologer");
    setName("Dummy Tester");
    setEmail(`dummy-${suffix}@example.com`);
    setMobile("+919876543210");
    setUsername(`dummy_${suffix}`);
    setPassword("DummyPass1");
    setProfileImageUrl("");
  };

  const checkout = async (plan: Plan) => {
    setBusyPlanId(plan.id);
    setPayment(null);
    setPaymentError(null);
    try {
      const result = await api<PlanPurchaseResult>(`/plans/${plan.id}/purchase`, {
        method: "POST",
        headers: { "Idempotency-Key": crypto.randomUUID() },
      });

      if (!result.payment) {
        toast.success("Plan activated without payment");
        return;
      }

      const initiated = await api<InitiatePaymentResult>(
        `/payments/${result.payment.id}/initiate`,
        {
          method: "POST",
          body: { returnTo: `${window.location.origin}/dummy_register` },
        },
      );

      if (initiated.mode === "gateway" && initiated.redirectUrl) {
        window.location.assign(initiated.redirectUrl);
        return;
      }

      const completed = await api<PaymentOutcome>(
        `/payments/${result.payment.id}/complete`,
        { method: "POST" },
      );
      setPayment(completed);
      toast.success("Mock payment completed");
    } catch (err) {
      const message = errorMessage(err);
      setPaymentError(message);
      toast.error(message);
    } finally {
      setBusyPlanId(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError(null);
    try {
      const data = await api<DummyRegisterResponse>("/dummy_register", {
        method: "POST",
        body: {
          name,
          email,
          mobile: mobile.trim() || undefined,
          username,
          password,
          profileImageUrl: profileImageUrl.trim() || undefined,
          role,
        },
      });

      localStorage.setItem("accessToken", data.accessToken);
      localStorage.setItem("refreshToken", data.refreshToken);
      localStorage.setItem("user", JSON.stringify(data.user));
      setSessionUser(data.user);

      toast.success("Dummy account created");

      const selectedPlan = plans.find((plan) => plan.id === selectedPlanId);
      if (selectedPlan) await checkout(selectedPlan);
    } catch (err) {
      setSubmitError(err);
      toast.error(errorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const canCheckout = Boolean(sessionUser) || Boolean(localStorage.getItem("accessToken"));

  return (
    <div className="min-h-screen bg-muted/40 px-4 py-10">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold">Dummy Register</h1>
            <p className="text-sm text-muted-foreground">
              Dev-only signup and plan checkout harness for redirect and PhonePe testing.
            </p>
          </div>
          <div className="flex gap-2">
            {/*{sessionUser && (
              <Button asChild variant="outline">
                <a href="/dashboard">Dashboard</a>
              </Button>
            )}*/}
            <Button asChild variant="outline">
              <Link to="/signin">Sign In</Link>
            </Button>
          </div>
        </div>

        {(paymentId || returnedStatus) && (
          <Card>
            <CardHeader>
              <CardTitle>Payment return</CardTitle>
              <CardDescription>
                {paymentId ? `Payment ${paymentId}` : "No payment id in the URL"}
                {returnedStatus ? ` · gateway status: ${returnedStatus}` : ""}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              {paymentError && <p className="text-destructive">{paymentError}</p>}
              {!payment && !paymentError && (
                <p className="text-muted-foreground">Loading outcome…</p>
              )}
              {payment && (
                <>
                  <p>
                    Payment status: <Badge>{payment.payment.status}</Badge>
                  </p>
                  <p>Amount: {formatInr(payment.payment.amountPaise)}</p>
                  <p>Provider: {payment.payment.provider ?? "unknown"}</p>
                  {payment.planPurchase && (
                    <p>
                      Plan purchase status: <Badge>{payment.planPurchase.status}</Badge>
                    </p>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        )}

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <Card>
            <CardHeader>
              <CardTitle>Create test account</CardTitle>
              <CardDescription>
                Uses POST /dummy_register. Every signup field is available here.
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
                <div className="flex justify-end">
                  <Button type="button" variant="outline" size="sm" onClick={fillTestValues}>
                    Fill test values
                  </Button>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dummy-role">Role</Label>
                  <select
                    id="dummy-role"
                    value={role}
                    onChange={(e) => setRole(e.target.value as Role)}
                    className="border-input h-9 w-full rounded-md border bg-transparent px-3 text-sm"
                  >
                    <option value="client">Client</option>
                    <option value="astrologer">Astrologer</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dummy-name">Full Name</Label>
                  <Input
                    id="dummy-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Dummy Tester"
                    required
                  />
                  {fieldError(submitError, "name") && (
                    <p className="text-xs text-destructive">{fieldError(submitError, "name")}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dummy-email">Email</Label>
                  <Input
                    id="dummy-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="dummy@example.com"
                    required
                  />
                  {fieldError(submitError, "email") && (
                    <p className="text-xs text-destructive">{fieldError(submitError, "email")}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dummy-mobile">Mobile (optional)</Label>
                  <Input
                    id="dummy-mobile"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    placeholder="+919876543210"
                  />
                  {fieldError(submitError, "mobile") && (
                    <p className="text-xs text-destructive">{fieldError(submitError, "mobile")}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dummy-username">Username</Label>
                  <Input
                    id="dummy-username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="dummy_user"
                    required
                  />
                  {fieldError(submitError, "username") && (
                    <p className="text-xs text-destructive">
                      {fieldError(submitError, "username")}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dummy-password">Password</Label>
                  <PasswordInput
                    id="dummy-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min 8 chars, 1 uppercase, 1 number"
                    required
                    minLength={8}
                  />
                  {fieldError(submitError, "password") && (
                    <p className="text-xs text-destructive">
                      {fieldError(submitError, "password")}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dummy-image">Profile image URL (optional)</Label>
                  <Input
                    id="dummy-image"
                    type="url"
                    value={profileImageUrl}
                    onChange={(e) => setProfileImageUrl(e.target.value)}
                    placeholder="https://example.com/avatar.png"
                  />
                  {fieldError(submitError, "profileImageUrl") && (
                    <p className="text-xs text-destructive">
                      {fieldError(submitError, "profileImageUrl")}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dummy-plan">Plan to buy after signup (optional)</Label>
                  <select
                    id="dummy-plan"
                    value={selectedPlanId}
                    onChange={(e) => setSelectedPlanId(e.target.value)}
                    className="border-input h-9 w-full rounded-md border bg-transparent px-3 text-sm"
                    disabled={plansLoading || plans.length === 0}
                  >
                    <option value="">Register only</option>
                    {plans.map((plan) => (
                      <option key={plan.id} value={plan.id}>
                        {plan.name} · {formatInr(plan.pricePaise)}
                      </option>
                    ))}
                  </select>
                  {plansError && <p className="text-xs text-destructive">{plansError}</p>}
                </div>

                {submitError && !fieldError(submitError, "name") ? (
                  <p className="text-sm text-destructive">{errorMessage(submitError)}</p>
                ) : null}
              </CardContent>
              <CardFooter className="mt-2">
                <Button type="submit" className="w-full" disabled={submitting}>
                  {submitting ? "Creating account…" : "Create dummy account"}
                </Button>
              </CardFooter>
            </form>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Plans</CardTitle>
              <CardDescription>
                Buy a plan as the current test user. Gateway mode redirects to PhonePe; otherwise the
                mock payment is completed locally.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {plansLoading && <p className="text-sm text-muted-foreground">Loading plans…</p>}
              {plansError && <p className="text-sm text-destructive">{plansError}</p>}
              {!plansLoading && !plansError && plans.length === 0 && (
                <p className="text-sm text-muted-foreground">No plans configured.</p>
              )}
              {plans.map((plan) => (
                <div key={plan.id} className="rounded-lg border p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium">{plan.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatInr(plan.pricePaise)}
                        {plan.period ? ` · ${plan.period}` : ""}
                      </p>
                    </div>
                    {plan.badge && <Badge variant="secondary">{plan.badge}</Badge>}
                  </div>
                  <Button
                    className="mt-4 w-full"
                    onClick={() => void checkout(plan)}
                    disabled={!canCheckout || busyPlanId !== null}
                  >
                    {busyPlanId === plan.id ? "Starting checkout…" : plan.ctaLabel || "Buy plan"}
                  </Button>
                </div>
              ))}
              {!canCheckout && (
                <p className="text-sm text-muted-foreground">
                  Register a dummy account first, or sign in, to enable checkout.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
