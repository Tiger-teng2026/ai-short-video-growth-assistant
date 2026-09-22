import { createCreemCheckout, CreemError } from "@/lib/creem";

export const maxDuration = 30;

export async function POST(request: Request) {
  let plan = "";

  try {
    const body = (await request.json()) as { plan?: string };
    plan = body.plan?.trim() || "";
  } catch {
    return Response.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }

  const origin = getRequestOrigin(request);
  const successUrl = `${origin}/generate`;

  try {
    const checkoutUrl = await createCreemCheckout({ plan, successUrl });
    return Response.json({ checkoutUrl });
  } catch (error) {
    if (error instanceof CreemError) {
      return Response.json({ error: error.message }, { status: error.status });
    }

    return Response.json(
      { error: "Failed to create checkout session." },
      { status: 502 },
    );
  }
}

function getRequestOrigin(request: Request): string {
  const appUrl = process.env.APP_URL?.replace(/\/$/, "");
  if (appUrl) {
    return appUrl;
  }

  return new URL(request.url).origin;
}
