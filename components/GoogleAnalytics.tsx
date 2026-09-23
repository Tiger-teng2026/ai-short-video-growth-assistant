"use client";

import Script from "next/script";
import { getGaMeasurementId } from "@/lib/analytics";

export function GoogleAnalytics() {
  const measurementId = getGaMeasurementId();

  if (!measurementId) {
    return null;
  }

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
        strategy="afterInteractive"
      />
      <Script id="ga4-gtag" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          window.gtag = gtag;
          gtag('js', new Date());
          gtag('config', '${measurementId}', {
            anonymize_ip: true,
            debug_mode: /(?:^|[?&])debug_mode=true(?:&|$)/.test(location.search)
          });
        `}
      </Script>
    </>
  );
}
