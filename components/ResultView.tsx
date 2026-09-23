"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { CopyButton } from "@/components/CopyButton";
import { trackEvent } from "@/lib/analytics";
import {
  CONTENT_PACKAGE_STORAGE_KEY,
  EXECUTION_STEP_TITLES,
  parseContentPackage,
  type ExecutionStep,
  type RecordingScene,
  type StoredContentPackage,
  type VideoAssemblyClip,
  type VideoAssemblyTransition,
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
            : "Enter a product idea to get a 5-step plan from recording to publishing."}
        </p>
        <Link
          href="/generate"
          className="mt-8 inline-flex h-12 items-center rounded-lg bg-slate-900 px-5 text-sm font-medium text-white transition-colors hover:bg-slate-800"
        >
          {invalid ? "Back to Create" : "Create a production blueprint"}
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
  const assembly = pack.videoAssembly ?? { clipOrder: [], transitions: [] };
  const assemblyText = [
    ...assembly.clipOrder.map(formatClipCopy),
    assembly.transitions.length > 0
      ? [
          "Scene Transitions",
          ...assembly.transitions.map(formatTransitionCopy),
        ].join("\n")
      : "",
  ]
    .filter(Boolean)
    .join("\n\n");
  const voiceText = [
    `Opening: ${voice.opening}`,
    `Body: ${voice.body}`,
    `CTA: ${voice.cta}`,
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
  const workflow = pack.executionWorkflow?.steps?.length
    ? pack.executionWorkflow.steps
    : [];
  const steps = EXECUTION_STEP_TITLES.map((title, index) => {
    const match = workflow.find((step) => step.stepNumber === index + 1);
    return {
      stepNumber: index + 1,
      title: match?.title || title,
      goal: match?.goal || "",
      instructions: match?.instructions ?? [],
      checklist: match?.checklist ?? [],
    } satisfies ExecutionStep;
  });
  const onScreenTextItems = scenes
    .map((scene) => ({
      scene: scene.scene,
      text: scene.onScreenText.trim(),
    }))
    .filter((item) => item.text);
  const onScreenTextCopy = onScreenTextItems
    .map((item) => `Scene ${item.scene}: ${item.text}`)
    .join("\n");
  const step3Copy = [
    onScreenTextCopy ? `On-screen text\n${onScreenTextCopy}` : "",
    `Voice script copy helper\n${voiceText}`,
    `Captions: ${pack.editingGuide.captions}`,
    `Text overlay: ${pack.editingGuide.textOverlay}`,
  ]
    .filter(Boolean)
    .join("\n\n");

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-16">
      <p className="text-sm font-medium uppercase tracking-wide text-slate-500">
        Production Blueprint Workspace
      </p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
        Make this video in 5 steps
      </h1>
      <p className="mt-3 max-w-2xl text-slate-600 leading-7">
        Follow these steps from recording to publishing.
      </p>

      <dl className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
        <MetaItem label="Platform" value={pack.platform} />
        <MetaItem label="Video Goal" value={videoGoal} />
        <MetaItem label="Video Format" value={contentTemplate} />
        <MetaItem label="Video Length" value={pack.videoLength} />
      </dl>

      <ol className="mt-8 grid grid-cols-1 gap-2 sm:grid-cols-5">
        {steps.map((step) => (
          <li
            key={`step-nav-${step.stepNumber}`}
            className="rounded-lg border border-slate-200 bg-white px-3 py-3"
          >
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
              Step {step.stepNumber}
            </p>
            <p className="mt-1 text-sm font-medium leading-5 text-slate-900">
              {step.title}
            </p>
          </li>
        ))}
      </ol>

      <div className="mt-10 space-y-5 sm:space-y-6">
        <PackageSection
          number="01"
          stepLabel="STEP 1"
          title="Record Your Clips"
          description={steps[0].goal || "Shoot each scene in the Recording Guide."}
          copyText={recordingText}
          featured
          step={steps[0]}
        >
          <ol className="space-y-5">
            {scenes.map((scene, index) => (
              <SceneCard key={`scene-${scene.scene}-${index}`} scene={scene} />
            ))}
          </ol>
        </PackageSection>

        <PackageSection
          number="02"
          stepLabel="STEP 2"
          title="Put Clips Together"
          description={
            steps[1].goal ||
            "Put the recorded clips in this order and make the simple switches."
          }
          copyText={assemblyText}
          step={steps[1]}
        >
          <ol className="space-y-5">
            {assembly.clipOrder.map((clip, index) => (
              <ClipCard key={`clip-${clip.clipNumber}-${index}`} clip={clip} />
            ))}
          </ol>
          {assembly.transitions.length > 0 ? (
            <div className="mt-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Scene Transition
              </p>
              <ul className="mt-3 space-y-3">
                {assembly.transitions.map((transition, index) => (
                  <li
                    key={`transition-${index}`}
                    className="rounded-xl border border-slate-200 bg-slate-50 p-4"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0">
                        <p className="text-sm font-medium leading-6 text-slate-900">
                          {transition.fromScene} → {transition.toScene}
                        </p>
                      </div>
                      <div className="w-full shrink-0 sm:w-auto">
                        <CopyButton
                          text={formatTransitionCopy(transition)}
                          source={`Scene Transition ${index + 1}`}
                          compact
                        />
                      </div>
                    </div>
                    <dl className="mt-4 space-y-3">
                      <SceneField
                        label="Transition"
                        value={displayValue(transition.transitionType)}
                      />
                      <SceneField
                        label="Effect"
                        value={displayValue(transition.visualEffect)}
                      />
                      <SceneField
                        label="Duration"
                        value={displayValue(transition.duration)}
                      />
                      <SceneField
                        label="Editing Action"
                        value={displayValue(transition.editingAction)}
                        emphasis
                      />
                      <SceneField
                        label="Why"
                        value={displayValue(transition.reason)}
                      />
                    </dl>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </PackageSection>

        <PackageSection
          number="03"
          stepLabel="STEP 3"
          title="Add Voice, Text & Captions"
          description={
            steps[2].goal ||
            "Add on-screen text and captions. Scene Voiceover stays in Step 1."
          }
          copyText={step3Copy}
          step={steps[2]}
        >
          <div className="space-y-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                On-screen Text
              </p>
              {onScreenTextItems.length > 0 ? (
                <ul className="mt-3 space-y-3">
                  {onScreenTextItems.map((item) => (
                    <li
                      key={`on-screen-${item.scene}`}
                      className="flex flex-col gap-3 rounded-lg border border-slate-100 bg-slate-50 p-3 sm:flex-row sm:items-start sm:justify-between"
                    >
                      <p className="text-sm leading-7 text-slate-900">
                        <span className="mr-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Scene {item.scene}
                        </span>
                        {item.text}
                      </p>
                      <CopyButton
                        text={item.text}
                        source={`On-screen Text Scene ${item.scene}`}
                        compact
                      />
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Use the on-screen text written in each Recording Guide scene.
                </p>
              )}
            </div>
            <Fact label="Captions" value={pack.editingGuide.captions} />
            <Fact label="Text overlay" value={pack.editingGuide.textOverlay} />
            <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Voice Script copy helper
                  </p>
                  <p className="mt-1 text-sm leading-6 text-slate-600">
                    Scene Voiceover in Step 1 is what you say while filming. Copy
                    this only if you need the full script in one place.
                  </p>
                </div>
                <CopyButton text={voiceText} source="Voice Script" compact />
              </div>
            </div>
          </div>
        </PackageSection>

        <PackageSection
          number="04"
          stepLabel="STEP 4"
          title="Final Video Check"
          description={
            steps[3].goal || "Watch the finished video once before you publish."
          }
          copyText={checklistText}
          step={steps[3]}
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

        <PackageSection
          number="05"
          stepLabel="STEP 5"
          title="Publish Your Video"
          description={
            steps[4].goal || "Post with the caption, hashtags, and CTA."
          }
          copyText={publishingText}
          step={steps[4]}
        >
          <div className="space-y-4">
            <Fact label="Caption" value={pack.publishingPackage.caption} />
            <Fact
              label="Hashtags"
              value={pack.publishingPackage.hashtags.join(" ")}
            />
            <Fact
              label="CTA"
              value={pack.publishingPackage.ctaOptions.join(" ")}
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
          title="Why This Video Works"
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

function ClipCard({ clip }: { clip: VideoAssemblyClip }) {
  return (
    <li className="rounded-xl border border-slate-200 bg-slate-50 p-4 sm:p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Clip {clip.clipNumber}
          </p>
        </div>
        <div className="w-full shrink-0 sm:w-auto">
          <CopyButton
            text={formatClipCopy(clip)}
            source={`Video Assembly Clip ${clip.clipNumber}`}
            compact
          />
        </div>
      </div>
      <dl className="mt-4 space-y-3">
        <SceneField label="Source Scene" value={displayValue(clip.sourceScene)} />
        <SceneField label="Duration" value={displayValue(clip.duration)} />
        <SceneField label="Purpose" value={displayValue(clip.purpose)} />
        <SceneField
          label="Editing Instruction"
          value={displayValue(clip.editingInstruction)}
          emphasis
        />
      </dl>
    </li>
  );
}

function formatClipCopy(clip: VideoAssemblyClip): string {
  return [
    `Clip ${clip.clipNumber}`,
    `Source Scene: ${displayValue(clip.sourceScene)}`,
    `Duration: ${displayValue(clip.duration)}`,
    `Purpose: ${displayValue(clip.purpose)}`,
    `Editing Instruction: ${displayValue(clip.editingInstruction)}`,
  ].join("\n");
}

function formatTransitionCopy(transition: VideoAssemblyTransition): string {
  return [
    `${transition.fromScene} → ${transition.toScene}`,
    `Transition: ${displayValue(transition.transitionType)}`,
    `Effect: ${displayValue(transition.visualEffect)}`,
    `Duration: ${displayValue(transition.duration)}`,
    `Editing Action: ${displayValue(transition.editingAction)}`,
    `Why: ${displayValue(transition.reason)}`,
  ].join("\n");
}

function SceneCard({ scene }: { scene: RecordingScene }) {
  const fields = sceneFields(scene);

  return (
    <li className="rounded-xl border border-slate-200 bg-slate-50 p-4 sm:p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Scene {scene.scene}
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            <SceneChip label={displayValue(scene.duration)} />
            <SceneChip label={displayValue(scene.shotType)} />
          </div>
        </div>
        <div className="w-full shrink-0 sm:w-auto">
          <CopyButton
            text={formatSceneCopy(scene)}
            source={`Recording Scene ${scene.scene}`}
            compact
          />
        </div>
      </div>
      <dl className="mt-4 space-y-3">
        {fields.map((field) => (
          <SceneField
            key={field.label}
            label={field.label}
            value={field.value}
            emphasis={field.emphasis}
          />
        ))}
      </dl>
    </li>
  );
}

function sceneFields(scene: RecordingScene): {
  label: string;
  value: string;
  emphasis?: boolean;
}[] {
  return [
    { label: "Duration", value: displayValue(scene.duration) },
    { label: "Shot Type", value: displayValue(scene.shotType) },
    {
      label: "Camera Guidance",
      value: displayValue(scene.cameraGuidance ?? ""),
      emphasis: true,
    },
    { label: "What To Film", value: displayValue(scene.visual) },
    { label: "User Action", value: displayValue(scene.action) },
    {
      label: "Screen Action",
      value: displayValue(scene.screenAction ?? ""),
      emphasis: true,
    },
    { label: "Voiceover", value: displayValue(scene.audio) },
    { label: "On-screen Text", value: displayValue(scene.onScreenText) },
  ];
}

function SceneField({
  label,
  value,
  emphasis = false,
}: {
  label: string;
  value: string;
  emphasis?: boolean;
}) {
  return (
    <div
      className={`rounded-lg px-3 py-3 ${
        emphasis ? "border border-slate-200 bg-white" : "bg-transparent"
      }`}
    >
      <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </dt>
      <dd className="mt-1 break-words text-[15px] leading-7 text-slate-900">
        {value}
      </dd>
    </div>
  );
}

function SceneChip({ label }: { label: string }) {
  return (
    <span className="inline-flex min-h-8 items-center rounded-full border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-800">
      {label}
    </span>
  );
}

function formatSceneCopy(scene: RecordingScene): string {
  return [
    `Scene ${scene.scene}`,
    ...sceneFields(scene).map((field) => `${field.label}: ${field.value}`),
  ].join("\n");
}

function fallbackScene(shot: string, index: number): RecordingScene {
  return {
    scene: index + 1,
    duration: "",
    shotType: "phone",
    cameraGuidance: "",
    visual: shot,
    action: shot,
    screenAction: "",
    onScreenText: "",
    audio: "",
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
  stepLabel,
  title,
  description,
  copyText,
  children,
  featured = false,
  step,
}: {
  number: string;
  stepLabel?: string;
  title: string;
  description: string;
  copyText: string;
  children: ReactNode;
  featured?: boolean;
  step?: ExecutionStep;
}) {
  return (
    <section
      className={`rounded-xl border bg-white ${
        featured
          ? "border-slate-900 p-5 shadow-sm sm:p-6"
          : "border-slate-200 p-4 sm:p-5"
      }`}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          {stepLabel ? (
            <p
              className={`text-xs font-semibold uppercase tracking-wide ${
                featured ? "text-slate-900" : "text-slate-500"
              }`}
            >
              {stepLabel}
            </p>
          ) : null}
          <h2
            className={`font-semibold text-slate-900 ${
              featured
                ? `${stepLabel ? "mt-1" : ""} text-lg sm:text-xl`
                : `${stepLabel ? "mt-1" : ""} text-sm sm:text-base`
            }`}
          >
            {number ? <span className="mr-2 text-slate-400">{number}</span> : null}
            {title}
          </h2>
          <p className="mt-1 text-sm leading-6 text-slate-500">{description}</p>
        </div>
        <div className="w-full shrink-0 sm:w-auto">
          <CopyButton text={copyText} source={title} />
        </div>
      </div>
      {step && (step.instructions.length > 0 || step.checklist.length > 0) ? (
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {step.instructions.length > 0 ? (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Do this now
              </p>
              <ul className="mt-2 space-y-2 text-sm leading-6 text-slate-700">
                {step.instructions.map((item, index) => (
                  <li key={`${title}-instruction-${index}`}>{item}</li>
                ))}
              </ul>
            </div>
          ) : null}
          {step.checklist.length > 0 ? (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Done when
              </p>
              <ul className="mt-2 space-y-2 text-sm leading-6 text-slate-700">
                {step.checklist.map((item, index) => (
                  <li key={`${title}-done-${index}`}>{item}</li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      ) : null}
      <div className="mt-4">{children}</div>
    </section>
  );
}
