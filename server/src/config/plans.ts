export type SubscriptionPlanId = "pro_monthly" | "pro_six_month";

interface SubscriptionPlan {
  id: SubscriptionPlanId;
  name: string;
  amount: number;
  currency: "INR";
  durationDays: number;
  aiRequestLimit: number | null;
}

export const FREE_AI_REQUEST_LIMIT = 3;

export const SUBSCRIPTION_PLANS: Record<SubscriptionPlanId, SubscriptionPlan> =
  {
    pro_monthly: {
      id: "pro_monthly",
      name: "Pro Monthly",
      amount: 29900,
      currency: "INR",
      durationDays: 30,
      aiRequestLimit: null,
    },

    pro_six_month: {
      id: "pro_six_month",
      name: "Pro Six Months",
      amount: 149900,
      currency: "INR",
      durationDays: 180,
      aiRequestLimit: null,
    },
  };

export const getSubscriptionPlan = (
  planId: string,
): SubscriptionPlan | null => {
  if (planId === "pro_monthly" || planId === "pro_six_month") {
    return SUBSCRIPTION_PLANS[planId];
  }

  return null;
};
