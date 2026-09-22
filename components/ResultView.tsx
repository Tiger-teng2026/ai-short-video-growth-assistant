"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { CopyButton } from "@/components/CopyButton";
import { trackEvent } from "@/lib/analytics";
import {
  CONTENT_PACKAGE_STORAGE_KEY,
  type StoredContentPackage,
} from "@/lib/content-package";
import { getTemplate } from "@/lib/templates";

export function ResultView() {
  const [pack, setPack] = useState<StoredContentPackage | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const raw = sessionStorage.getItem(CONTENT_PACKAGE_STORAGE_KEY);

    if (raw) {
      try {
        setPack(JSON.parse(raw) as StoredContentPackage);
      } catch {
        setPack(null);
      }
    }

    setReady(true);
  }, []);

  useEffect(() => {
    if (pack) {
      trackEvent("view_result", { template: pack.template });
    }
  }, [pack]);

  if (!ready) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-16">
        <p className="text-sm text-slate-500">Loading content package...</p>
      </div>
    );
  }

  if (!pack) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-16">
        <p className="text-sm font-medium uppercase tracking-wide text-slate-500">
          Founder Content Package
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">
          Your Founder Content Package
        </h1>
        <p className="mt-3 text-slate-600 leading-7">
          Create a package first. Your latest workflow output will show up here.
        </p>
        <Link
          href="/generate"
          className="mt-8 inline-flex h-12 items-center rounded-lg bg-slate-900 px-5 text-sm font-medium text-white transition-colors hover:bg-slate-800"
        >
          Generate Content Package
        </Link>
      </div>
    );
  }

  const template = getTemplate(pack.template);
  const contentType = template?.name ?? pack.template;
  const videoGoal = template?.description ?? "Create a ready-to-film short.";
  const scriptText = [
    `Opening: ${pack.script.opening}`,
    `Body: ${pack.script.body}`,
    `CTA: ${pack.script.cta}`,
  ].join("\n\n");
  const shotListText = pack.shotList
    .map((shot, index) => `Shot ${index + 1}. ${shot}`)
    .join("\n");

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <p className="text-sm font-medium uppercase tracking-wide text-slate-500">
        Founder Content Package
      </p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">
        Your Founder Content Package
      </h1>

      <dl className="mt-8 grid gap-4 sm:grid-cols-3">
        <MetaItem label="Platform" value={pack.platform} />
        <MetaItem label="Content Type" value={contentType} />
        <MetaItem label="Video Goal" value={videoGoal} />
      </dl>

      <div className="mt-10 space-y-6">
        <PackageSection
          title="Hook"
          copyText={pack.hooks.map((hook, index) => `${index + 1}. ${hook}`).join("\n")}
        >
          <ol className="space-y-4">
            {pack.hooks.map((hook, index) => (
              <li key={`hook-${index}`} className="text-lg font-medium leading-8 text-slate-900">
                <span className="mr-2 text-sm font-semibold text-slate-500">
                  {index + 1}.
                </span>
                {hook}
              </li>
            ))}
          </ol>
        </PackageSection>

        <PackageSection title="Video Script" copyText={scriptText}>
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

        <PackageSection title="Shot List" copyText={shotListText}>
          <ol className="space-y-3">
            {pack.shotList.map((shot, index) => (
              <li key={`shot-${index}`} className="text-sm leading-6 text-slate-700">
                <span className="font-semibold text-slate-900">Shot {index + 1}.</span>{" "}
                {shot}
              </li>
            ))}
          </ol>
        </PackageSection>

        <PackageSection title="Caption" copyText={pack.caption}>
          <p className="text-sm leading-7 text-slate-700">{pack.caption}</p>
        </PackageSection>

        <PackageSection title="Hashtags" copyText={pack.hashtags.join(" ")}>
          <p className="text-sm leading-7 text-slate-700">
            {pack.hashtags.join(" ")}
          </p>
        </PackageSection>

        <PackageSection title="CTA" copyText={pack.cta.join("\n")}>
          <ul className="space-y-2">
            {pack.cta.map((item, index) => (
              <li key={`cta-${index}`} className="text-sm font-medium leading-7 text-slate-900">
                {item}
              </li>
            ))}
          </ul>
        </PackageSection>
      </div>

      <Link
        href="/generate"
        className="mt-10 inline-flex h-11 items-center text-sm font-medium text-slate-600 transition-colors hover:text-slate-900"
      >
        Generate another package
      </Link>
    </div>
  );
}

function MetaItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">
        {label}
      </dt>
      <dd className="mt-2 text-sm font-medium leading-6 text-slate-900">{value}</dd>
    </div>
  );
}

function PackageSection({
  title,
  copyText,
  children,
}: {
  title: string;
  copyText: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-sm font-semibold text-slate-900">{title}</h2>
        <CopyButton text={copyText} source={title} />
      </div>
      <div className="mt-3">{children}</div>
    </section>
  );
}
