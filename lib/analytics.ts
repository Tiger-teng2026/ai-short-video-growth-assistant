export const analyticsEvents = [
  "landing_view",
  "start_generate",
  "generate_success",
  "view_result",
  "copy_content",
  "pricing_view",
  "checkout_click",
] as const;

export type AnalyticsEvent = (typeof analyticsEvents)[number];

const ANALYTICS_STORAGE_KEY = "growth-assistant-analytics";

export function getGaMeasurementId(): string {
  const raw = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim() || "";
  return /^G-[A-Z0-9]+$/i.test(raw) ? raw : "";
}

export function trackEvent(
  event: AnalyticsEvent,
  properties?: Record<string, string>,
): void {
  if (typeof window === "undefined") {
    return;
  }

  const params = sanitizeParams(properties);
  sendToGa4(event, params);

  const payload = {
    event,
    timestamp: new Date().toISOString(),
    ...params,
  };

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

function sanitizeParams(
  properties?: Record<string, string>,
): Record<string, string> {
  if (!properties) {
    return {};
  }

  const blocked = new Set([
    "productdescription",
    "description",
    "email",
    "apikey",
    "key",
  ]);

  return Object.fromEntries(
    Object.entries(properties).filter(([key, value]) => {
      if (!value || blocked.has(key.toLowerCase())) {
        return false;
      }
      return value.length < 120;
    }),
  );
}

function sendToGa4(event: AnalyticsEvent, params: Record<string, string>): void {
  const measurementId = getGaMeasurementId();
  if (!measurementId) {
    return;
  }

  window.dataLayer = window.dataLayer || [];
  window.gtag =
    window.gtag ||
    function gtag() {
      // Official gtag queue uses the Arguments object.
      // eslint-disable-next-line prefer-rest-params
      window.dataLayer.push(arguments);
    };

  window.gtag("event", event, params);
}

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag: (...args: unknown[]) => void;
  }
}
