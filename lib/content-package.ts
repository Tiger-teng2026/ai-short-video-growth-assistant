export type GenerateInput = {
  platform: string;
  productDescription: string;
  goal: string;
  template: string;
  videoLength: string;
};

export type VoiceScript = {
  opening: string;
  body: string;
  cta: string;
};

export type VideoStrategy = {
  concept: string;
  targetViewer: string;
  hookStrategy: string;
  promise: string;
  ctaStrategy: string;
};

export type RecordingScene = {
  scene: number;
  duration: string;
  shotType: string;
  cameraGuidance?: string;
  visual: string;
  action: string;
  screenAction?: string;
  audio: string;
  onScreenText: string;
};

export function getRecordingSceneBudget(videoLength: string): {
  min: number;
  max: number;
  label: string;
} {
  const normalized = videoLength.toLowerCase();
  if (normalized.includes("15")) {
    return { min: 2, max: 3, label: "2-3 scenes" };
  }
  if (normalized.includes("60")) {
    return { min: 4, max: 6, label: "4-6 scenes" };
  }
  return { min: 3, max: 4, label: "3-4 scenes" };
}

export type EditingGuide = {
  pacing: string;
  cuts: string[];
  textOverlay: string;
  music: string;
  captions: string;
};

export type PublishingPackage = {
  caption: string;
  hashtags: string[];
  ctaOptions: string[];
  thumbnailText: string;
  firstComment: string;
};

export type ProductionBlueprint = {
  videoStrategy: VideoStrategy;
  recordingGuide: RecordingScene[];
  voiceScript: VoiceScript;
  editingGuide: EditingGuide;
  publishingPackage: PublishingPackage;
  productionChecklist: string[];
};

export type ContentPackage = ProductionBlueprint & {
  hooks: string[];
  script: VoiceScript;
  shotList: string[];
  caption: string;
  hashtags: string[];
  cta: string[];
};

export type StoredContentPackage = GenerateInput & ContentPackage;

export const CONTENT_PACKAGE_STORAGE_KEY = "growth-assistant-content-package";

const DEFAULT_EDITING_GUIDE: EditingGuide = {
  pacing: "Keep cuts tight. Hold the hook, then move with each spoken beat.",
  cuts: [
    "Cut on the opening hook",
    "Cut to the product or broken process",
    "Hold the spoken CTA on screen",
  ],
  textOverlay: "Use the on-screen text from each recording scene.",
  music: "Keep music under speech and lift slightly on the CTA.",
  captions: "Add burned-in captions so the video works muted.",
};

const DEFAULT_CHECKLIST = [
  "Confirm every line uses only facts from the product description",
  "Film the hook in the first 3 seconds",
  "Record the voice script in scene order",
  "Add on-screen text from the recording guide",
  "Cut to the editing guide pacing",
  "Post the caption, hashtags, and CTA together",
];

export function parseContentPackage(raw: unknown): ContentPackage {
  if (!raw || typeof raw !== "object") {
    throw new Error("Generated content is not a JSON object.");
  }

  const data = raw as Record<string, unknown>;
  const strategyRaw = readObject(data, ["videoStrategy", "video_strategy"]);
  const scriptRaw =
    readObject(data, ["voiceScript", "voice_script", "script"]) || {};
  const publishingRaw =
    readObject(data, ["publishingPackage", "publishing_package"]) || {};
  const editingRaw = readObject(data, ["editingGuide", "editing_guide"]);

  const hooks = firstFilledArray([
    optionalStringArray(strategyRaw?.hooks),
    optionalStringArray(data.hooks),
  ]);

  if (hooks.length < 3) {
    throw new Error("Generated content must include 3 hooks.");
  }

  const script: VoiceScript = {
    opening: requiredString(
      firstFilledString([
        scriptRaw.opening,
        data.opening,
      ]),
      "voiceScript.opening",
    ),
    body: requiredString(
      firstFilledString([scriptRaw.body, data.body]),
      "voiceScript.body",
    ),
    cta: requiredString(
      firstFilledString([scriptRaw.cta, data.spokenCta]),
      "voiceScript.cta",
    ),
  };

  const recordingGuide = parseRecordingGuide(
    readArray(data, [
      "recordingGuide",
      "recording_guide",
      "scenes",
      "shotList",
    ]),
  );

  if (recordingGuide.length === 0) {
    throw new Error("Generated content must include a recording guide.");
  }

  const shotList = firstFilledArray([
    optionalStringArray(data.shotList),
    recordingGuide.map(formatSceneLine),
  ]);

  if (shotList.length === 0) {
    throw new Error("Generated content is missing shotList.");
  }

  const caption = requiredString(
    firstFilledString([publishingRaw.caption, data.caption]),
    "publishingPackage.caption",
  );
  const hashtags = firstFilledArray([
    optionalStringArray(publishingRaw.hashtags),
    optionalStringArray(data.hashtags),
  ]).map(normalizeHashtag);

  if (hashtags.length === 0) {
    throw new Error("Generated content is missing hashtags.");
  }

  const cta = firstFilledArray([
    optionalStringArray(publishingRaw.ctaOptions),
    optionalStringArray(publishingRaw.cta),
    optionalStringArray(data.cta),
  ]);

  if (cta.length === 0) {
    throw new Error("Generated content is missing cta options.");
  }

  const videoStrategy: VideoStrategy = {
    concept: firstFilledString([
      strategyRaw?.concept,
      hooks[0],
    ]) || hooks[0],
    targetViewer: firstFilledString([
      strategyRaw?.targetViewer,
      strategyRaw?.target_viewer,
    ]) || "SaaS buyers who need this product job done.",
    hookStrategy: firstFilledString([
      strategyRaw?.hookStrategy,
      strategyRaw?.hook_strategy,
    ]) || "Open on a concrete product pain in the first 3 seconds.",
    promise: firstFilledString([strategyRaw?.promise]) || script.body,
    ctaStrategy: firstFilledString([
      strategyRaw?.ctaStrategy,
      strategyRaw?.cta_strategy,
    ]) || script.cta,
  };

  const editingGuide = parseEditingGuide(editingRaw);
  const publishingPackage: PublishingPackage = {
    caption,
    hashtags,
    ctaOptions: cta,
    thumbnailText: firstFilledString([
      publishingRaw.thumbnailText,
      publishingRaw.thumbnail_text,
      hooks[0],
    ]) || hooks[0],
    firstComment: firstFilledString([
      publishingRaw.firstComment,
      publishingRaw.first_comment,
      cta[0],
    ]) || cta[0],
  };

  const productionChecklist = firstFilledArray([
    optionalStringArray(
      readValue(data, ["productionChecklist", "production_checklist"]),
    ),
    DEFAULT_CHECKLIST,
  ]);

  return {
    videoStrategy,
    recordingGuide,
    voiceScript: script,
    editingGuide,
    publishingPackage,
    productionChecklist,
    hooks: hooks.slice(0, 3),
    script,
    shotList,
    caption,
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

function parseRecordingGuide(raw: unknown[] | null): RecordingScene[] {
  if (!raw) {
    return [];
  }

  const scenes: RecordingScene[] = [];

  raw.forEach((item, index) => {
    if (typeof item === "string" && item.trim()) {
      const visual = item.trim();
      scenes.push({
        scene: index + 1,
        duration: "",
        shotType: "phone",
        cameraGuidance: "Hold the phone at eye level.",
        visual,
        action: visual,
        screenAction: "",
        onScreenText: "",
        audio: "",
      });
      return;
    }

    if (!item || typeof item !== "object") {
      return;
    }

    const row = item as Record<string, unknown>;
    const visual = firstFilledString([
      row.visual,
      row.whatToFilm,
      row.what_to_film,
      row.action,
      row.description,
    ]);

    if (!visual) {
      return;
    }

    scenes.push({
      scene: typeof row.scene === "number" && row.scene > 0 ? row.scene : index + 1,
      duration: firstFilledString([row.duration, row.time]) || "",
      shotType:
        firstFilledString([row.shotType, row.shot_type, row.type]) || "phone",
      cameraGuidance:
        firstFilledString([
          row.cameraGuidance,
          row.camera_guidance,
          row.camera,
        ]) || "Hold the phone at eye level.",
      visual,
      action: firstFilledString([row.action, row.userAction, row.user_action]) || visual,
      screenAction:
        firstFilledString([
          row.screenAction,
          row.screen_action,
          row.screen,
        ]) || "",
      audio:
        firstFilledString([
          row.audio,
          row.voiceover,
          row.voice,
          row.line,
        ]) || "",
      onScreenText:
        firstFilledString([
          row.onScreenText,
          row.on_screen_text,
          row.text,
        ]) || "",
    });
  });

  return scenes;
}

function parseEditingGuide(raw: Record<string, unknown> | null): EditingGuide {
  if (!raw) {
    return DEFAULT_EDITING_GUIDE;
  }

  const cuts = firstFilledArray([
    optionalStringArray(raw.cuts),
    DEFAULT_EDITING_GUIDE.cuts,
  ]);

  return {
    pacing: firstFilledString([raw.pacing]) || DEFAULT_EDITING_GUIDE.pacing,
    cuts,
    textOverlay:
      firstFilledString([raw.textOverlay, raw.text_overlay]) ||
      DEFAULT_EDITING_GUIDE.textOverlay,
    music: firstFilledString([raw.music]) || DEFAULT_EDITING_GUIDE.music,
    captions:
      firstFilledString([raw.captions, raw.subtitles]) ||
      DEFAULT_EDITING_GUIDE.captions,
  };
}

function formatSceneLine(scene: RecordingScene): string {
  const parts = [
    `Scene ${scene.scene}`,
    scene.duration ? scene.duration : null,
    scene.shotType,
    scene.cameraGuidance ? `Camera: ${scene.cameraGuidance}` : null,
    scene.visual,
    scene.action ? `Action: ${scene.action}` : null,
    scene.screenAction ? `Screen: ${scene.screenAction}` : null,
    scene.onScreenText ? `On-screen: ${scene.onScreenText}` : null,
    scene.audio ? `Voiceover: ${scene.audio}` : null,
  ].filter(Boolean);

  return parts.join(" — ");
}

function normalizeHashtag(tag: string): string {
  return tag.startsWith("#") ? tag : `#${tag}`;
}

function readObject(
  data: Record<string, unknown>,
  keys: string[],
): Record<string, unknown> | null {
  for (const key of keys) {
    const value = data[key];
    if (value && typeof value === "object" && !Array.isArray(value)) {
      return value as Record<string, unknown>;
    }
  }

  return null;
}

function readArray(
  data: Record<string, unknown>,
  keys: string[],
): unknown[] | null {
  for (const key of keys) {
    const value = data[key];
    if (Array.isArray(value)) {
      return value;
    }
  }

  return null;
}

function readValue(
  data: Record<string, unknown>,
  keys: string[],
): unknown {
  for (const key of keys) {
    if (key in data) {
      return data[key];
    }
  }

  return undefined;
}

function optionalStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim())
    .filter(Boolean);
}

function firstFilledArray(candidates: string[][]): string[] {
  return candidates.find((items) => items.length > 0) || [];
}

function firstFilledString(values: unknown[]): string {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }

  return "";
}

function requiredString(value: string, field: string): string {
  if (!value) {
    throw new Error(`Generated content is missing ${field}.`);
  }

  return value;
}
