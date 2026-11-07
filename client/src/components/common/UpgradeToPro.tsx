import { Link } from "react-router-dom";

interface UpgradeToProProps {
  message?: string;
}

const UpgradeToPro = ({
  message = "You've used all 3 free AI requests. Upgrade to Pro to continue using AI-powered features.",
}: UpgradeToProProps) => {
  return (
    <div
      role="alert"
      className="mt-4 rounded-xl border border-blue-200 bg-blue-50 p-4"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-blue-900">
            Free AI limit reached
          </p>

          <p className="mt-1 text-sm leading-6 text-blue-700">{message}</p>
        </div>

        <Link
          to="/#pricing"
          className="inline-flex shrink-0 items-center justify-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
        >
          Upgrade to Pro
        </Link>
      </div>
    </div>
  );
};

export default UpgradeToPro;
