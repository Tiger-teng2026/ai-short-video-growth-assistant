export const paidPlans = ["creator", "pro"] as const;

export type PaidPlan = (typeof paidPlans)[number];

export function isPaidPlan(value: string): value is PaidPlan {
  return paidPlans.includes(value as PaidPlan);
}

export const plans = [
  {
    id: "free",
    name: "Free",
    price: "$0",
    period: "",
    description: "Try the founder video production workflow.",
    features: [
      "3 production blueprints per day",
      "All 5 video formats",
      "Video Strategy, Recording Guide, Voice Script, Editing Guide, and Publishing Package",
    ],
  },
  {
    id: "creator",
    name: "Creator",
    price: "$9",
    period: "/month",
    description: "For founders posting every week.",
    features: [
      "More room to ship short-form videos",
      "All video production workflows",
      "Ready-to-film production blueprints for TikTok, Shorts, and Reels",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    price: "$19",
    period: "/month",
    description: "For founders posting more often.",
    features: [
      "Higher-volume video production workflow",
      "All video production workflows",
      "Best for daily publishing",
    ],
  },
] as const;
