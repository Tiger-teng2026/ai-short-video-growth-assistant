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
Tune Video Strategy, Recording Guide, Voice Script, Editing Guide, Publishing Package, and Production Checklist so a stranger understands the product job and wants a walkthrough.
Emphasize one benefit a first-time viewer can grasp in seconds.
Use exactly one CTA, spoken and on-screen: ask them to comment DEMO.
Do not use "Try it free", "Start free", or "Link in bio".
Do not invent social proof, user counts, or personal founder experience.`,
  },
  {
    id: "launch-product",
    name: "Launch Product",
    description: "Create launch announcement videos.",
    prompt: `Video Goal: Launch Product.
Tune Video Strategy, Recording Guide, Voice Script, Editing Guide, Publishing Package, and Production Checklist as a first public drop.
State what is shipping, who it is for, and what to do next.
Use exactly one CTA, spoken and on-screen: ask them to follow for the next shipping update.
Do not use "Try it free", "Start free", or "Link in bio".
Do not invent waitlist numbers, press quotes, or fake launch results.`,
  },
  {
    id: "founder-brand",
    name: "Build Founder Brand",
    description: "Create founder-focused videos.",
    prompt: `Video Goal: Build Founder Brand.
Tune Video Strategy, Recording Guide, Voice Script, Editing Guide, Publishing Package, and Production Checklist toward a founder talking to other builders.
Founder perspective is allowed: speak as a builder introducing the product.
Use exactly one CTA, spoken and on-screen: ask them to follow the build.
Do not use "Try it free", "Start free", or "Link in bio".
Do not fabricate personal history, "I used to...", customer stories, or metrics the user did not provide.
If no founder background is in the input, use Problem insight → Solution → Product introduction. Do not invent a memoir.`,
  },
  {
    id: "educate",
    name: "Educate Audience",
    description: "Create educational videos for your target audience.",
    prompt: `Video Goal: Educate Audience.
Tune Video Strategy, Recording Guide, Voice Script, Editing Guide, Publishing Package, and Production Checklist toward one useful lesson.
Lead with the lesson, then show how the product supports that lesson.
Use exactly one CTA, spoken and on-screen: ask them to save this for the next time they do that job.
Do not use "Try it free", "Start free", or "Link in bio".
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
