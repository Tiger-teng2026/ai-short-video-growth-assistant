import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How Growth Assistant collects, uses, and stores information.",
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <p className="text-sm font-medium uppercase tracking-wide text-slate-500">
        Legal
      </p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">
        Privacy Policy
      </h1>
      <p className="mt-3 text-sm text-slate-500">Last updated: September 22, 2026</p>

      <div className="mt-10 space-y-8 text-sm leading-7 text-slate-700">
        <section>
          <h2 className="text-base font-semibold text-slate-900">Overview</h2>
          <p className="mt-2">
            Growth Assistant is a content workflow tool for AI SaaS founders. This
            product does not use a user account system or a product database.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-slate-900">
            Information we process
          </h2>
          <ul className="mt-2 list-disc space-y-2 pl-5">
            <li>
              Product descriptions and generation inputs you submit, used only to
              create a content package.
            </li>
            <li>
              Free-usage date and count stored in your browser with localStorage.
            </li>
            <li>
              Basic product events stored in your browser, such as generate,
              result view, copy, and upgrade clicks.
            </li>
            <li>
              Payment details handled by Creem if you choose a paid plan. We do
              not store card numbers.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-base font-semibold text-slate-900">Providers</h2>
          <p className="mt-2">
            Content generation is processed by DeepSeek. Checkout is processed by
            Creem. Those providers process data according to their own policies.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-slate-900">Cookies</h2>
          <p className="mt-2">
            We do not use advertising cookies. Browser storage is used only for
            free usage limits, local analytics events, and your latest content
            package.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-slate-900">Contact</h2>
          <p className="mt-2">
            For privacy questions, contact the operator of this site through the
            domain listed in your browser.
          </p>
        </section>
      </div>
    </div>
  );
}
