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
        src={`/gtag/js?id=${measurementId}`}
        strategy="afterInteractive"
      />
      <Script id="ga4-gtag" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          window.gtag = gtag;
          gtag('js', new Date());
          var debugMode = /(?:^|[?&])debug_mode=true(?:&|$)/.test(location.search);
          if (debugMode) {
            gtag('set', { debug_mode: true });
          }
          var config = {
            anonymize_ip: true,
            transport_url: location.origin
          };
          if (debugMode) {
            config.debug_mode = true;
          }
          gtag('config', '${measurementId}', config);
        `}
      </Script>
    </>
  );
}
