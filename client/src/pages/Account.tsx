import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Crown,
  LogOut,
  Mail,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { Link, Navigate } from "react-router-dom";
import { useAppData } from "../context/useAppData";

const FREE_REQUEST_LIMIT = 3;

const Account = () => {
  const { isAuth } = useAppData();

  if (!isAuth) {
    return <Navigate to="/login" replace />;
  }

  return <AccountContent />;
};

const AccountContent = () => {
  const { user, LogoutUser } = useAppData();

  const freeRequestsUsed = Math.min(
    FREE_REQUEST_LIMIT,
    Math.max(0, user?.freeRequestsUsed ?? 0),
  );

  const freeRequestsLeft = FREE_REQUEST_LIMIT - freeRequestsUsed;

  const subscriptionExpiry = user?.subscription
    ? new Date(user.subscription)
    : null;

  const isPro =
    subscriptionExpiry !== null &&
    !Number.isNaN(subscriptionExpiry.getTime()) &&
    subscriptionExpiry.getTime() > new Date().getTime();

  const accountInitial = user?.name?.trim().charAt(0).toUpperCase() || "U";

  const formattedExpiry =
    isPro && subscriptionExpiry
      ? subscriptionExpiry.toLocaleDateString("en-IN", {
          day: "numeric",
          month: "long",
          year: "numeric",
        })
      : null;

  const handleLogout = () => {
    LogoutUser();
  };

  return (
    <main className="min-h-[calc(100vh-64px)] bg-slate-50 px-4 py-10 sm:px-6 sm:py-14">
      <div className="mx-auto w-full max-w-3xl">
        {/* Page heading */}
        <div className="mb-8">
          <p className="text-sm font-semibold text-blue-700">YOUR ACCOUNT</p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
            Account settings
          </h1>

          <p className="mt-3 max-w-xl text-sm leading-6 text-slate-600 sm:text-base">
            Manage your profile, check your plan, and keep track of your
            available AI requests.
          </p>
        </div>

        <div className="space-y-5">
          {/* Profile card */}
          <section
            aria-labelledby="profile-heading"
            className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
          >
            <div className="flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:p-7">
              <div className="flex min-w-0 flex-1 items-center gap-4">
                <div
                  aria-label={`Profile initial ${accountInitial}`}
                  role="img"
                  className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-blue-700 text-xl font-bold text-white shadow-sm sm:h-16 sm:w-16"
                >
                  {accountInitial}
                </div>

                <div className="min-w-0">
                  <h2
                    id="profile-heading"
                    className="truncate text-lg font-bold text-slate-950 sm:text-xl"
                  >
                    {user?.name || "CareerCraft AI user"}
                  </h2>

                  <p className="mt-1 flex min-w-0 items-center gap-2 text-sm text-slate-500">
                    <Mail size={15} aria-hidden="true" className="shrink-0" />
                    <span className="truncate">
                      {user?.email || "Email unavailable"}
                    </span>
                  </p>

                  <p className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700">
                    <CheckCircle2 size={14} aria-hidden="true" />
                    Account active
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-start rounded-lg bg-slate-50 px-3 py-2 text-xs font-medium text-slate-600 sm:self-center">
                <ShieldCheck size={15} aria-hidden="true" />
                Account details
              </div>
            </div>

            <div className="border-t border-slate-100 bg-slate-50/70 px-5 py-4 sm:px-7">
              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-700 transition-colors hover:border-red-300 hover:bg-red-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-700"
              >
                <LogOut size={16} aria-hidden="true" />
                Log out
              </button>
            </div>
          </section>

          {/* Subscription card */}
          <section
            aria-labelledby="plan-heading"
            className={`rounded-2xl border bg-white p-5 shadow-sm sm:p-7 ${
              isPro ? "border-emerald-200" : "border-slate-200"
            }`}
          >
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
              <div
                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${
                  isPro
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-blue-50 text-blue-700"
                }`}
              >
                {isPro ? (
                  <Crown size={23} aria-hidden="true" />
                ) : (
                  <Zap size={23} aria-hidden="true" />
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2
                    id="plan-heading"
                    className="text-lg font-bold text-slate-950"
                  >
                    {isPro ? "Pro Plan" : "Free Plan"}
                  </h2>

                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                      isPro
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-blue-50 text-blue-700"
                    }`}
                  >
                    {isPro ? "Premium" : "Current plan"}
                  </span>
                </div>

                {isPro ? (
                  <p className="mt-2 flex items-center gap-2 text-sm text-slate-500">
                    <CalendarDays size={15} aria-hidden="true" />
                    {formattedExpiry
                      ? `Expires ${formattedExpiry}`
                      : "Subscription active"}
                  </p>
                ) : (
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    You have{" "}
                    <span className="font-semibold text-slate-950">
                      {freeRequestsLeft} of {FREE_REQUEST_LIMIT}
                    </span>{" "}
                    free AI requests remaining.
                  </p>
                )}
              </div>

              {!isPro && (
                <Link
                  to="/#pricing"
                  className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
                >
                  Explore plans
                  <ArrowRight size={16} aria-hidden="true" />
                </Link>
              )}
            </div>
          </section>

          {/* Free request usage */}
          {!isPro && (
            <section
              aria-labelledby="usage-heading"
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 id="usage-heading" className="font-bold text-slate-950">
                    AI request usage
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Your usage under the free plan.
                  </p>
                </div>

                <span className="shrink-0 text-sm font-semibold tabular-nums text-slate-700">
                  {freeRequestsUsed}/{FREE_REQUEST_LIMIT}
                </span>
              </div>

              <div
                className="mt-5 h-2.5 overflow-hidden rounded-full bg-slate-100"
                role="progressbar"
                aria-label="Free AI requests used"
                aria-valuemin={0}
                aria-valuemax={FREE_REQUEST_LIMIT}
                aria-valuenow={freeRequestsUsed}
              >
                <div
                  className={`h-full rounded-full transition-[width] duration-500 ${
                    freeRequestsLeft === 0 ? "bg-amber-500" : "bg-blue-700"
                  }`}
                  style={{
                    width: `${(freeRequestsUsed / FREE_REQUEST_LIMIT) * 100}%`,
                  }}
                />
              </div>

              <div className="mt-3 flex flex-col gap-1 text-sm sm:flex-row sm:items-center sm:justify-between">
                <span className="text-slate-500">
                  {freeRequestsUsed}{" "}
                  {freeRequestsUsed === 1 ? "request" : "requests"} used
                </span>

                <span
                  className={
                    freeRequestsLeft === 0
                      ? "font-medium text-amber-700"
                      : "text-slate-600"
                  }
                >
                  {freeRequestsLeft === 0
                    ? "Free limit reached"
                    : `${freeRequestsLeft} ${
                        freeRequestsLeft === 1 ? "request" : "requests"
                      } remaining`}
                </span>
              </div>

              {freeRequestsLeft === 0 && (
                <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4">
                  <p className="text-sm font-semibold text-amber-900">
                    You have used all your free requests.
                  </p>

                  <p className="mt-1 text-sm leading-6 text-amber-800">
                    Explore the available plans to see whether an upgrade suits
                    your needs.
                  </p>
                </div>
              )}
            </section>
          )}
        </div>
      </div>
    </main>
  );
};

export default Account;
