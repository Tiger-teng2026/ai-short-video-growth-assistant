"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { CopyButton } from "@/components/CopyButton";
import { trackEvent } from "@/lib/analytics";
import {
  CONTENT_PACKAGE_STORAGE_KEY,
  parseContentPackage,
  type RecordingScene,
  type StoredContentPackage,
} from "@/lib/content-package";
import { getGoal } from "@/lib/goals";
import { getTemplate } from "@/lib/templates";

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
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-16">
        <p className="text-sm text-slate-500">Loading production blueprint...</p>
      </div>
    );
  }

  if (!pack) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-16">
        <p className="text-sm font-medium uppercase tracking-wide text-slate-500">
          Production Blueprint
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">
          Your Short Video Production Workspace
        </h1>
        <p className="mt-3 text-slate-600 leading-7">
          {invalid
            ? "This production blueprint could not be loaded. The saved data is missing or invalid."
            : "Generate a product idea to get a scene-by-scene filming plan."}
        </p>
        <Link
          href="/generate"
          className="mt-8 inline-flex h-12 items-center rounded-lg bg-slate-900 px-5 text-sm font-medium text-white transition-colors hover:bg-slate-800"
        >
          {invalid ? "Back to Generate" : "Create a production blueprint"}
        </Link>
      </div>
    );
  }

  const template = getTemplate(pack.template);
  const goal = pack.goal ? getGoal(pack.goal) : undefined;
  const contentTemplate = template?.name ?? pack.template;
  const videoGoal =
    goal?.name ?? pack.goal ?? template?.description ?? "Create a ready-to-film short.";
  const voice = pack.voiceScript ?? pack.script;
  const scenes = pack.recordingGuide.length > 0
    ? pack.recordingGuide
    : pack.shotList.map((shot, index) => fallbackScene(shot, index));

  const strategyText = [
    `Concept: ${pack.videoStrategy.concept}`,
    `Viewer: ${pack.videoStrategy.targetViewer}`,
    `Hook strategy: ${pack.videoStrategy.hookStrategy}`,
    `Promise: ${pack.videoStrategy.promise}`,
    `CTA strategy: ${pack.videoStrategy.ctaStrategy}`,
    "",
    "Hook options:",
    ...pack.hooks.map((hook, index) => `${index + 1}. ${hook}`),
  ].join("\n");

  const recordingText = scenes.map(formatSceneCopy).join("\n\n");
  const voiceText = [
    `Opening: ${voice.opening}`,
    `Body: ${voice.body}`,
    `CTA: ${voice.cta}`,
  ].join("\n\n");
  const editingText = [
    `Pacing: ${pack.editingGuide.pacing}`,
    `Cuts:\n${pack.editingGuide.cuts.map((cut) => `- ${cut}`).join("\n")}`,
    `Text overlay: ${pack.editingGuide.textOverlay}`,
    `Music: ${pack.editingGuide.music}`,
    `Captions: ${pack.editingGuide.captions}`,
  ].join("\n\n");
  const publishingText = [
    `Caption: ${pack.publishingPackage.caption}`,
    `Hashtags: ${pack.publishingPackage.hashtags.join(" ")}`,
    `CTA options:\n${pack.publishingPackage.ctaOptions.map((item) => `- ${item}`).join("\n")}`,
    `Thumbnail: ${pack.publishingPackage.thumbnailText}`,
    `First comment: ${pack.publishingPackage.firstComment}`,
  ].join("\n\n");
  const checklistText = pack.productionChecklist
    .map((item, index) => `${index + 1}. ${item}`)
    .join("\n");

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-16">
      <p className="text-sm font-medium uppercase tracking-wide text-slate-500">
        Production Blueprint Workspace
      </p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
        Film this short from one product idea
      </h1>
      <p className="mt-3 max-w-2xl text-slate-600 leading-7">
        Strategy, scene-by-scene recording, voice, edit notes, and a publish pack
        for {pack.platform}.
      </p>

      <dl className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
        <MetaItem label="Platform" value={pack.platform} />
        <MetaItem label="Video Goal" value={videoGoal} />
        <MetaItem label="Content Template" value={contentTemplate} />
        <MetaItem label="Video Length" value={pack.videoLength} />
      </dl>

      <div className="mt-10 space-y-5 sm:space-y-6">
        <PackageSection
          number="01"
          title="Video Strategy"
          description="What this video is for, who it talks to, and how it should open."
          copyText={strategyText}
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <Fact label="Concept" value={pack.videoStrategy.concept} />
            <Fact label="Target viewer" value={pack.videoStrategy.targetViewer} />
            <Fact label="Hook strategy" value={pack.videoStrategy.hookStrategy} />
            <Fact label="Promise" value={pack.videoStrategy.promise} />
            <Fact
              label="CTA strategy"
              value={pack.videoStrategy.ctaStrategy}
              className="sm:col-span-2"
            />
          </div>
          {pack.hooks.length > 0 ? (
            <ol className="mt-5 space-y-3">
              {pack.hooks.map((hook, index) => (
                <li
                  key={`hook-${index}`}
                  className="flex flex-col gap-3 rounded-lg border border-slate-100 bg-slate-50 p-3 sm:flex-row sm:items-start sm:justify-between"
                >
                  <p className="text-sm font-medium leading-7 text-slate-900">
                    <span className="mr-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Hook {index + 1}
                    </span>
                    {hook}
                  </p>
                  <CopyButton text={hook} source={`Hook ${index + 1}`} compact />
                </li>
              ))}
            </ol>
          ) : null}
        </PackageSection>

        <PackageSection
          number="02"
          title="Recording Guide"
          description="The core filming workspace. Shoot each scene in order on a phone."
          copyText={recordingText}
          featured
        >
          <ol className="space-y-4">
            {scenes.map((scene, index) => (
              <SceneCard key={`scene-${scene.scene}-${index}`} scene={scene} />
            ))}
          </ol>
        </PackageSection>

        <PackageSection
          number="03"
          title="Voice Script"
          description="Spoken lines to record with the scenes above."
          copyText={voiceText}
        >
          <div className="space-y-4 text-sm leading-7 text-slate-700">
            <Fact label="Opening" value={voice.opening} />
            <Fact label="Body" value={voice.body} />
            <Fact label="CTA" value={voice.cta} />
          </div>
        </PackageSection>

        <PackageSection
          number="04"
          title="Editing Guide"
          description="How to cut, caption, and finish the video without an editor."
          copyText={editingText}
        >
          <div className="space-y-4">
            <Fact label="Pacing" value={pack.editingGuide.pacing} />
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Cuts
              </p>
              <ul className="mt-2 space-y-2 text-sm leading-6 text-slate-700">
                {pack.editingGuide.cuts.map((cut, index) => (
                  <li key={`cut-${index}`}>{cut}</li>
                ))}
              </ul>
            </div>
            <Fact label="Text overlay" value={pack.editingGuide.textOverlay} />
            <Fact label="Music" value={pack.editingGuide.music} />
            <Fact label="Captions" value={pack.editingGuide.captions} />
          </div>
        </PackageSection>

        <PackageSection
          number="05"
          title="Publishing Package"
          description="Paste-ready assets for the post, cover, and first comment."
          copyText={publishingText}
        >
          <div className="space-y-4">
            <Fact label="Caption" value={pack.publishingPackage.caption} />
            <Fact
              label="Hashtags"
              value={pack.publishingPackage.hashtags.join(" ")}
            />
            <Fact
              label="Thumbnail text"
              value={pack.publishingPackage.thumbnailText}
            />
            <Fact
              label="First comment"
              value={pack.publishingPackage.firstComment}
            />
            <ul className="space-y-3">
              {pack.publishingPackage.ctaOptions.map((item, index) => (
                <li
                  key={`cta-${index}`}
                  className="flex flex-col gap-3 rounded-lg border border-slate-100 bg-slate-50 p-3 sm:flex-row sm:items-start sm:justify-between"
                >
                  <p className="text-sm font-medium leading-7 text-slate-900">
                    {item}
                  </p>
                  <CopyButton
                    text={item}
                    source={`Publishing CTA ${index + 1}`}
                    compact
                  />
                </li>
              ))}
            </ul>
          </div>
        </PackageSection>

        <PackageSection
          number="06"
          title="Production Checklist"
          description="Finish these steps before you publish."
          copyText={checklistText}
        >
          <ul className="space-y-3">
            {pack.productionChecklist.map((item, index) => (
              <li
                key={`check-${index}`}
                className="flex items-start gap-2 text-sm leading-6 text-slate-700"
              >
                <span className="mt-0.5 shrink-0 text-slate-900" aria-hidden>
                  {index + 1}.
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </PackageSection>
      </div>

      <Link
        href="/generate"
        className="mt-10 inline-flex min-h-11 items-center text-sm font-medium text-slate-600 transition-colors hover:text-slate-900"
      >
        Create another blueprint
      </Link>
    </div>
  );
}

function SceneCard({ scene }: { scene: RecordingScene }) {
  const screenFrame = [scene.shotType, scene.visual].filter(Boolean).join(" · ");

  return (
    <li className="rounded-xl border border-slate-200 bg-slate-50 p-4 sm:p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Scene {scene.scene}
          </p>
          <p className="mt-1 text-base font-semibold text-slate-900">
            {displayValue(scene.shotType)} · {displayValue(scene.duration)}
          </p>
        </div>
        <CopyButton
          text={formatSceneCopy(scene)}
          source={`Recording Scene ${scene.scene}`}
          compact
        />
      </div>
      <dl className="mt-4 grid gap-3 sm:grid-cols-2">
        <Fact label="Time" value={displayValue(scene.duration)} />
        <Fact label="Shot type" value={displayValue(scene.shotType)} />
        <Fact label="What to film" value={displayValue(scene.visual)} />
        <Fact label="Founder action" value={displayValue(scene.action)} />
        <Fact label="On-camera frame" value={displayValue(screenFrame)} />
        <Fact label="Voiceover" value={displayValue(scene.audio)} />
        <Fact
          label="On-screen text"
          value={displayValue(scene.onScreenText)}
          className="sm:col-span-2"
        />
      </dl>
    </li>
  );
}

function formatSceneCopy(scene: RecordingScene): string {
  const screenFrame = [scene.shotType, scene.visual].filter(Boolean).join(" · ");

  return [
    `Scene ${scene.scene}`,
    `Time: ${displayValue(scene.duration)}`,
    `Shot type: ${displayValue(scene.shotType)}`,
    `What to film: ${displayValue(scene.visual)}`,
    `Founder action: ${displayValue(scene.action)}`,
    `On-camera frame: ${displayValue(screenFrame)}`,
    `Voiceover: ${displayValue(scene.audio)}`,
    `On-screen text: ${displayValue(scene.onScreenText)}`,
  ].join("\n");
}

function fallbackScene(shot: string, index: number): RecordingScene {
  return {
    scene: index + 1,
    duration: "",
    shotType: "phone",
    visual: shot,
    onScreenText: "",
    audio: "",
    action: shot,
  };
}

function displayValue(value: string): string {
  return value.trim() ? value : "—";
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

function Fact({
  label,
  value,
  className,
}: {
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className="mt-1 whitespace-pre-line text-sm leading-6 text-slate-800">
        {value}
      </p>
    </div>
  );
}

function PackageSection({
  number,
  title,
  description,
  copyText,
  children,
  featured = false,
}: {
  number: string;
  title: string;
  description: string;
  copyText: string;
  children: ReactNode;
  featured?: boolean;
}) {
  return (
    <section
      className={`rounded-xl border bg-white p-4 sm:p-5 ${
        featured
          ? "border-slate-900 shadow-sm"
          : "border-slate-200"
      }`}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h2 className="text-sm font-semibold text-slate-900 sm:text-base">
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
