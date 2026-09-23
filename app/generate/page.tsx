import type { Metadata } from "next";
import { GenerateForm } from "@/components/GenerateForm";

export const metadata: Metadata = {
  title: "Create Your Video Production Blueprint",
  description:
    "Enter a SaaS product and generate a Video Strategy, Recording Guide, Voice Script, Editing Guide, and Publishing Package.",
};

export default function GeneratePage() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
        Create Your Video Production Blueprint
      </h1>
      <p className="mt-3 text-slate-600 leading-7">
        Enter your SaaS product, pick a goal and template, and get a filming
        plan you can shoot on a phone.
      </p>
      <p className="mt-3 text-sm font-medium leading-6 text-slate-700">
        No video experience needed.
      </p>
      <ul className="mt-5 space-y-2 text-sm leading-6 text-slate-600">
        <li>Video Strategy</li>
        <li>Recording Guide</li>
        <li>Voice Script</li>
        <li>Editing Guide</li>
        <li>Publishing Package</li>
      </ul>
      <div className="mt-10">
        <GenerateForm />
      </div>
    </div>
  );
}
