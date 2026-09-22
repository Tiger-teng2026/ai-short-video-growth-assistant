import {
  parseContentPackage,
  type GenerateInput,
} from "@/lib/content-package";
import { generateJsonWithDeepSeek, DeepSeekError } from "@/lib/deepseek";
import { buildTemplatePrompt, getTemplate, templates } from "@/lib/templates";

export const maxDuration = 60;

export async function POST(request: Request) {
  let body: Partial<GenerateInput>;

  try {
    body = (await request.json()) as Partial<GenerateInput>;
  } catch {
    return Response.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }

  const platform = body.platform?.trim();
  const productDescription = body.productDescription?.trim();
  const template = body.template?.trim();
  const videoLength = body.videoLength?.trim();

  if (!platform || !productDescription || !template || !videoLength) {
    return Response.json(
      {
        error:
          "platform, productDescription, template, and videoLength are required.",
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
