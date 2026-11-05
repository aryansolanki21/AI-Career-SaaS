import { Link } from "react-router-dom";
import type { PricingPlan, ProPlanId } from "../../../config/plans";

interface PricingCardProps {
  plan: PricingPlan;
  destination?: string;
  onSelectPlan?: (planId: ProPlanId) => void;
  loading?: boolean;
  subscriptionActive?: boolean;
}

const PricingCard = ({
  plan,
  destination,
  onSelectPlan,
  loading = false,
  subscriptionActive = false,
}: PricingCardProps) => {
  const cardStyles = plan.highlighted
    ? "border-blue-500 shadow-lg shadow-blue-100/60"
    : "border-slate-200 shadow-sm hover:border-slate-300 hover:shadow-md";

  const buttonStyles = plan.highlighted
    ? "bg-blue-600 text-white hover:bg-blue-700"
    : "bg-slate-900 text-white hover:bg-slate-800";

  const buttonClassName = `flex min-h-11 w-full items-center justify-center rounded-xl px-4 py-3 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 ${buttonStyles}`;

  const handlePlanSelect = () => {
    if (plan.id === "free" || !onSelectPlan) {
      return;
    }

    onSelectPlan(plan.id);
  };

  return (
    <article
      className={`relative flex h-full flex-col rounded-2xl border bg-white p-6 transition-all duration-200 sm:p-7 ${cardStyles}`}
      aria-labelledby={`plan-${plan.id}`}
    >
      {plan.badge && (
        <span
          className={`absolute right-5 top-5 rounded-full px-3 py-1 text-xs font-semibold ${
            plan.highlighted
              ? "bg-blue-100 text-blue-700"
              : "bg-slate-100 text-slate-600"
          }`}
        >
          {plan.badge}
        </span>
      )}

      <div>
        <h3
          id={`plan-${plan.id}`}
          className="text-lg font-semibold text-slate-900"
        >
          {plan.name}
        </h3>

        <p className="mt-2 min-h-10 max-w-xs text-sm leading-6 text-slate-500">
          {plan.description}
        </p>
      </div>

      <div className="mt-6 flex min-h-12 items-baseline gap-2">
        <span className="text-4xl font-bold tracking-tight text-slate-900">
          {plan.price}
        </span>

        {plan.period && (
          <span className="text-sm font-medium text-slate-500">
            {plan.period}
          </span>
        )}
      </div>

      <div className="my-7 border-t border-slate-100" />

      <ul className="flex-1 space-y-4">
        {plan.features.map((feature) => (
          <li key={feature} className="flex items-start gap-3">
            <span
              aria-hidden="true"
              className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-blue-50 text-xs font-bold text-blue-600"
            >
              ✓
            </span>

            <span className="text-sm leading-6 text-slate-600">{feature}</span>
          </li>
        ))}
      </ul>

      <div className="mt-8">
        {destination ? (
          <Link to={destination} className={buttonClassName}>
            {plan.cta}
          </Link>
        ) : onSelectPlan && plan.id !== "free" ? (
          <button
            type="button"
            disabled={loading}
            onClick={handlePlanSelect}
            className={`${buttonClassName} disabled:cursor-not-allowed disabled:opacity-60`}
          >
            {loading
              ? "Processing..."
              : subscriptionActive
                ? `Extend ${plan.name}`
                : plan.cta}
          </button>
        ) : null}
      </div>
    </article>
  );
};

export default PricingCard;
