import type { Metadata } from "next";
import { GenerateForm } from "@/components/GenerateForm";

export const metadata: Metadata = {
  title: "Generate",
  description:
    "Create a ready-to-film TikTok, YouTube Shorts, or Reels content package from one SaaS product idea.",
};

export default function GeneratePage() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
        Generate a content package
      </h1>
      <p className="mt-3 text-slate-600 leading-7">
        Choose a platform, set a video goal, pick a template, and turn a product
        idea into a ready-to-film short video package.
      </p>
      <div className="mt-10">
        <GenerateForm />
      </div>
    </div>
  );
}
