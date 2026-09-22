import type { GenerateInput } from "@/lib/content-package";

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
    "body": "problem, product demo, proof",
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
Film one real workflow on screen. Do not list features. Do not write a generic SaaS ad.
Show the before state, the exact click-path in the product, and the finished result.
Spoken lines must match what the viewer sees. Write as if an AI SaaS founder is recording their own laptop and face cam.
Keep the demo specific to the product described. One job, one outcome, one CTA.`,
  },
  {
    id: "problem-solution",
    name: "Problem Solution",
    description: "Explain why your product matters",
    prompt: `Template: Problem Solution.
Open on a sharp, specific pain a founder or freelancer actually feels. Quantify the cost: time lost, unpaid work, awkward follow-ups, broken process.
Then introduce the product as the fix, not as a brand slogan.
Do not skip the problem. Do not use vague lines like "level up your workflow".
The viewer should think "that is my current mess" before they see the product.`,
  },
  {
    id: "founder-story",
    name: "Founder Story",
    description: "Share why you built it",
    prompt: `Template: Founder Story.
Write in first person, as the indie hacker who built this product.
Use one concrete origin moment: the night, the client, the spreadsheet, the invoice that broke you.
Explain why existing tools were not enough, then why you built this instead.
Stay human and specific. No hustle-porn, no origin-myth cliches, no "I quit my 9-5 to change the world".
End with the product as the thing you wish you had when you started.`,
  },
  {
    id: "educational-tip",
    name: "Educational Tip",
    description: "Teach your audience something useful",
    prompt: `Template: Educational Tip.
Teach one useful, concrete tip related to the product's domain. The viewer should learn something even if they never sign up.
Then show how the product makes that tip easier or automatic.
Do not lecture. Do not dump a carousel of 7 tips. One lesson, one example, one product moment.
Write for AI SaaS founders and their users: practical, specific, short-form native.`,
  },
  {
    id: "social-proof",
    name: "Social Proof",
    description: "Show customer value",
    prompt: `Template: Social Proof.
Show a specific customer outcome: time saved, invoices sent same day, paid faster, fewer follow-ups.
Write as a founder sharing a real user result, not as a testimonial ad.
Do not invent famous brands or fake company names. Use a replaceable proof pattern a founder can swap with their real numbers, e.g. a freelance designer who used to invoice two days late.
Show before vs after. Keep it believable and easy to film.`,
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
The user is an indie hacker promoting their SaaS product. Write for AI SaaS founders and indie hackers — not generic marketers, agencies, or consumer brands.

Your job:
Create a ready-to-film short video package for TikTok, YouTube Shorts, or Instagram Reels.
The output must be specific to the product they described. Do not write vague growth slogans or generic "build in public" filler.

${template.prompt}

Quality rules:
- Hook must earn attention in the first 3 seconds.
- Lead with a sharp user pain or a specific founder moment, then show the product value.
- Include a clear CTA a founder can say on camera and put on screen.
- Write spoken lines that a founder can film without a content team.
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

Return json only.`;

  return { systemPrompt, userPrompt };
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
