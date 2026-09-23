import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Terms for using Production Assistant.",
};

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <p className="text-sm font-medium uppercase tracking-wide text-slate-500">
        Legal
      </p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">
        Terms of Service
      </h1>
      <p className="mt-3 text-sm text-slate-500">Last updated: September 23, 2026</p>

      <div className="mt-10 space-y-8 text-sm leading-7 text-slate-700">
        <section>
          <h2 className="text-base font-semibold text-slate-900">Service</h2>
          <p className="mt-2">
            Production Assistant helps SaaS founders and product creators turn a
            product idea into a ready-to-film short-video production blueprint.
            It does not generate finished videos or publish to social platforms.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-slate-900">Free use</h2>
          <p className="mt-2">
            The Free plan is limited to 3 production blueprints per day, measured
            in your browser. Limits may change. Paid plans are processed by
            Creem. This version does not include account-based entitlements.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-slate-900">Content</h2>
          <p className="mt-2">
            Generated production blueprints are drafts for you to review, edit,
            and film. You are responsible for the videos you publish, including
            claims, trademarks, and platform rules.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-slate-900">No guarantees</h2>
          <p className="mt-2">
            We do not guarantee views, followers, revenue, or ranking on TikTok,
            YouTube, or Instagram. The product is provided as-is for founder
            video production planning.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-slate-900">Payments</h2>
          <p className="mt-2">
            If you upgrade, payment is handled by Creem. Taxes, billing, and
            refunds follow Creem and the plan you select at checkout.
          </p>
        </section>
      </div>
    </div>
  );
}
