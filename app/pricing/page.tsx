import type { Metadata } from "next";
import Link from "next/link";
import { TrackPageEvent } from "@/components/TrackPageEvent";
import { UpgradeButton } from "@/components/UpgradeButton";
import { plans } from "@/lib/plans";

export const metadata: Metadata = {
  title: "Pricing",
  description: "Simple pricing for SaaS founders who need a short-video content workflow.",
};

export default function PricingPage() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <TrackPageEvent event="pricing_view" />
      <p className="text-sm font-medium uppercase tracking-wide text-slate-500">
        Pricing
      </p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">
        Start free. Upgrade when you publish more.
      </h1>
      <p className="mt-3 max-w-2xl text-slate-600 leading-7">
        Get a ready-to-film content package from one product idea. No marketing
        team required.
      </p>

      <div className="mt-12 grid gap-6 lg:grid-cols-3">
        {plans.map((plan) => (
          <article
            key={plan.id}
            className={`flex flex-col rounded-2xl border bg-white p-6 ${
              plan.id === "creator"
                ? "border-slate-900"
                : "border-slate-200"
            }`}
          >
            <h2 className="text-lg font-semibold text-slate-900">{plan.name}</h2>
            <p className="mt-1 text-sm text-slate-500">{plan.description}</p>
            <p className="mt-6 text-4xl font-semibold tracking-tight text-slate-900">
              {plan.price}
              {plan.period ? (
                <span className="text-base font-medium text-slate-500">
                  {plan.period}
                </span>
              ) : null}
            </p>
            <ul className="mt-6 space-y-3 text-sm leading-6 text-slate-600">
              {plan.features.map((feature) => (
                <li key={feature} className="flex gap-2">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-400" />
                  {feature}
                </li>
              ))}
            </ul>
            <div className="mt-8">
              {plan.id === "creator" || plan.id === "pro" ? (
                <UpgradeButton plan={plan.id} />
              ) : (
                <Link
                  href="/generate"
                  className="inline-flex h-11 w-full items-center justify-center rounded-lg border border-slate-200 px-4 text-sm font-medium text-slate-900 transition-colors hover:border-slate-300"
                >
                  Get started
                </Link>
              )}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
