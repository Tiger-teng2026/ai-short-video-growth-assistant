"use client";

import { useState } from "react";
import { trackEvent } from "@/lib/analytics";

export function CopyButton({
  text,
  source,
  compact = false,
}: {
  text: string;
  source?: string;
  compact?: boolean;
}) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(text);
      trackEvent("copy_content", source ? { source } : undefined);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-label={copied ? "Copied" : `Copy ${source ?? "content"}`}
      className={
        compact
          ? "inline-flex h-8 shrink-0 items-center justify-center rounded-md border border-slate-200 px-2.5 text-xs font-medium text-slate-600 transition-colors hover:border-slate-300 hover:text-slate-900"
          : "inline-flex h-9 w-full items-center justify-center rounded-lg border border-slate-200 px-3 text-xs font-medium text-slate-700 transition-colors hover:border-slate-300 hover:text-slate-900 sm:w-auto"
      }
    >
      {copied ? "Copied" : "Copy"}
    </button>
  );
}
