import { useCallback, useEffect, useState } from "react";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Button, ButtonLink } from "@/components/ui/BrandButton";
import { Heading, Text } from "@/components/ui/Typography";
import { fetchPlans, formatAmount, REGISTER_URL, type Plan } from "@/lib/plans-api";

export function AvailablePlans() {
  const [plans, setPlans] = useState<Plan[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  const loadPlans = useCallback(async () => {
    setLoadError(null);
    try {
      setPlans(await fetchPlans());
    } catch (err) {
      setPlans([]);
      setLoadError(err instanceof Error ? err.message : "We could not load the plans right now.");
    }
  }, []);

  useEffect(() => {
    void loadPlans();
  }, [loadPlans]);

  return (
    <Section id="available-plans" tone="cream" padding="lg">
      <Container>
        <Heading size="h2" align="center" className="mx-auto">
          Available Plans
        </Heading>
        <Text size="lead" align="center" className="mx-auto mt-6 max-w-2xl">
          Live plans and pricing set by our team. Choose a plan below to get started.
        </Text>

        {plans === null ? (
          <div className="mt-14 grid gap-8 md:grid-cols-2">
            {[0, 1].map((index) => (
              <div
                key={index}
                className="h-[34rem] animate-pulse rounded-card border border-brand-ink/10 bg-background/70"
              />
            ))}
          </div>
        ) : loadError ? (
          <div className="mt-14 rounded-card border border-brand-ink/10 bg-background px-6 py-10 text-center">
            <Text size="body" tone="muted">
              {loadError}
            </Text>
            <Button className="mt-5" onClick={() => void loadPlans()}>
              Try Again
            </Button>
          </div>
        ) : plans.length === 0 ? (
          <div className="mt-14 rounded-card border border-brand-ink/10 bg-background px-6 py-10 text-center">
            <Text size="body" tone="muted">
              No plans are available right now. Please check back soon.
            </Text>
          </div>
        ) : (
          <div className="mt-14 grid min-w-0 gap-8 md:grid-cols-2">
            {plans.map((plan) => (
              <PlanCard key={plan.id} plan={plan} />
            ))}
          </div>
        )}
      </Container>
    </Section>
  );
}

function PlanCard({ plan }: { plan: Plan }) {
  const features = Array.isArray(plan.features) ? plan.features : [];
  const highlights = Array.isArray(plan.highlights) ? plan.highlights : [];
  const ctaLabel = plan.ctaLabel?.trim() || `Buy ${plan.name}`;
  const currencySymbol = plan.currency === "INR" ? "\u20B9" : plan.currency;

  return (
    <div className="relative min-w-0 pt-5">
      {plan.badge?.trim() ? (
        <span className="absolute right-6 top-0 z-10 bg-brand-yellow px-3 py-1 font-body text-[0.8125rem] text-brand-ink">
          {plan.badge}
        </span>
      ) : null}

      <div className="rounded-card bg-brand-ink px-7 py-9 text-primary-foreground sm:px-8">
        <Text size="lead" tone="light" className="text-[1.15rem]">
          {plan.name}
        </Text>

        <div className="mt-3 flex items-center justify-between gap-5">
          <div className="shrink-0">
            <div className="flex items-start gap-1">
              <span className="font-body text-[1.125rem] leading-tight">{currencySymbol}</span>
              <span className="font-body leading-[0.95]" style={{ fontSize: 70, lineHeight: 0.95 }}>
                {formatAmount(plan.pricePaise)}
              </span>
            </div>
            {plan.period?.trim() ? (
              <Text tone="light" className="mt-1 text-[0.75rem]">
                {plan.period}
              </Text>
            ) : null}
          </div>

          {highlights.length > 0 ? (
            <div className="min-w-0 flex-1 rounded-md border border-white/10 bg-white/[0.04] px-4 py-3">
              <div className="space-y-2">
                {highlights.map((item) => (
                  <div key={item} className="flex items-start gap-2">
                    <span className="mt-0.5 shrink-0 text-sm text-brand-yellow">✓</span>
                    <Text tone="light" size="small" className="leading-snug">
                      {item}
                    </Text>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>

        {plan.description?.trim() ? (
          <Text tone="light" className="mt-5">
            {plan.description}
          </Text>
        ) : null}

        {features.length > 0 ? (
          <div className="mt-7 space-y-3">
            {features.map((feature) => (
              <div key={feature} className="flex items-start gap-2">
                <span className="mt-0.5 shrink-0 text-brand-yellow">✓</span>
                <Text tone="light" size="small" className="leading-snug">
                  {feature}
                </Text>
              </div>
            ))}
          </div>
        ) : null}

        {plan.validity?.trim() ? (
          <Text tone="light" className="mt-7">
            {plan.validity}
          </Text>
        ) : null}

        <ButtonLink href={REGISTER_URL} variant="light" fullWidth className="mt-6">
          {ctaLabel}
        </ButtonLink>
      </div>
    </div>
  );
}
