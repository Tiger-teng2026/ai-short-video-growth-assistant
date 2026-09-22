"use client";

import { useEffect } from "react";
import { trackEvent, type AnalyticsEvent } from "@/lib/analytics";

export function TrackPageEvent({
  event,
}: {
  event: Extract<AnalyticsEvent, "landing_view" | "pricing_view">;
}) {
  useEffect(() => {
    trackEvent(event);
  }, [event]);

  return null;
}
