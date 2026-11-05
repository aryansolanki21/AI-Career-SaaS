export type PlanId = "free" | "pro_monthly" | "pro_six_month";

export type ProPlanId = Exclude<PlanId, "free">;

export interface PricingPlan {
  id: PlanId;
  name: string;
  price: string;
  period: string;
  badge: string | null;
  description: string;
  features: string[];
  cta: string;
  highlighted: boolean;
}

export const plans: PricingPlan[] = [
  {
    id: "free",
    name: "Free",
    price: "₹0",
    period: "",
    badge: null,
    description: "Explore CareerCraft AI and get started.",
    features: [
      "3 AI-powered requests total",
      "Resume analysis and ATS scoring",
      "Job description matching",
      "AI interview preparation",
      "Resume builder",
    ],
    cta: "Start Free",
    highlighted: false,
  },
  {
    id: "pro_monthly",
    name: "Pro Monthly",
    price: "₹299",
    period: "/ 30 days",
    badge: null,
    description: "Unlock the full potential of CareerCraft AI.",
    features: [
      "Unlimited AI-powered resume analysis",
      "Detailed ATS scoring and feedback",
      "Unlimited job description matching",
      "Unlimited AI interview preparation",
      "Full resume builder and PDF export",
      "Access to all available Pro features",
    ],
    cta: "Get Pro Monthly",
    highlighted: false,
  },
  {
    id: "pro_six_month",
    name: "Pro Six Months",
    price: "₹1,499",
    period: "/ 180 days",
    badge: "Best Value",
    description: "More time to work towards your next opportunity.",
    features: [
      "Everything included in Pro Monthly",
      "Unlimited AI-powered tools",
      "Six months of uninterrupted Pro access",
      "One-time payment",
      "Save ₹295 compared with six monthly purchases",
    ],
    cta: "Get Pro Six Months",
    highlighted: true,
  },
];
