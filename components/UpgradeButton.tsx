"use client";

import { useState } from "react";
import { trackEvent } from "@/lib/analytics";
import type { PaidPlan } from "@/lib/plans";

export function UpgradeButton({
  plan,
  className,
}: {
  plan: PaidPlan;
  className?: string;
}) {
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleUpgrade() {
    setError("");
    setIsLoading(true);
    trackEvent("checkout_click", { plan });

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ plan }),
      });

      const payload = (await response.json().catch(() => null)) as {
        checkoutUrl?: string;
        error?: string;
      } | null;

      if (!response.ok || !payload?.checkoutUrl) {
        setError(payload?.error || "Unable to start checkout.");
        return;
      }

      window.location.assign(payload.checkoutUrl);
    } catch {
      setError("Unable to start checkout.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleUpgrade}
        disabled={isLoading}
        className={
          className ||
          "inline-flex h-11 w-full items-center justify-center rounded-lg bg-slate-900 px-4 text-sm font-medium text-white transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
        }
      >
        {isLoading ? "Redirecting..." : "Upgrade"}
      </button>
      {error ? (
        <p className="mt-3 text-sm leading-6 text-red-600" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
