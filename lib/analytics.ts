export const analyticsEvents = [
  "click_generate",
  "start_generation",
  "view_result",
  "copy_content",
  "click_upgrade",
] as const;

export type AnalyticsEvent = (typeof analyticsEvents)[number];

const ANALYTICS_STORAGE_KEY = "growth-assistant-analytics";

export function trackEvent(
  event: AnalyticsEvent,
  properties?: Record<string, string>,
): void {
  if (typeof window === "undefined") {
    return;
  }

  const payload = {
    event,
    timestamp: new Date().toISOString(),
    ...properties,
  };

  console.info("[analytics]", payload);

  try {
    const raw = window.localStorage.getItem(ANALYTICS_STORAGE_KEY);
    const existing = raw ? (JSON.parse(raw) as unknown[]) : [];
    const next = Array.isArray(existing) ? existing.slice(-99) : [];
    next.push(payload);
    window.localStorage.setItem(ANALYTICS_STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Analytics should never block the product flow.
  }
}
