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
    description: "Try the founder content workflow.",
    features: [
      "3 content packages per day",
      "All 5 founder templates",
      "Hook, script, shot list, and caption",
    ],
  },
  {
    id: "creator",
    name: "Creator",
    price: "$9",
    period: "/month",
    description: "For founders posting every week.",
    features: [
      "More room to ship short-form content",
      "All founder content workflows",
      "Ready-to-film packages for TikTok, Shorts, and Reels",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    price: "$19",
    period: "/month",
    description: "For founders posting more often.",
    features: [
      "Higher-volume content workflow",
      "All founder content workflows",
      "Best for daily publishing",
    ],
  },
] as const;
