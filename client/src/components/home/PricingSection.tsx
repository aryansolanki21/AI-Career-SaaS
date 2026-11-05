import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import { plans } from "../../config/plans";
import type { ProPlanId } from "../../config/plans";
import { useAppData } from "../../context/useAppData";
import { useRazorpayCheckout } from "../../hooks/useRazorpayCheckout";
import { useSubscription } from "../../hooks/useSubscription";
import PricingCard from "./pricing/PricingCard";

const getRemainingDays = (expiresAt: string): number => {
  const remainingMs = new Date(expiresAt).getTime() - Date.now();

  return Math.max(0, Math.ceil(remainingMs / (1000 * 60 * 60 * 24)));
};

const PricingSection = () => {
  const navigate = useNavigate();
  const { isAuth } = useAppData();

  const { startCheckout, loadingPlanId } = useRazorpayCheckout();

  const {
    subscription,
    loading: subscriptionLoading,
    error: subscriptionError,
    refetch: refetchSubscription,
  } = useSubscription();

  const isProActive = subscription?.status === "active";

  const subscriptionExpiry = subscription?.expiresAt
    ? new Date(subscription.expiresAt)
    : null;

  const currentPlan = subscription
    ? plans.find((plan) => plan.id === subscription.planId)
    : null;

  const remainingDays = subscription?.expiresAt
    ? getRemainingDays(subscription.expiresAt)
    : 0;

  const handlePurchase = (planId: ProPlanId) => {
    if (!isAuth) {
      toast.error("Please log in to purchase a Pro plan.");
      navigate("/login");
      return;
    }

    void startCheckout(planId);
  };

  return (
    <section
      id="pricing"
      aria-labelledby="pricing-heading"
      className="bg-slate-50/70 px-4 py-20 sm:px-6 lg:px-8 lg:py-24"
    >
      <div className="mx-auto max-w-7xl">
        <header className="mx-auto max-w-3xl text-center">
          <h2
            id="pricing-heading"
            className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl lg:text-[42px] lg:leading-tight"
          >
            Build a resume that moves your career forward.
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg sm:leading-8">
            Create your resume, get AI-powered feedback, match your skills to
            job descriptions, and prepare for interviews — all in one place.
          </p>
        </header>

        {isProActive && subscriptionExpiry && (
          <div className="mx-auto mt-8 max-w-3xl rounded-xl border border-blue-200 bg-blue-50 px-5 py-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-semibold text-blue-900">
                  {currentPlan?.name ?? "Pro"} is active
                </p>

                <p className="mt-1 text-sm text-blue-700">
                  {remainingDays} {remainingDays === 1 ? "day" : "days"}{" "}
                  remaining · Access until{" "}
                  {subscriptionExpiry.toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </div>

              <span className="inline-flex w-fit rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                Active
              </span>
            </div>

            <p className="mt-3 border-t border-blue-200 pt-3 text-xs leading-5 text-blue-600">
              You can purchase another Pro plan anytime. Its duration will be
              added after your current access expires.
            </p>
          </div>
        )}

        {subscriptionError && isAuth && (
          <div className="mx-auto mt-8 flex max-w-3xl items-center justify-between gap-4 rounded-xl border border-red-200 bg-red-50 px-5 py-4">
            <p className="text-sm text-red-700">{subscriptionError}</p>

            <button
              type="button"
              onClick={() => void refetchSubscription()}
              className="shrink-0 rounded-lg bg-white px-3 py-2 text-sm font-semibold text-red-700 shadow-sm ring-1 ring-red-200 transition hover:bg-red-50"
            >
              Retry
            </button>
          </div>
        )}

        <div className="mt-12 grid grid-cols-1 items-stretch gap-6 md:grid-cols-2 lg:mt-16 lg:grid-cols-3 lg:gap-7">
          {plans.map((plan) => (
            <PricingCard
              key={plan.id}
              plan={plan}
              destination={
                plan.id === "free"
                  ? isAuth
                    ? "/analyse"
                    : "/register"
                  : undefined
              }
              onSelectPlan={plan.id === "free" ? undefined : handlePurchase}
              loading={
                loadingPlanId === plan.id ||
                (plan.id !== "free" && subscriptionLoading)
              }
              subscriptionActive={isProActive}
            />
          ))}
        </div>

        <p className="mt-8 text-center text-sm leading-6 text-slate-500">
          One payment. Full Pro access for your chosen period. No automatic
          renewal.
        </p>
      </div>
    </section>
  );
};

export default PricingSection;
