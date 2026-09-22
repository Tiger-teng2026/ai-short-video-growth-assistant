import {
  parseContentPackage,
  type GenerateInput,
} from "@/lib/content-package";
import { generateJsonWithDeepSeek, DeepSeekError } from "@/lib/deepseek";
import { getGoal, goals } from "@/lib/goals";
import { buildTemplatePrompt, getTemplate, templates } from "@/lib/templates";

export const maxDuration = 60;

const allowedPlatforms = [
  "TikTok",
  "YouTube Shorts",
  "Instagram Reels",
] as const;

const allowedGoals = [
  "get-users",
  "launch-product",
  "founder-brand",
  "educate",
] as const;

const allowedTemplates = [
  "product-demo",
  "problem-solution",
  "founder-story",
  "educational-tip",
  "social-proof",
] as const;

const allowedVideoLengths = [
  "15 seconds",
  "30 seconds",
  "60 seconds",
] as const;

export async function POST(request: Request) {
  let body: Partial<GenerateInput>;

  try {
    body = (await request.json()) as Partial<GenerateInput>;
  } catch {
    return Response.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }

  const platform = body.platform?.trim();
  const productDescription = body.productDescription?.trim();
  const goal = body.goal?.trim();
  const template = body.template?.trim();
  const videoLength = body.videoLength?.trim();

  if (!platform || !productDescription || !goal || !template || !videoLength) {
    return Response.json(
      {
        error:
          "platform, productDescription, goal, template, and videoLength are required.",
      },
      { status: 400 },
    );
  }

  if (!isAllowedValue(platform, allowedPlatforms)) {
    return Response.json(
      {
        error: `Unknown platform. Use ${allowedPlatforms.join(", ")}.`,
      },
      { status: 400 },
    );
  }

  if (!isAllowedValue(goal, allowedGoals)) {
    return Response.json(
      {
        error: `Unknown goal. Use ${allowedGoals.join(", ")}.`,
      },
      { status: 400 },
    );
  }

  if (!isAllowedValue(template, allowedTemplates)) {
    return Response.json(
      {
        error: `Unknown template. Use ${allowedTemplates.join(", ")}.`,
      },
      { status: 400 },
    );
  }

  if (!isAllowedValue(videoLength, allowedVideoLengths)) {
    return Response.json(
      {
        error: `Unknown videoLength. Use ${allowedVideoLengths.join(", ")}.`,
      },
      { status: 400 },
    );
  }

  const selectedGoal = getGoal(goal);

  if (!selectedGoal) {
    return Response.json(
      {
        error: `Unknown goal. Use ${goals.map((item) => item.id).join(", ")}.`,
      },
      { status: 400 },
    );
  }

  const selectedTemplate = getTemplate(template);

  if (!selectedTemplate) {
    return Response.json(
      {
        error: `Unknown template. Use ${templates.map((item) => item.id).join(", ")}.`,
      },
      { status: 400 },
    );
  }

  const input: GenerateInput = {
    platform,
    productDescription,
    goal: selectedGoal.id,
    template: selectedTemplate.id,
    videoLength,
  };

  try {
    const { systemPrompt, userPrompt } = buildTemplatePrompt(
      selectedTemplate,
      input,
    );
    const raw = await generateJsonWithDeepSeek({ systemPrompt, userPrompt });
    const contentPackage = parseContentPackage(raw);
    return Response.json(contentPackage);
  } catch (error) {
    if (error instanceof DeepSeekError) {
      return Response.json({ error: error.message }, { status: error.status });
    }

    const message =
      error instanceof Error ? error.message : "Failed to generate content package.";

    return Response.json({ error: message }, { status: 502 });
  }
}

function isAllowedValue(value: string, allowed: readonly string[]): boolean {
  return allowed.includes(value);
}
