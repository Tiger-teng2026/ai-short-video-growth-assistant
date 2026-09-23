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

export function getVideoAssemblyClipBudget(videoLength: string): {
  min: number;
  max: number;
  label: string;
} {
  const scenes = getRecordingSceneBudget(videoLength);
  return {
    min: scenes.min,
    max: scenes.max,
    label: scenes.label.replace("scenes", "clips"),
  };
}

export type VideoAssemblyClip = {
  clipNumber: number;
  sourceScene: string;
  duration: string;
  purpose: string;
  editingInstruction: string;
};

export type VideoAssemblyTransition = {
  fromScene: string;
  toScene: string;
  transitionType: string;
  visualEffect: string;
  duration: string;
  editingAction: string;
  reason: string;
};

const DEFAULT_TRANSITION_TYPE = "Hard Cut";
const DEFAULT_TRANSITION_EFFECT = "No animation. Cut directly.";
const DEFAULT_TRANSITION_DURATION = "0 seconds";
const DEFAULT_TRANSITION_ACTION = "Cut directly to the next scene.";
const DEFAULT_TRANSITION_REASON = "Keeps the video clear and easy to follow.";

export type VideoAssembly = {
  clipOrder: VideoAssemblyClip[];
  transitions: VideoAssemblyTransition[];
};

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

export type ExecutionStep = {
  stepNumber: number;
  title: string;
  goal: string;
  instructions: string[];
  checklist: string[];
};

export type ExecutionWorkflow = {
  steps: ExecutionStep[];
};

export const EXECUTION_STEP_TITLES = [
  "Record Your Clips",
  "Put Clips Together",
  "Add Voice, Text & Captions",
  "Final Video Check",
  "Publish Your Video",
] as const;

export type ProductionBlueprint = {
  videoStrategy: VideoStrategy;
  recordingGuide: RecordingScene[];
  videoAssembly: VideoAssembly;
  voiceScript: VoiceScript;
  editingGuide: EditingGuide;
  publishingPackage: PublishingPackage;
  productionChecklist: string[];
  executionWorkflow: ExecutionWorkflow;
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
  const videoAssembly = parseVideoAssembly(
    readObject(data, ["videoAssembly", "video_assembly"]),
    recordingGuide,
  );
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

  const executionWorkflow = parseExecutionWorkflow(
    readObject(data, ["executionWorkflow", "execution_workflow"]),
    {
      scenes: recordingGuide,
      assembly: videoAssembly,
      voice: script,
      publishing: publishingPackage,
      checklist: productionChecklist,
    },
  );

  return {
    videoStrategy,
    recordingGuide,
    videoAssembly,
    voiceScript: script,
    editingGuide,
    publishingPackage,
    productionChecklist,
    executionWorkflow,
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

function parseVideoAssembly(
  raw: Record<string, unknown> | null,
  scenes: RecordingScene[],
): VideoAssembly {
  const fallback = fallbackVideoAssembly(scenes);

  if (!raw) {
    return fallback;
  }

  const clipOrder = parseAssemblyClips(
    readValue(raw, ["clipOrder", "clip_order", "clips"]),
  );
  const transitions = parseAssemblyTransitions(
    readValue(raw, ["transitions", "sceneTransitions", "scene_transitions"]),
  );

  if (clipOrder.length === 0) {
    return fallback;
  }

  return {
    clipOrder,
    transitions: transitions.length > 0 ? transitions : fallback.transitions,
  };
}

function parseAssemblyClips(raw: unknown): VideoAssemblyClip[] {
  if (!Array.isArray(raw)) {
    return [];
  }

  const clips: VideoAssemblyClip[] = [];

  raw.forEach((item, index) => {
    if (!item || typeof item !== "object") {
      return;
    }

    const row = item as Record<string, unknown>;
    const sourceScene = firstFilledString([
      row.sourceScene,
      row.source_scene,
      row.scene,
    ]);
    const purpose = firstFilledString([
      row.purpose,
      row.keep,
      row.visual,
    ]);
    const editingInstruction = firstFilledString([
      row.editingInstruction,
      row.editing_instruction,
      row.instruction,
    ]);

    if (!sourceScene || !purpose || !editingInstruction) {
      return;
    }

    clips.push({
      clipNumber:
        typeof row.clipNumber === "number" && row.clipNumber > 0
          ? row.clipNumber
          : typeof row.clip_number === "number" && row.clip_number > 0
            ? row.clip_number
            : index + 1,
      sourceScene,
      duration: firstFilledString([row.duration, row.position, row.time]) || "",
      purpose,
      editingInstruction,
    });
  });

  return clips;
}

function parseAssemblyTransitions(raw: unknown): VideoAssemblyTransition[] {
  if (!Array.isArray(raw)) {
    return [];
  }

  const transitions: VideoAssemblyTransition[] = [];

  raw.forEach((item) => {
    if (!item || typeof item !== "object") {
      return;
    }

    const row = item as Record<string, unknown>;
    const fromScene = firstFilledString([
      row.fromScene,
      row.from_scene,
      row.from,
      row.source,
      row.sourceScene,
    ]);
    const toScene = firstFilledString([
      row.toScene,
      row.to_scene,
      row.to,
      row.target,
      row.nextScene,
    ]);

    if (!fromScene || !toScene) {
      return;
    }

    const editingAction = firstFilledString([
      row.editingAction,
      row.editing_action,
      row.instruction,
      row.transition,
      row.note,
    ]);

    transitions.push({
      fromScene,
      toScene,
      transitionType:
        firstFilledString([
          row.transitionType,
          row.transition_type,
          row.type,
        ]) || DEFAULT_TRANSITION_TYPE,
      visualEffect:
        firstFilledString([
          row.visualEffect,
          row.visual_effect,
          row.effect,
        ]) || DEFAULT_TRANSITION_EFFECT,
      duration:
        firstFilledString([row.duration, row.transitionDuration]) ||
        DEFAULT_TRANSITION_DURATION,
      editingAction: editingAction || DEFAULT_TRANSITION_ACTION,
      reason:
        firstFilledString([row.reason, row.why]) || DEFAULT_TRANSITION_REASON,
    });
  });

  return transitions;
}

function fallbackVideoAssembly(scenes: RecordingScene[]): VideoAssembly {
  const clipOrder = scenes.map((scene, index) => ({
    clipNumber: index + 1,
    sourceScene: `Scene ${scene.scene}`,
    duration: scene.duration,
    purpose: scene.visual,
    editingInstruction: scene.visual
      ? `Keep ${scene.visual.replace(/\.$/, "")}. Cut extra frames and unused takes.`
      : "Keep the usable take. Cut extra frames and unused takes.",
  }));

  const transitions = scenes.slice(0, -1).map((scene, index) => {
    const next = scenes[index + 1];
    return {
      fromScene: `Scene ${scene.scene}`,
      toScene: `Scene ${next.scene}`,
      transitionType: DEFAULT_TRANSITION_TYPE,
      visualEffect: DEFAULT_TRANSITION_EFFECT,
      duration: DEFAULT_TRANSITION_DURATION,
      editingAction: DEFAULT_TRANSITION_ACTION,
      reason: DEFAULT_TRANSITION_REASON,
    };
  });

  return { clipOrder, transitions };
}

function parseExecutionWorkflow(
  raw: Record<string, unknown> | null,
  context: {
    scenes: RecordingScene[];
    assembly: VideoAssembly;
    voice: VoiceScript;
    publishing: PublishingPackage;
    checklist: string[];
  },
): ExecutionWorkflow {
  const fallback = fallbackExecutionWorkflow(context);
  const parsed = parseExecutionSteps(
    raw ? readValue(raw, ["steps"]) : undefined,
  );

  if (parsed.length === 0) {
    return fallback;
  }

  return {
    steps: fallback.steps.map((defaultStep) => {
      const match =
        parsed.find((step) => step.stepNumber === defaultStep.stepNumber) ||
        parsed.find(
          (step) =>
            step.title.toLowerCase() === defaultStep.title.toLowerCase(),
        );

      if (!match) {
        return defaultStep;
      }

      return {
        stepNumber: defaultStep.stepNumber,
        title: defaultStep.title,
        goal: match.goal || defaultStep.goal,
        instructions:
          match.instructions.length > 0
            ? match.instructions
            : defaultStep.instructions,
        checklist:
          match.checklist.length > 0 ? match.checklist : defaultStep.checklist,
      };
    }),
  };
}

function parseExecutionSteps(raw: unknown): ExecutionStep[] {
  if (!Array.isArray(raw)) {
    return [];
  }

  const steps: ExecutionStep[] = [];

  raw.forEach((item, index) => {
    if (!item || typeof item !== "object") {
      return;
    }

    const row = item as Record<string, unknown>;
    const title = firstFilledString([row.title, row.name]);
    const goal = firstFilledString([row.goal, row.purpose]);
    const instructions = firstFilledArray([
      optionalStringArray(row.instructions),
      optionalStringArray(row.actions),
    ]);
    const checklist = firstFilledArray([
      optionalStringArray(row.checklist),
      optionalStringArray(row.doneWhen),
      optionalStringArray(row.done_when),
    ]);

    if (!title && !goal && instructions.length === 0) {
      return;
    }

    steps.push({
      stepNumber:
        typeof row.stepNumber === "number" && row.stepNumber > 0
          ? row.stepNumber
          : typeof row.step_number === "number" && row.step_number > 0
            ? row.step_number
            : index + 1,
      title: title || EXECUTION_STEP_TITLES[index] || `Step ${index + 1}`,
      goal,
      instructions,
      checklist,
    });
  });

  return steps;
}

function fallbackExecutionWorkflow(context: {
  scenes: RecordingScene[];
  assembly: VideoAssembly;
  voice: VoiceScript;
  publishing: PublishingPackage;
  checklist: string[];
}): ExecutionWorkflow {
  const sceneCount = context.scenes.length || context.assembly.clipOrder.length;
  const clipCount = context.assembly.clipOrder.length || sceneCount;
  const cta = context.publishing.ctaOptions[0] || context.voice.cta;

  return {
    steps: [
      {
        stepNumber: 1,
        title: EXECUTION_STEP_TITLES[0],
        goal: "Film every scene in the Recording Guide on your phone.",
        instructions: [
          `Shoot ${sceneCount || 3} scenes in order, starting with the 0-3s hook.`,
          "For each scene, follow Camera Guidance, What To Film, and User Action.",
          "Say the scene Voiceover while you film. Do not invent extra lines.",
        ],
        checklist: context.scenes.length
          ? context.scenes.map(
              (scene) =>
                `Scene ${scene.scene} is filmed (${scene.duration || "full take"}).`,
            )
          : ["Every scene in the Recording Guide is filmed."],
      },
      {
        stepNumber: 2,
        title: EXECUTION_STEP_TITLES[1],
        goal: "Put the recorded clips in video order and make the simple switches.",
        instructions: [
          `Drop ${clipCount || 3} clips on the timeline in clip order.`,
          "Keep only what each Editing Instruction says to keep. Cut unused takes.",
          ...context.assembly.transitions
            .slice(0, 3)
            .map(
              (item) =>
                `${item.fromScene} → ${item.toScene}: ${item.editingAction}`,
            ),
        ].filter(Boolean),
        checklist: [
          "Clips are in the Video Assembly order.",
          "Each unused take is cut.",
          "Each listed scene transition is done.",
        ],
      },
      {
        stepNumber: 3,
        title: EXECUTION_STEP_TITLES[2],
        goal: "Add the spoken lines, on-screen text, and captions.",
        instructions: [
          "Use each scene Voiceover. The full Voice Script is only a copy helper.",
          "Add the on-screen text from each scene.",
          "Burn in captions so the video still works muted.",
        ],
        checklist: [
          "On-screen text from every scene is on the video.",
          "Captions are added.",
          "The closing CTA is spoken and visible.",
        ],
      },
      {
        stepNumber: 4,
        title: EXECUTION_STEP_TITLES[3],
        goal: "Watch the finished video once and confirm it is ready to post.",
        instructions: [
          "Play the video from start to end without stopping.",
          "Check the first 3 seconds, the product moment, and the CTA.",
          "Confirm every spoken line and on-screen line uses only product facts.",
        ],
        checklist: [
          "The hook lands in the first 3 seconds.",
          "The product job is clear.",
          "One CTA is spoken and on screen.",
        ],
      },
      {
        stepNumber: 5,
        title: EXECUTION_STEP_TITLES[4],
        goal: "Post the video with the caption, hashtags, and CTA.",
        instructions: [
          "Paste the caption as written.",
          `Add the hashtags: ${context.publishing.hashtags.join(" ") || "#SaaS"}.`,
          cta
            ? `Use this CTA: ${cta}`
            : "Use the single CTA from the publishing package.",
        ],
        checklist: [
          "Caption is pasted.",
          "Hashtags are added.",
          "The CTA is in the video and the first comment.",
        ],
      },
    ],
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
