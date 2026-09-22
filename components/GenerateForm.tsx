"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { UpgradeButton } from "@/components/UpgradeButton";
import { trackEvent } from "@/lib/analytics";
import {
  CONTENT_PACKAGE_STORAGE_KEY,
  parseContentPackage,
  type StoredContentPackage,
} from "@/lib/content-package";
import { templates } from "@/lib/templates";
import { goals } from "@/lib/goals";
import { canGenerateFree, recordGeneration } from "@/lib/usage";

const platforms = ["TikTok", "YouTube Shorts", "Instagram Reels"] as const;
const videoLengths = ["15 seconds", "30 seconds", "60 seconds"] as const;

const generationSteps = [
  "Analyzing your SaaS product...",
  "Creating video strategy...",
  "Writing script and recording plan...",
  "Preparing your production plan...",
];

type Platform = (typeof platforms)[number];
type VideoLength = (typeof videoLengths)[number];

export function GenerateForm() {
  const router = useRouter();
  const [platform, setPlatform] = useState<Platform>("TikTok");
  const [productDescription, setProductDescription] = useState("");
  const [goalId, setGoalId] = useState(goals[0].id);
  const [templateId, setTemplateId] = useState(templates[0].id);
  const [videoLength, setVideoLength] = useState<VideoLength>("60 seconds");
  const [error, setError] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [progressStep, setProgressStep] = useState(0);
  const [atFreeLimit, setAtFreeLimit] = useState(false);

  useEffect(() => {
    setAtFreeLimit(!canGenerateFree());
  }, []);

  useEffect(() => {
    if (!isGenerating) {
      return;
    }

    setProgressStep(1);
    const timer = window.setInterval(() => {
      setProgressStep((current) => (current < generationSteps.length ? current + 1 : current));
    }, 1800);

    return () => window.clearInterval(timer);
  }, [isGenerating]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isGenerating) {
      return;
    }
    setError("");
    trackEvent("start_generate", { template: templateId, goal: goalId, platform });

    const trimmedDescription = productDescription.trim();
    if (!trimmedDescription) {
      setError("Enter a product description.");
      return;
    }

    const selectedGoal = goals.find((item) => item.id === goalId);
    const selectedTemplate = templates.find((item) => item.id === templateId);

    if (!selectedGoal) {
      setError("Select a video goal.");
      return;
    }

    if (!selectedTemplate) {
      setError("Select a content template.");
      return;
    }

    if (!canGenerateFree()) {
      setAtFreeLimit(true);
      return;
    }

    setIsGenerating(true);
    setProgressStep(1);
    recordGeneration();

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          platform,
          productDescription: trimmedDescription,
          goal: selectedGoal.id,
          template: selectedTemplate.id,
          videoLength,
        }),
      });

      const payload = (await response.json().catch(() => null)) as
        | { error?: string }
        | null;

      if (!response.ok) {
        setError("Something went wrong. Please try again.");
        setIsGenerating(false);
        setProgressStep(0);
        return;
      }

      const contentPackage = parseContentPackage(payload);
      const stored: StoredContentPackage = {
        platform,
        productDescription: trimmedDescription,
        goal: selectedGoal.id,
        template: selectedTemplate.id,
        videoLength,
        ...contentPackage,
      };

      sessionStorage.setItem(CONTENT_PACKAGE_STORAGE_KEY, JSON.stringify(stored));
      trackEvent("generate_success", {
        template: selectedTemplate.id,
        goal: selectedGoal.id,
        platform,
      });
      setIsGenerating(false);
      setProgressStep(0);
      router.push("/result");
    } catch {
      setError("Something went wrong. Please try again.");
      setIsGenerating(false);
      setProgressStep(0);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-10">
      <section>
        <p className="text-sm font-medium text-slate-500">Step 1</p>
        <h2 className="mt-1 text-lg font-semibold text-slate-900">Platform</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {platforms.map((option) => {
            const selected = platform === option;
            return (
              <button
                key={option}
                type="button"
                disabled={isGenerating}
                onClick={() => setPlatform(option)}
                className={`rounded-xl border px-4 py-3 text-sm font-medium transition-colors ${
                  selected
                    ? "border-slate-900 bg-slate-900 text-white"
                    : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                }`}
              >
                {option}
              </button>
            );
          })}
        </div>
      </section>

      <section>
        <p className="text-sm font-medium text-slate-500">Step 2</p>
        <label
          htmlFor="product-description"
          className="mt-1 block text-lg font-semibold text-slate-900"
        >
          Product Description
        </label>
        <textarea
          id="product-description"
          name="productDescription"
          rows={5}
          value={productDescription}
          disabled={isGenerating}
          onChange={(event) => setProductDescription(event.target.value)}
          placeholder="AI tool that helps freelancers create invoices faster"
          className="mt-4 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm leading-6 text-slate-900 outline-none placeholder:text-slate-400 focus:border-slate-400 disabled:opacity-60"
        />
      </section>

      <section>
        <p className="text-sm font-medium text-slate-500">Step 3</p>
        <h2 className="mt-1 text-lg font-semibold text-slate-900">Video Goal</h2>
        <div className="mt-4 space-y-3">
          {goals.map((option) => {
            const selected = goalId === option.id;
            return (
              <button
                key={option.id}
                type="button"
                disabled={isGenerating}
                onClick={() => setGoalId(option.id)}
                className={`w-full rounded-xl border px-4 py-3 text-left transition-colors ${
                  selected
                    ? "border-slate-900 bg-slate-900 text-white"
                    : "border-slate-200 bg-white text-slate-900 hover:border-slate-300"
                }`}
              >
                <span className="block text-sm font-medium">{option.name}</span>
                <span
                  className={`mt-1 block text-sm ${
                    selected ? "text-slate-300" : "text-slate-500"
                  }`}
                >
                  {option.description}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      <section>
        <p className="text-sm font-medium text-slate-500">Step 4</p>
        <h2 className="mt-1 text-lg font-semibold text-slate-900">
          Content Template
        </h2>
        <div className="mt-4 space-y-3">
          {templates.map((option) => {
            const selected = templateId === option.id;
            return (
              <button
                key={option.id}
                type="button"
                disabled={isGenerating}
                onClick={() => setTemplateId(option.id)}
                className={`w-full rounded-xl border px-4 py-3 text-left transition-colors ${
                  selected
                    ? "border-slate-900 bg-slate-900 text-white"
                    : "border-slate-200 bg-white text-slate-900 hover:border-slate-300"
                }`}
              >
                <span className="block text-sm font-medium">{option.name}</span>
                <span
                  className={`mt-1 block text-sm ${
                    selected ? "text-slate-300" : "text-slate-500"
                  }`}
                >
                  {option.description}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      <section>
        <p className="text-sm font-medium text-slate-500">Step 5</p>
        <h2 className="mt-1 text-lg font-semibold text-slate-900">
          Video Length
        </h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {videoLengths.map((option) => {
            const selected = videoLength === option;
            return (
              <button
                key={option}
                type="button"
                disabled={isGenerating}
                onClick={() => setVideoLength(option)}
                className={`rounded-xl border px-4 py-3 text-sm font-medium transition-colors ${
                  selected
                    ? "border-slate-900 bg-slate-900 text-white"
                    : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                }`}
              >
                {option}
              </button>
            );
          })}
        </div>
      </section>

      <section>
        {atFreeLimit ? (
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <p className="text-sm font-medium text-slate-900">
              You&apos;ve reached your free limit.
            </p>
            <p className="mt-1 text-sm leading-6 text-slate-600">
              Upgrade to continue.
            </p>
            <div className="mt-5 max-w-xs">
              <UpgradeButton plan="creator" />
            </div>
          </div>
        ) : (
          <>
            <button
              type="submit"
              disabled={isGenerating}
              className="inline-flex min-h-12 items-center rounded-lg bg-slate-900 px-5 text-sm font-medium text-white transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isGenerating
                ? "Generating Your Video Plan..."
                : "Generate Content Package"}
            </button>
            {isGenerating ? (
              <ol className="mt-6 space-y-3" aria-live="polite">
                {generationSteps.map((label, index) => {
                  const step = index + 1;
                  const reached = progressStep >= step;
                  return (
                    <li key={label}>
                      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                        Step {step}:
                      </p>
                      <p
                        className={`mt-1 text-sm leading-6 ${
                          reached ? "text-slate-900" : "text-slate-400"
                        }`}
                      >
                        {label}
                      </p>
                    </li>
                  );
                })}
              </ol>
            ) : null}
            {error ? (
              <p className="mt-4 text-sm leading-6 text-red-600" role="alert">
                {error}
              </p>
            ) : null}
          </>
        )}
      </section>
    </form>
  );
}
