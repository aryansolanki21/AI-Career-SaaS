import { Link } from "react-router-dom";

interface CTASectionProps {
  primaryTo: string;
  primaryLabel: string;
}

const CTASection = ({ primaryTo, primaryLabel }: CTASectionProps) => {
  return (
    <section className="bg-slate-900">
      <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 px-6 py-12 md:flex-row md:items-center">
        <div>
          <h2 className="max-w-[22ch] text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Start with one resume and one job posting.
          </h2>

          <p className="mt-3 text-base text-slate-300">
            Your first report takes about a minute.
          </p>
        </div>

        <Link
          to={primaryTo}
          className="inline-flex shrink-0 items-center rounded-lg bg-white px-5 py-3 text-base font-semibold text-slate-950 transition-colors hover:bg-slate-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        >
          {primaryLabel}
        </Link>
      </div>
    </section>
  );
};

export default CTASection;
