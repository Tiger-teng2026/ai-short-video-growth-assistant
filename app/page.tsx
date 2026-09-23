import Link from "next/link";
import { TrackPageEvent } from "@/components/TrackPageEvent";
import {
  getSiteUrl,
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_TAGLINE,
} from "@/lib/site";

const heroValues = [
  {
    title: "Video Strategy",
    body: "Concept, viewer, hook, promise, and one CTA before you film.",
  },
  {
    title: "Recording Guide",
    body: "Scene-by-scene shots, timing, and founder actions you can film on a phone.",
  },
  {
    title: "Voice Script",
    body: "Spoken opening, body, and CTA that match each scene.",
  },
  {
    title: "Editing Guide",
    body: "Cuts, overlays, captions, and pacing so the cut is obvious.",
  },
  {
    title: "Publishing Package",
    body: "Caption, hashtags, thumbnail line, and first comment ready to post.",
  },
];

const problems = [
  "Don't know what to film first",
  "No scene-by-scene recording plan",
  "Scripts that don't match a real product demo",
];

const workflow = [
  {
    step: "1",
    title: "Video Strategy",
    body: "Decide who the video is for and what it must prove.",
  },
  {
    step: "2",
    title: "Recording Guide",
    body: "Film each scene with a clear shot, action, and on-screen frame.",
  },
  {
    step: "3",
    title: "Voice Script",
    body: "Say one line per scene. No extra marketing copy.",
  },
  {
    step: "4",
    title: "Editing Guide",
    body: "Cut, overlay, and caption from a shot list you already filmed.",
  },
  {
    step: "5",
    title: "Publishing Package",
    body: "Post to TikTok, YouTube Shorts, or Reels with one CTA.",
  },
];

const exampleCase = {
  product: "AI invoice tool for freelancers",
  strategy: {
    concept: "Show how invoicing steals time after the real work is done.",
    viewer: "Freelancers who still build invoices by hand.",
    hook: "You just finished a $2,000 project. Then invoicing stole the next 40 minutes.",
    promise: "Describe the work once. Review and send the invoice.",
    cta: "Comment DEMO if you want the recording walkthrough.",
  },
  recordingGuide: [
    "0–3s · Face cam: “40 minutes for one invoice?”",
    "Screen: messy spreadsheet and unpaid invoice notes.",
    "Screen recording: describe the project, watch the invoice draft.",
    "Face cam plus product overlay: review, send, hold on the CTA.",
  ],
  voiceScript: {
    opening: "You closed the work. Then you spent longer making the invoice.",
    body: "Wrong rate. Missing hours. Late send. Describe the work instead. The invoice drafts in seconds. You review and send.",
    cta: "Comment DEMO if you want the walkthrough.",
  },
  editingGuide:
    "Cut on the pain line. Hold the messy spreadsheet for one beat. Speed the draft. End on one CTA card.",
  publishingPackage:
    "Caption the time cost, not the feature list. Hashtags stay product-specific. First comment repeats: Comment DEMO.",
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
    image: `${siteUrl}/logo.jpg`,
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    about: SITE_TAGLINE,
  };

  return (
    <div className="mx-auto max-w-5xl px-6">
      <TrackPageEvent event="landing_view" />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <section className="flex flex-col items-start py-20 sm:py-28">
        <p className="text-sm font-medium uppercase tracking-wide text-slate-500">
          {SITE_TAGLINE}
        </p>
        <h1 className="mt-3 max-w-3xl text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl sm:leading-tight">
          Turn a product idea into a short-video production blueprint
        </h1>
        <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">
          Help SaaS founders and product creators turn a product idea into a
          professional short-video production blueprint: Video Strategy,
          Recording Guide, Voice Script, Editing Guide, and Publishing Package.
        </p>
        <Link
          href="/generate"
          className="mt-8 inline-flex h-12 items-center rounded-lg bg-slate-900 px-6 text-sm font-medium text-white transition-colors hover:bg-slate-800"
        >
          Create My Production Blueprint
        </Link>
      </section>

      <section className="pb-16">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {heroValues.map((item) => (
            <article
              key={item.title}
              className="rounded-xl border border-slate-200 bg-white p-5"
            >
              <h2 className="text-sm font-semibold text-slate-900">
                {item.title}
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">{item.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="border-t border-slate-200 py-16">
        <p className="text-sm font-medium uppercase tracking-wide text-slate-500">
          Problem
        </p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">
          Most founders get stuck before they press record.
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
          From product idea to a blueprint you can film, edit, and publish.
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
          One product idea. A complete production blueprint.
        </h2>
        <p className="mt-4 max-w-2xl text-slate-600 leading-7">
          Video Strategy → Recording Guide → Voice Script → Editing Guide →
          Publishing Package. No marketing team required.
        </p>
      </section>

      <section className="border-t border-slate-200 py-16 pb-24">
        <p className="text-sm font-medium uppercase tracking-wide text-slate-500">
          Example
        </p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">
          A full production blueprint from one product idea.
        </h2>
        <p className="mt-3 text-sm text-slate-500">
          Product: {exampleCase.product}
        </p>

        <div className="mt-8 space-y-4">
          <article className="rounded-xl border border-slate-200 bg-white p-5">
            <h3 className="text-sm font-semibold text-slate-900">
              Video Strategy
            </h3>
            <div className="mt-3 space-y-3 text-sm leading-7 text-slate-700">
              <p>
                <span className="font-semibold text-slate-900">Concept. </span>
                {exampleCase.strategy.concept}
              </p>
              <p>
                <span className="font-semibold text-slate-900">Viewer. </span>
                {exampleCase.strategy.viewer}
              </p>
              <p>
                <span className="font-semibold text-slate-900">Hook. </span>
                {exampleCase.strategy.hook}
              </p>
              <p>
                <span className="font-semibold text-slate-900">Promise. </span>
                {exampleCase.strategy.promise}
              </p>
              <p>
                <span className="font-semibold text-slate-900">CTA. </span>
                {exampleCase.strategy.cta}
              </p>
            </div>
          </article>

          <article className="rounded-xl border border-slate-200 bg-white p-5">
            <h3 className="text-sm font-semibold text-slate-900">
              Recording Guide
            </h3>
            <ol className="mt-3 space-y-2">
              {exampleCase.recordingGuide.map((shot, index) => (
                <li key={shot} className="text-sm leading-6 text-slate-700">
                  <span className="font-semibold text-slate-900">
                    Scene {index + 1}.
                  </span>{" "}
                  {shot}
                </li>
              ))}
            </ol>
          </article>

          <article className="rounded-xl border border-slate-200 bg-white p-5">
            <h3 className="text-sm font-semibold text-slate-900">Voice Script</h3>
            <div className="mt-3 space-y-3 text-sm leading-7 text-slate-700">
              <p>
                <span className="font-semibold text-slate-900">Opening. </span>
                {exampleCase.voiceScript.opening}
              </p>
              <p>
                <span className="font-semibold text-slate-900">Body. </span>
                {exampleCase.voiceScript.body}
              </p>
              <p>
                <span className="font-semibold text-slate-900">CTA. </span>
                {exampleCase.voiceScript.cta}
              </p>
            </div>
          </article>

          <article className="rounded-xl border border-slate-200 bg-white p-5">
            <h3 className="text-sm font-semibold text-slate-900">
              Editing Guide
            </h3>
            <p className="mt-2 text-sm leading-7 text-slate-700">
              {exampleCase.editingGuide}
            </p>
          </article>

          <article className="rounded-xl border border-slate-200 bg-white p-5">
            <h3 className="text-sm font-semibold text-slate-900">
              Publishing Package
            </h3>
            <p className="mt-2 text-sm leading-7 text-slate-700">
              {exampleCase.publishingPackage}
            </p>
          </article>
        </div>
      </section>
    </div>
  );
}
