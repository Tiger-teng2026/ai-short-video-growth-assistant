"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { CopyButton } from "@/components/CopyButton";
import { trackEvent } from "@/lib/analytics";
import {
  CONTENT_PACKAGE_STORAGE_KEY,
  parseContentPackage,
  type StoredContentPackage,
} from "@/lib/content-package";
import { getGoal } from "@/lib/goals";
import { getTemplate } from "@/lib/templates";

const checklist = [
  "Content Strategy Created",
  "Hook Generated",
  "Script Ready",
  "Recording Plan Ready",
  "Publishing Assets Ready",
];

export function ResultView() {
  const [pack, setPack] = useState<StoredContentPackage | null>(null);
  const [invalid, setInvalid] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const raw = sessionStorage.getItem(CONTENT_PACKAGE_STORAGE_KEY);

    if (raw) {
      try {
        const parsed = JSON.parse(raw) as unknown;
        const nextPack = readStoredContentPackage(parsed);

        if (nextPack) {
          setPack(nextPack);
          setInvalid(false);
        } else {
          setPack(null);
          setInvalid(true);
        }
      } catch {
        setPack(null);
        setInvalid(true);
      }
    }

    setReady(true);
  }, []);

  useEffect(() => {
    if (pack) {
      trackEvent("view_result", { template: pack.template, goal: pack.goal });
    }
  }, [pack]);

  if (!ready) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-16">
        <p className="text-sm text-slate-500">Loading production plan...</p>
      </div>
    );
  }

  if (!pack) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-16">
        <p className="text-sm font-medium uppercase tracking-wide text-slate-500">
          Production Plan
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">
          Your Short Video Production Plan
        </h1>
        <p className="mt-3 text-slate-600 leading-7">
          {invalid
            ? "This production plan could not be loaded. The saved data is missing or invalid."
            : "A ready-to-record content workflow for your SaaS product."}
        </p>
        <Link
          href="/generate"
          className="mt-8 inline-flex h-12 items-center rounded-lg bg-slate-900 px-5 text-sm font-medium text-white transition-colors hover:bg-slate-800"
        >
          {invalid ? "Back to Generate" : "Generate Content Package"}
        </Link>
      </div>
    );
  }

  const template = getTemplate(pack.template);
  const goal = pack.goal ? getGoal(pack.goal) : undefined;
  const contentTemplate = template?.name ?? pack.template;
  const videoGoal =
    goal?.name ?? pack.goal ?? template?.description ?? "Create a ready-to-film short.";
  const scriptTitle = scriptModuleTitle(pack.videoLength);
  const scriptText = [
    `Opening: ${pack.script.opening}`,
    `Body: ${pack.script.body}`,
    `CTA: ${pack.script.cta}`,
  ].join("\n\n");
  const shotListText = pack.shotList
    .map((shot, index) => `Shot ${index + 1}. ${shot}`)
    .join("\n");

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-16">
      <p className="text-sm font-medium uppercase tracking-wide text-slate-500">
        Production Plan
      </p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
        Your Short Video Production Plan
      </h1>
      <p className="mt-3 max-w-2xl text-slate-600 leading-7">
        A ready-to-record content workflow for your SaaS product.
      </p>

      <section className="mt-8 rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="text-sm font-semibold text-slate-900">Production Checklist</h2>
        <ul className="mt-4 space-y-3">
          {checklist.map((item) => (
            <li key={item} className="flex items-start gap-2 text-sm leading-6 text-slate-700">
              <span className="mt-0.5 shrink-0 text-slate-900" aria-hidden>
                ✓
              </span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </section>

      <dl className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
        <MetaItem label="Platform" value={pack.platform} />
        <MetaItem label="Video Goal" value={videoGoal} />
        <MetaItem label="Content Template" value={contentTemplate} />
        <MetaItem label="Video Length" value={pack.videoLength} />
      </dl>

      <div className="mt-10 space-y-5 sm:space-y-6">
        <PackageSection
          number="01"
          title="Attention Hook"
          description="Choose the opening line that best grabs attention."
          copyText={pack.hooks.map((hook, index) => `${index + 1}. ${hook}`).join("\n")}
        >
          <ol className="space-y-3">
            {pack.hooks.map((hook, index) => (
              <li
                key={`hook-${index}`}
                className="flex flex-col gap-3 rounded-lg border border-slate-100 bg-slate-50 p-3 sm:flex-row sm:items-start sm:justify-between"
              >
                <p className="text-base font-medium leading-7 text-slate-900 sm:text-lg sm:leading-8">
                  <span className="mr-2 text-sm font-semibold text-slate-500">
                    {index + 1}.
                  </span>
                  {hook}
                </p>
                <CopyButton text={hook} source={`Attention Hook ${index + 1}`} compact />
              </li>
            ))}
          </ol>
        </PackageSection>

        <PackageSection
          number="02"
          title={scriptTitle}
          description="A complete structure for recording your short video."
          copyText={scriptText}
        >
          <div className="space-y-4 text-sm leading-7 text-slate-700">
            <div>
              <p className="font-semibold text-slate-900">Opening</p>
              <p className="mt-1 whitespace-pre-line">{pack.script.opening}</p>
            </div>
            <div>
              <p className="font-semibold text-slate-900">Body</p>
              <p className="mt-1 whitespace-pre-line">{pack.script.body}</p>
            </div>
            <div>
              <p className="font-semibold text-slate-900">CTA</p>
              <p className="mt-1 whitespace-pre-line">{pack.script.cta}</p>
            </div>
          </div>
        </PackageSection>

        <PackageSection
          number="03"
          title="Recording Plan"
          description="Follow these scenes to create your video."
          copyText={shotListText}
        >
          <ol className="space-y-3">
            {pack.shotList.map((shot, index) => (
              <li key={`shot-${index}`} className="text-sm leading-6 text-slate-700">
                <span className="font-semibold text-slate-900">Shot {index + 1}.</span>{" "}
                {shot}
              </li>
            ))}
          </ol>
        </PackageSection>

        <PackageSection
          number="04"
          title="Social Caption"
          description="Ready-to-post caption for your platform."
          copyText={pack.caption}
        >
          <p className="text-sm leading-7 text-slate-700">{pack.caption}</p>
        </PackageSection>

        <PackageSection
          number="05"
          title="Discovery Tags"
          description="Tags to help your content reach the right audience."
          copyText={pack.hashtags.join(" ")}
        >
          <p className="break-words text-sm leading-7 text-slate-700">
            {pack.hashtags.join(" ")}
          </p>
        </PackageSection>

        <PackageSection
          number="06"
          title="Call To Action"
          description="Ways to turn viewers into users."
          copyText={pack.cta.join("\n")}
        >
          <ul className="space-y-3">
            {pack.cta.map((item, index) => (
              <li
                key={`cta-${index}`}
                className="flex flex-col gap-3 rounded-lg border border-slate-100 bg-slate-50 p-3 sm:flex-row sm:items-start sm:justify-between"
              >
                <p className="text-sm font-medium leading-7 text-slate-900">{item}</p>
                <CopyButton text={item} source={`Call To Action ${index + 1}`} compact />
              </li>
            ))}
          </ul>
        </PackageSection>
      </div>

      <Link
        href="/generate"
        className="mt-10 inline-flex min-h-11 items-center text-sm font-medium text-slate-600 transition-colors hover:text-slate-900"
      >
        Generate another package
      </Link>
    </div>
  );
}

function readStoredContentPackage(
  raw: unknown,
): StoredContentPackage | null {
  if (!raw || typeof raw !== "object") {
    return null;
  }

  const data = raw as Record<string, unknown>;
  const platform = asRequiredString(data.platform);
  const productDescription = asRequiredString(data.productDescription);
  const goal = asRequiredString(data.goal);
  const template = asRequiredString(data.template);
  const videoLength = asRequiredString(data.videoLength);

  if (!platform || !productDescription || !goal || !template || !videoLength) {
    return null;
  }

  try {
    return {
      platform,
      productDescription,
      goal,
      template,
      videoLength,
      ...parseContentPackage(data),
    };
  } catch {
    return null;
  }
}

function asRequiredString(value: unknown): string | null {
  if (typeof value !== "string" || value.trim().length === 0) {
    return null;
  }

  return value.trim();
}

function scriptModuleTitle(videoLength: string): string {
  const seconds = videoLength.match(/\d+/)?.[0];
  return seconds ? `${seconds}-Second Video Script` : "Video Script";
}

function MetaItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">
        {label}
      </dt>
      <dd className="mt-2 break-words text-sm font-medium leading-6 text-slate-900">
        {value}
      </dd>
    </div>
  );
}

function PackageSection({
  number,
  title,
  description,
  copyText,
  children,
}: {
  number: string;
  title: string;
  description: string;
  copyText: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h2 className="text-sm font-semibold text-slate-900">
            <span className="mr-2 text-slate-400">{number}</span>
            {title}
          </h2>
          <p className="mt-1 text-sm leading-6 text-slate-500">{description}</p>
        </div>
        <div className="w-full shrink-0 sm:w-auto">
          <CopyButton text={copyText} source={title} />
        </div>
      </div>
      <div className="mt-4">{children}</div>
    </section>
  );
}
