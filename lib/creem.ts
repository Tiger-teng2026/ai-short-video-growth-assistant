import { isPaidPlan, type PaidPlan } from "@/lib/plans";

const CREEM_API_URL =
  process.env.CREEM_API_URL?.replace(/\/$/, "") || "https://test-api.creem.io";

export class CreemError extends Error {
  status: number;

  constructor(message: string, status = 500) {
    super(message);
    this.name = "CreemError";
    this.status = status;
  }
}

export async function createCreemCheckout(params: {
  plan: string;
  successUrl: string;
}): Promise<string> {
  if (!isPaidPlan(params.plan)) {
    throw new CreemError("Plan must be creator or pro.", 400);
  }

  const apiKey = process.env.CREEM_API_KEY?.trim();
  if (!apiKey) {
    throw new CreemError(
      "CREEM_API_KEY is missing. Add it to .env.local and restart the server.",
      500,
    );
  }

  const productId = getProductId(params.plan);
  if (!productId) {
    throw new CreemError(
      `CREEM_PRODUCT_ID_${params.plan.toUpperCase()} is missing. Add it to .env.local and restart the server.`,
      500,
    );
  }

  const response = await fetch(`${CREEM_API_URL}/v1/checkouts`, {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      product_id: productId,
      success_url: params.successUrl,
      metadata: {
        plan: params.plan,
      },
    }),
  });

  const payload = (await response.json().catch(() => null)) as {
    checkout_url?: string;
    checkoutUrl?: string;
    message?: string;
    error?: string;
  } | null;

  if (!response.ok) {
    throw new CreemError(
      payload?.message ||
        payload?.error ||
        `Creem checkout failed with status ${response.status}.`,
      502,
    );
  }

  const checkoutUrl = payload?.checkout_url || payload?.checkoutUrl;
  if (!checkoutUrl) {
    throw new CreemError("Creem did not return a checkout URL.", 502);
  }

  return checkoutUrl;
}

function getProductId(plan: PaidPlan): string | undefined {
  if (plan === "creator") {
    return process.env.CREEM_PRODUCT_ID_CREATOR?.trim();
  }
  return process.env.CREEM_PRODUCT_ID_PRO?.trim();
}
