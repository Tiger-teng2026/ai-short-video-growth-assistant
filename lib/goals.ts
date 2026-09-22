export type VideoGoal = {
  id: string;
  name: string;
  description: string;
  prompt: string;
};

export const goals: VideoGoal[] = [
  {
    id: "get-users",
    name: "Get First Users",
    description: "Create videos designed to attract your first users.",
    prompt: `Video Goal: Get First Users.
Tune Hook, Script, Shot List, and Caption to win a first signup.
Emphasize the product benefit a stranger can understand in seconds.
End with a clear CTA: try it, start free, or link in bio.
Do not invent social proof, user counts, or personal founder experience.`,
  },
  {
    id: "launch-product",
    name: "Launch Product",
    description: "Create launch announcement videos.",
    prompt: `Video Goal: Launch Product.
Tune Hook, Script, Shot List, and Caption as a launch announcement.
State what is shipping, who it is for, and what to do next.
Keep the energy of a first public drop, not a feature dump.
Do not invent waitlist numbers, press quotes, or fake launch results.`,
  },
  {
    id: "founder-brand",
    name: "Build Founder Brand",
    description: "Create founder-focused content.",
    prompt: `Video Goal: Build Founder Brand.
Tune Hook, Script, Shot List, and Caption toward founder-facing content.
Founder perspective is allowed: speak as a builder introducing the product.
Do not fabricate personal history, "I used to...", customer stories, or metrics the user did not provide.
If no founder background is in the input, keep the voice as a founder filming a plan, not a memoir.`,
  },
  {
    id: "educate",
    name: "Educate Audience",
    description: "Create educational content for your target audience.",
    prompt: `Video Goal: Educate Audience.
Tune Hook, Script, Shot List, and Caption toward teaching value.
Lead with one useful lesson in the product's domain, then show how the product supports that lesson.
The viewer should learn something even if they never sign up.
Do not invent case studies or fake results.`,
  },
];

export function getGoal(goalRef: string): VideoGoal | undefined {
  const key = goalRef.trim().toLowerCase();
  const slug = key.replace(/\s+/g, "-");

  return goals.find(
    (goal) =>
      goal.id === key ||
      goal.id === slug ||
      goal.name.toLowerCase() === key,
  );
}
