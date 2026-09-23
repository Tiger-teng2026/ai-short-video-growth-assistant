export const SITE_NAME = "Production Assistant";
export const SITE_TAGLINE = "AI Short Video Production Assistant";
export const SITE_DESCRIPTION =
  "Help SaaS founders and product creators turn a product idea into a professional short-video production blueprint.";

export function getSiteUrl(): string {
  const fromEnv = process.env.APP_URL?.trim().replace(/\/$/, "");
  if (fromEnv) {
    return fromEnv;
  }

  const productionHost = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
  if (productionHost) {
    return withHttps(productionHost);
  }

  const vercelHost = process.env.VERCEL_URL?.trim();
  if (vercelHost) {
    return withHttps(vercelHost);
  }

  return "http://localhost:3000";
}

function withHttps(host: string): string {
  if (host.startsWith("http://") || host.startsWith("https://")) {
    return host.replace(/\/$/, "");
  }
  return `https://${host.replace(/\/$/, "")}`;
}
