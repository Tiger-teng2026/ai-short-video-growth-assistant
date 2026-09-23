import {
  getRecordingSceneBudget,
  type GenerateInput,
} from "@/lib/content-package";
import { getGoal } from "@/lib/goals";

export type ContentTemplate = {
  id: string;
  name: string;
  description: string;
  prompt: string;
};

const jsonExample = `{
  "videoStrategy": {
    "concept": "one-sentence video idea",
    "targetViewer": "who this video is for",
    "hookStrategy": "how the first 3 seconds stop the scroll",
    "promise": "what the viewer will understand by the end",
    "ctaStrategy": "the single next step from the video goal"
  },
  "recordingGuide": [
    {
      "scene": 1,
      "duration": "0-3s",
      "shotType": "face cam",
      "cameraGuidance": "Hold the phone at eye level, arm-length away",
      "visual": "what is on camera in second 1",
      "action": "what the founder does with their hands/body",
      "screenAction": "what happens on the laptop/phone screen, or none",
      "audio": "the first spoken sentence",
      "onScreenText": "3-6 words"
    }
  ],
  "voiceScript": {
    "opening": "first spoken sentence, matches scene 1 audio",
    "body": "spoken lines for the middle scenes, in scene order",
    "cta": "the single closing CTA"
  },
  "editingGuide": {
    "pacing": "how fast to cut",
    "cuts": ["cut 1", "cut 2"],
    "textOverlay": "how to place on-screen text",
    "music": "music bed notes",
    "captions": "caption style"
  },
  "publishingPackage": {
    "caption": "ready-to-post caption",
    "hashtags": ["#SaaS"],
    "ctaOptions": ["Comment DEMO if you want this walkthrough"],
    "thumbnailText": "3-6 words for the cover",
    "firstComment": "the same single CTA"
  },
  "productionChecklist": [
    "Film scene 1 as a 0-3s hook",
    "Record each voiceover line with its scene"
  ],
  "hooks": ["hook 1", "hook 2", "hook 3"],
  "script": {
    "opening": "same as voiceScript.opening",
    "body": "same as voiceScript.body",
    "cta": "same as voiceScript.cta"
  },
  "shotList": ["Scene 1 — 0-3s — face cam — first frame + first line"],
  "caption": "same as publishingPackage.caption",
  "hashtags": ["#SaaS"],
  "cta": ["same single CTA as publishingPackage.ctaOptions"]
}`;

export const templates: ContentTemplate[] = [
  {
    id: "product-demo",
    name: "Product Demo",
    description: "Show your product in action",
    prompt: `Template: Product Demo.
Build a production blueprint a founder can film alone on a phone.
Video Strategy must name one job and one show-the-product flow.
Recording Guide must include at least one screen-recording scene.
The demo flow must be executable: 3 to 5 steps a founder can actually do with the product as described (example: type the job title, show the generated resume, point at the ATS-friendly result).
Describe screens by what the viewer sees, not by invented button labels.
Forbidden: user counts, customer results, product metrics, invented UI button names, "Try it free", "Link in bio".
Speak in second person or about the audience, not as a fake memoir.
One job, one workflow, one CTA.`,
  },
  {
    id: "problem-solution",
    name: "Problem Solution",
    description: "Explain why your product matters",
    prompt: `Template: Problem Solution.
Build a production blueprint that opens on a category pain, then shows the product as the fix.
Recording Guide should film the broken process, then an executable product walkthrough.
The walkthrough must be 3 to 5 doable steps from the product description. Do not invent button names.
Allowed: audience-level language such as "Many freelancers struggle with..."
Forbidden: personal memoir, user counts, customer results, product metrics, invented UI, "Try it free", "Link in bio".
Name the broken process in concrete terms. Do not write a generic brand ad.`,
  },
  {
    id: "founder-story",
    name: "Founder Story",
    description: "Share why you built it",
    prompt: `Template: Founder Story.
Build a production blueprint a founder can film on a phone.
If the user input includes a real founder story (why they are building it, a real origin, a real constraint): film THAT story only. Do not add facts.
If the user input does NOT include a founder story: do not invent one and do not use a placeholder line.
Instead use this structure: Problem insight → Solution → Product introduction.
Example beat: name the broken category process, show the simpler way, then introduce this product as the tool that does that job.
Forbidden: "I built this because", "I used to spend", fake clients, fake nights, fake revenue, "Share why you are building this product", "Try it free", "Link in bio".`,
  },
  {
    id: "educational-tip",
    name: "Educational Tip",
    description: "Teach your audience something useful",
    prompt: `Template: Educational Tip.
Build a production blueprint that teaches one useful industry tip in the product's domain.
The viewer should learn the tip even if they never sign up.
Then show the product supporting that tip with an executable 3-to-5-step flow. No invented button names.
Video Strategy should lead with the lesson, not the pitch.
Forbidden: invented case studies, fake customers, metrics, UI labels, "Try it free", "Link in bio".
One lesson, then one product moment.`,
  },
  {
    id: "social-proof",
    name: "Social Proof",
    description: "Show customer value",
    prompt: `Template: Social Proof.
Build a production blueprint around value, not hype.
If the user input includes a real customer case (named outcome, quote, or metric they provided): film that case only. Do not inflate it.
If NO real customer case is in the input: do not invent proof and do not use a placeholder line.
Instead use: Problem insight → Solution → Product introduction.
Show potential value from the product description with an executable walkthrough. No invented logos, users, or button names.
Forbidden: "Thousands of users love...", "my customers saved...", fake testimonials, "Show potential value", "Try it free", "Link in bio".`,
  },
];

export function getTemplate(templateRef: string): ContentTemplate | undefined {
  const key = templateRef.trim().toLowerCase();
  const slug = key.replace(/\s+/g, "-");

  return templates.find(
    (template) =>
      template.id === key ||
      template.id === slug ||
      template.name.toLowerCase() === key,
  );
}

export function buildTemplatePrompt(
  template: ContentTemplate,
  input: GenerateInput,
): { systemPrompt: string; userPrompt: string } {
  const platformRules = getPlatformRules(input.platform);
  const sceneBudget = getRecordingSceneBudget(input.videoLength);

  const systemPrompt = `You are a short-video production planner for SaaS founders who have no marketing team and will film on a phone.

Context:
The user typed a product description. Return a production blueprint they can shoot tomorrow — not a ChatGPT ad script.

Your job:
Create a ready-to-film production blueprint for TikTok, YouTube Shorts, or Instagram Reels.
Write for a founder filming alone. Every line must tell them what to point the camera at, what to do, what to say, and what text to put on screen.

Anti-fabrication rules:
- Do not invent user counts, customer results, product metrics, or UI button names.
- Do not write fake lived experience: "I built this because...", "I used to spend...", "My customers...", "I saved...".
- Do not invent founder personal stories unless the user supplied them.
- Audience pain is allowed only as a general category observation, not as a memoir.
- If the user did not supply a fact, do not state it as true.
- Never use these CTA phrases: "Try it free", "Start free", "Link in bio", "link in bio".

${template.prompt}

${getGoalContext(input.goal)}

Scene execution rules:
- Each recordingGuide scene MUST include: duration, shotType, cameraGuidance, visual (what to film), action (user action), screenAction (what happens on screen, or "none"), audio (voiceover for this scene only), onScreenText.
- Scene count for this video: ${sceneBudget.label}.
- 15 seconds = 2-3 scenes. 30 seconds = 3-4 scenes. 60 seconds = 4-6 scenes.
- Do not go outside that range.

First-scene rules:
- Scene 1 duration MUST be "0-3s".
- Scene 1 visual MUST name the exact first-second picture.
- Scene 1 audio MUST be the exact first spoken sentence.
- voiceScript.opening MUST equal scene 1 audio.

SaaS demo rules:
- When the product appears, give an executable show flow: 3 to 5 steps the founder can perform.
- Describe the flow by user actions and results on screen, never by guessed button labels.
- State which scene the product first appears in.

CTA rules:
- One CTA only. It must match the video goal.
- publishingPackage.ctaOptions must contain exactly that one CTA.
- voiceScript.cta and on-screen CTA text must match it.
- Do not offer a second CTA.

Quality rules:
- Include all six sections: Video Strategy, Recording Guide, Voice Script, Editing Guide, Publishing Package, Production Checklist.
- Voiceover is per scene, not one long paragraph.
- Editing Guide must be doable in CapCut or iPhone edit.
- Stay native to ${input.platform}.
- Match ${input.videoLength}.

Output rules:
- Return a single valid json object. No markdown. No commentary.
- Use this json shape exactly:
${jsonExample}
- recordingGuide: ${sceneBudget.label}. Scene 1 is 0-3s.
- hooks: exactly 3 distinct spoken hooks. Do not repeat the same sentence.
- script: copy voiceScript.
- shotList: one line per scene.
- caption, hashtags, and cta: copy publishingPackage. cta is a one-item array.`;

  const userPrompt = `Create a ${template.name} short-video production blueprint a solo SaaS founder can film.

SaaS product description:
${input.productDescription}

Platform:
${input.platform}

Video length:
${input.videoLength}

Required scene count:
${sceneBudget.label}

Platform rules:
${platformRules}

Template id:
${template.id}

Video goal:
${input.goal}

Use only facts in the product description. If founder background or a real customer case is missing, follow the template fallback. Do not fabricate experience, metrics, or UI labels.
Scene 1 must be 0-3s with a first-second picture and a first spoken sentence.
Give an executable product walkthrough when the product is shown.
Use one CTA from the video goal. Never write Try it free or Link in bio.

Return json only.`;

  return { systemPrompt, userPrompt };
}

function getGoalContext(goalRef: string): string {
  const goal = getGoal(goalRef);
  if (!goal) {
    return "Video Goal Context:\nNo valid goal was selected. Still follow the template and do not fabricate facts.";
  }

  return `Video Goal Context:
${goal.prompt}
Adjust Video Strategy, Recording Guide, Voice Script, Editing Guide, Publishing Package, and Production Checklist so they serve this goal.`;
}

function getPlatformRules(platform: string): string {
  const normalized = platform.toLowerCase();

  if (normalized.includes("tiktok")) {
    return [
      "TikTok: open with a pattern interrupt in the first second.",
      "Write like a native spoken comment, not an ad.",
      "Use punchy lines, on-screen text, and a setup that is easy to film on a phone.",
      "Keep jumps tight. Assume sound-off for the first second, then spoken hook.",
    ].join(" ");
  }

  if (normalized.includes("youtube") || normalized.includes("shorts")) {
    return [
      "YouTube Shorts: open with a specific outcome a SaaS founder wants.",
      "Be slightly more educational than TikTok, but still fast.",
      "Make the video easy to search and rewatch. End with a clear next step.",
      "Use on-screen text that still makes sense if someone watches muted.",
    ].join(" ");
  }

  return [
    "Instagram Reels: lead with a visual contrast the founder can film quickly.",
    "Make the caption carry the idea. Keep the spoken script clean and save-worthy.",
    "Keep the frame 9:16 with large on-screen text.",
    "End with the single video-goal CTA, not a bio link.",
  ].join(" ");
}
