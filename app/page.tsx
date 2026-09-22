import Link from "next/link";
import {
  getSiteUrl,
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_TAGLINE,
} from "@/lib/site";

const problems = [
  "No content ideas",
  "No marketing team",
  "No time for scripts",
];

const workflow = [
  {
    step: "1",
    title: "Product Idea",
    body: "Start with the SaaS product you already have.",
  },
  {
    step: "2",
    title: "Content Strategy",
    body: "Pick a founder workflow: demo, story, tip, or proof.",
  },
  {
    step: "3",
    title: "Video Script",
    body: "Get a hook, spoken script, caption, and CTA.",
  },
  {
    step: "4",
    title: "Recording Plan",
    body: "Follow a shot list you can film on a phone.",
  },
  {
    step: "5",
    title: "Publish",
    body: "Post to TikTok, YouTube Shorts, or Reels.",
  },
];

const exampleCase = {
  product: "AI invoice tool for freelancers",
  hook: "You just finished a $2,000 project. Then invoicing stole the next 40 minutes.",
  script: {
    opening: "You closed the work. Then you spent longer making the invoice.",
    body: "Wrong rate. Missing hours. Late send. Describe the work instead. The invoice drafts in seconds. You review, send, and get paid.",
    cta: "Try it free — link in bio.",
  },
  shotList: [
    "Face cam, direct to lens: “40 minutes for one invoice?”",
    "Cut to a messy spreadsheet and unpaid invoice notes.",
    "Screen recording: type the project details, watch the invoice draft.",
    "Face cam plus product overlay: send, then hold on the CTA.",
  ],
  caption:
    "If invoicing takes longer than the work, the process is broken. Describe the project, send the invoice, and get paid faster.",
};

export default function Home() {
  const siteUrl = getSiteUrl();
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: SITE_NAME,
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    description: SITE_DESCRIPTION,
    url: siteUrl,
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    about: SITE_TAGLINE,
  };

  return (
    <div className="mx-auto max-w-5xl px-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <section className="flex flex-col items-start py-20 sm:py-28">
        <p className="text-sm font-medium uppercase tracking-wide text-slate-500">
          AI SaaS Founder Content Workflow Assistant
        </p>
        <h1 className="mt-3 max-w-3xl text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl sm:leading-tight">
          Create SaaS Growth Content Without a Marketing Team
        </h1>
        <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">
          Turn your product ideas into ready-to-film TikTok, YouTube Shorts, and
          Reels content packages.
        </p>
        <Link
          href="/generate"
          className="mt-8 inline-flex h-12 items-center rounded-lg bg-slate-900 px-5 text-sm font-medium text-white transition-colors hover:bg-slate-800"
        >
          Generate Your First Video Free
        </Link>
      </section>

      <section className="border-t border-slate-200 py-16">
        <p className="text-sm font-medium uppercase tracking-wide text-slate-500">
          Problem
        </p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">
          Most SaaS founders get stuck before they film.
        </h2>
        <ul className="mt-6 space-y-3">
          {problems.map((item) => (
            <li key={item} className="flex items-center gap-3 text-slate-700">
              <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
              {item}
            </li>
          ))}
        </ul>
      </section>

      <section className="border-t border-slate-200 py-16">
        <p className="text-sm font-medium uppercase tracking-wide text-slate-500">
          Workflow
        </p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">
          From product idea to a video you can publish.
        </h2>
        <ol className="mt-8 grid gap-4 sm:grid-cols-5">
          {workflow.map((item, index) => (
            <li
              key={item.title}
              className="relative rounded-xl border border-slate-200 bg-white p-4"
            >
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Step {item.step}
              </p>
              <h3 className="mt-2 text-sm font-semibold text-slate-900">
                {item.title}
              </h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">{item.body}</p>
              {index < workflow.length - 1 ? (
                <p className="mt-3 text-xs font-medium text-slate-400 sm:hidden">
                  ↓
                </p>
              ) : null}
            </li>
          ))}
        </ol>
      </section>

      <section className="border-t border-slate-200 py-16">
        <p className="text-sm font-medium uppercase tracking-wide text-slate-500">
          Solution
        </p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">
          One product idea. A complete short-video workflow.
        </h2>
        <p className="mt-4 max-w-2xl text-slate-600 leading-7">
          Product Idea → Content Strategy → Video Script → Recording Plan →
          Publish. No marketing team required.
        </p>
      </section>

      <section className="border-t border-slate-200 py-16 pb-24">
        <p className="text-sm font-medium uppercase tracking-wide text-slate-500">
          Example
        </p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">
          A full content package from one product idea.
        </h2>
        <p className="mt-3 text-sm text-slate-500">
          Product: {exampleCase.product}
        </p>

        <div className="mt-8 space-y-4">
          <article className="rounded-xl border border-slate-200 bg-white p-5">
            <h3 className="text-sm font-semibold text-slate-900">Hook</h3>
            <p className="mt-2 text-sm leading-7 text-slate-700">
              {exampleCase.hook}
            </p>
          </article>

          <article className="rounded-xl border border-slate-200 bg-white p-5">
            <h3 className="text-sm font-semibold text-slate-900">Script</h3>
            <div className="mt-3 space-y-3 text-sm leading-7 text-slate-700">
              <p>
                <span className="font-semibold text-slate-900">Opening. </span>
                {exampleCase.script.opening}
              </p>
              <p>
                <span className="font-semibold text-slate-900">Body. </span>
                {exampleCase.script.body}
              </p>
              <p>
                <span className="font-semibold text-slate-900">CTA. </span>
                {exampleCase.script.cta}
              </p>
            </div>
          </article>

          <article className="rounded-xl border border-slate-200 bg-white p-5">
            <h3 className="text-sm font-semibold text-slate-900">Shot List</h3>
            <ol className="mt-3 space-y-2">
              {exampleCase.shotList.map((shot, index) => (
                <li key={shot} className="text-sm leading-6 text-slate-700">
                  <span className="font-semibold text-slate-900">
                    Shot {index + 1}.
                  </span>{" "}
                  {shot}
                </li>
              ))}
            </ol>
          </article>

          <article className="rounded-xl border border-slate-200 bg-white p-5">
            <h3 className="text-sm font-semibold text-slate-900">Caption</h3>
            <p className="mt-2 text-sm leading-7 text-slate-700">
              {exampleCase.caption}
            </p>
          </article>
        </div>
      </section>
    </div>
  );
}
