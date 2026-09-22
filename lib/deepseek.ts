import { parseJsonContent } from "@/lib/content-package";

const DEEPSEEK_API_URL = "https://api.deepseek.com/chat/completions";
const DEEPSEEK_MODEL = "deepseek-chat";

export class DeepSeekError extends Error {
  status: number;

  constructor(message: string, status = 500) {
    super(message);
    this.name = "DeepSeekError";
    this.status = status;
  }
}

export function getDeepSeekApiKey(): string | undefined {
  const key = process.env.DEEPSEEK_API_KEY?.trim();
  return key || undefined;
}

export async function generateJsonWithDeepSeek(params: {
  systemPrompt: string;
  userPrompt: string;
}): Promise<unknown> {
  const apiKey = getDeepSeekApiKey();

  if (!apiKey) {
    throw new DeepSeekError(
      "DEEPSEEK_API_KEY is missing. Add it to .env.local and restart the server.",
      500,
    );
  }

  const response = await fetch(DEEPSEEK_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: DEEPSEEK_MODEL,
      messages: [
        { role: "system", content: params.systemPrompt },
        { role: "user", content: params.userPrompt },
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
      max_tokens: 4096,
    }),
    signal: AbortSignal.timeout(55000),
  });

  const payload = (await response.json().catch(() => null)) as {
    error?: { message?: string };
    choices?: { message?: { content?: string } }[];
  } | null;

  if (!response.ok) {
    const message =
      payload?.error?.message ||
      `DeepSeek request failed with status ${response.status}.`;
    throw new DeepSeekError(message, 502);
  }

  const content = payload?.choices?.[0]?.message?.content;

  if (!content) {
    throw new DeepSeekError("DeepSeek returned empty content.", 502);
  }

  try {
    return parseJsonContent(content);
  } catch {
    throw new DeepSeekError("DeepSeek returned invalid JSON.", 502);
  }
}
