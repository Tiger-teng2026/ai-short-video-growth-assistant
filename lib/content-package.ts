export type GenerateInput = {
  platform: string;
  productDescription: string;
  template: string;
  videoLength: string;
};

export type ContentPackage = {
  hooks: string[];
  script: {
    opening: string;
    body: string;
    cta: string;
  };
  shotList: string[];
  caption: string;
  hashtags: string[];
  cta: string[];
};

export type StoredContentPackage = GenerateInput & ContentPackage;

export const CONTENT_PACKAGE_STORAGE_KEY = "growth-assistant-content-package";

export function parseContentPackage(raw: unknown): ContentPackage {
  if (!raw || typeof raw !== "object") {
    throw new Error("Generated content is not a JSON object.");
  }

  const data = raw as Record<string, unknown>;
  const scriptValue = data.script;

  if (!scriptValue || typeof scriptValue !== "object") {
    throw new Error("Generated content is missing a valid script object.");
  }

  const script = scriptValue as Record<string, unknown>;
  const hooks = asStringArray(data.hooks, "hooks");
  const shotList = asStringArray(data.shotList, "shotList");
  const hashtags = asStringArray(data.hashtags, "hashtags");
  const cta = asStringArray(data.cta, "cta");

  if (hooks.length < 3) {
    throw new Error("Generated content must include 3 hooks.");
  }

  return {
    hooks: hooks.slice(0, 3),
    script: {
      opening: asNonEmptyString(script.opening, "script.opening"),
      body: asNonEmptyString(script.body, "script.body"),
      cta: asNonEmptyString(script.cta, "script.cta"),
    },
    shotList,
    caption: asNonEmptyString(data.caption, "caption"),
    hashtags,
    cta,
  };
}

export function parseJsonContent(text: string): unknown {
  const trimmed = text.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
  const payload = fenced ? fenced[1].trim() : trimmed;
  return JSON.parse(payload);
}

function asNonEmptyString(value: unknown, field: string): string {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error(`Generated content is missing ${field}.`);
  }
  return value.trim();
}

function asStringArray(value: unknown, field: string): string[] {
  if (!Array.isArray(value)) {
    throw new Error(`Generated content is missing ${field}.`);
  }

  const items = value
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim())
    .filter(Boolean);

  if (items.length === 0) {
    throw new Error(`Generated content is missing ${field}.`);
  }

  return items;
}
