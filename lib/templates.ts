import type { GenerateInput } from "@/lib/content-package";
import { getGoal } from "@/lib/goals";

export type ContentTemplate = {
  id: string;
  name: string;
  description: string;
  prompt: string;
};

const jsonExample = `{
  "hooks": ["hook 1", "hook 2", "hook 3"],
  "script": {
    "opening": "first 3 seconds",
    "body": "problem, product, next step",
    "cta": "spoken close"
  },
  "shotList": ["Shot 1: visual + on-screen text"],
  "caption": "ready-to-post caption",
  "hashtags": ["#SaaS"],
  "cta": ["Try it free — link in bio"]
}`;

export const templates: ContentTemplate[] = [
  {
    id: "product-demo",
    name: "Product Demo",
    description: "Show your product in action",
    prompt: `Template: Product Demo.
Write a filming plan that shows the product in action.
Allowed: the user pain this product addresses, the product's functions, and a clear click-path / usage flow.
Speak in second person or about the audience ("freelancers still build invoices by hand"), not as a fake memoir.
Forbidden: first-person origin claims such as "I built this because", "I used to spend", "I saved".
Do not invent founder history, customers, revenue, user counts, or time saved.
Keep the demo specific to the product described. One job, one workflow, one CTA.`,
  },
  {
    id: "problem-solution",
    name: "Problem Solution",
    description: "Explain why your product matters",
    prompt: `Template: Problem Solution.
Open on a category pain, then show why this product is the fix.
Allowed: audience-level language such as "Many freelancers struggle with..."
Forbidden: personal claims such as "I had this problem", "I used to spend", "my customers".
Do not invent founder history, customer results, revenue, user counts, or time saved.
Name the broken process in concrete terms, then show how the product changes that process.
Do not write a generic brand ad.`,
  },
  {
    id: "founder-story",
    name: "Founder Story",
    description: "Share why you built it",
    prompt: `Template: Founder Story.
This template may use a personal story ONLY if the user input already includes founder background (why they are building it, a real origin, a real constraint).
If the input has founder background: turn THAT material into a filmable first-person story. Do not add extra facts.
If the input does NOT include founder background: do not invent one. Fill hooks, script.opening, and the core spoken line with exactly: "Share why you are building this product".
The rest of the package should be a filming plan that asks the founder to say their real reason on camera, tied only to the product description.
Forbidden when background is missing: "I built this because", "I used to spend", fake clients, fake nights, fake revenue.
No hustle-porn and no origin-myth cliches.`,
  },
  {
    id: "educational-tip",
    name: "Educational Tip",
    description: "Teach your audience something useful",
    prompt: `Template: Educational Tip.
Teach one useful industry tip in the product's domain. The viewer should learn something even if they never sign up.
Then show how this product supports that practice.
Allowed: educational advice about the category (invoicing, freelance ops, SaaS workflow).
Forbidden: invented case studies, fake customers, "I saved", "my users", made-up numbers.
Do not lecture. One lesson, then one product moment. Keep it practical and short-form native.`,
  },
  {
    id: "social-proof",
    name: "Social Proof",
    description: "Show customer value",
    prompt: `Template: Social Proof.
Use a customer result ONLY if the user input includes a real customer case (named outcome, quote, or metric they provided).
If a real case is present: film that case. Do not inflate it.
If NO real customer case is in the input: do not invent proof. Fill hooks, script.opening, and the core spoken line with exactly: "Show potential value".
The rest of the package should be a filming plan that shows the product's potential value from the product description only.
Forbidden: "Thousands of users love...", "my customers saved...", fake logos, fake revenue, fake user counts, placeholder testimonials.`,
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

  const systemPrompt = `You are an expert SaaS founder content strategist.

Context:
The user is an indie hacker who entered a product description. Treat the output as a short-video production plan they can film — not generic AI marketing copy.

Your job:
Create a ready-to-film short video package for TikTok, YouTube Shorts, or Instagram Reels.
Use only facts present in the user input. If founder background, customer results, or metrics are not provided, do not invent them.

Anti-fabrication rules:
- Do not write fake lived experience: "I built this because...", "I used to spend...", "My customers...", "I saved...".
- Do not invent founder personal stories, customer results, revenue numbers, user numbers, or time saved.
- Audience pain is allowed only as a general observation grounded in the product category, not as the founder's memoir.
- If the user did not supply a fact, do not state it as true.

${template.prompt}

${getGoalContext(input.goal)}

Quality rules:
- Hook must earn attention in the first 3 seconds.
- Lead with a concrete user pain or product action, then show what the product does.
- Include a clear CTA a founder can say on camera and put on screen.
- Write spoken lines a founder can film without a content team.
- Keep language concrete: who it is for, what is broken, what the product does, what to do next.
- Match the requested video length. Do not write a 15-second script for a 60-second video, or the reverse.
- Stay native to ${input.platform}.

Output rules:
- Return a single valid json object. No markdown. No commentary.
- Use this json shape exactly:
${jsonExample}
- hooks: exactly 3 distinct spoken hooks.
- script.opening: the first 3 seconds.
- script.body: the middle of the video.
- script.cta: the closing spoken CTA.
- shotList: scene-by-scene filming notes, including visual and on-screen text.
- caption: one ready-to-post caption.
- hashtags: relevant short-form hashtags, each starting with #.
- cta: 2 to 4 short CTA options for on-screen text, comments, or the caption.`;

  const userPrompt = `Create a ${template.name} short video package.

SaaS product description:
${input.productDescription}

Platform:
${input.platform}

Video length:
${input.videoLength}

Platform rules:
${platformRules}

Template id:
${template.id}

Video goal:
${input.goal}

Use only facts in the product description above. If founder background or a real customer case is missing, follow the template fallback. Do not fabricate experience.
Adjust Hook, Script, Shot List, and Caption to the video goal.

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
Adjust Hook, Script, Shot List, and Caption so they serve this goal.`;
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
    "Make the caption carry the offer. Keep the spoken script clean and save-worthy.",
    "Keep the frame 9:16 with large on-screen text.",
    "End with a simple follow / link-in-bio CTA.",
  ].join(" ");
}
