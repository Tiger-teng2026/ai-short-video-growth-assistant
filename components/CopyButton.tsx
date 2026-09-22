"use client";

import { useState } from "react";
import { trackEvent } from "@/lib/analytics";

export function CopyButton({
  text,
  source,
}: {
  text: string;
  source?: string;
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
      className="text-xs font-medium text-slate-500 transition-colors hover:text-slate-900"
    >
      {copied ? "Copied" : "Copy"}
    </button>
  );
}
