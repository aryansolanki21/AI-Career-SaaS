import { Link } from "react-router-dom";
import SampleReport from "./SampleReport";

interface HeroSectionProps {
  primaryTo: string;
  primaryLabel: string;
  isAuth: boolean;
}

const FOCUS_RING =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700";

const HeroSection = ({ primaryTo, primaryLabel, isAuth }: HeroSectionProps) => {
  return (
    <section className="mx-auto grid w-full max-w-6xl min-w-0 grid-cols-1 items-center gap-10 px-4 pb-14 pt-12 sm:px-6 lg:gap-12 lg:pb-20 lg:pt-16 xl:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] xl:gap-10">
      <div className="min-w-0 text-center xl:text-left">
        <h1 className="mx-auto max-w-[16ch] text-4xl font-extrabold leading-[1.05] tracking-tight text-slate-950 sm:text-5xl xl:mx-0 xl:text-6xl">
          Find out why your resume isn’t getting replies.
        </h1>

        <p className="mx-auto mt-6 max-w-[52ch] text-lg leading-relaxed text-slate-600 xl:mx-0">
          Upload your resume and a job description. You get an ATS score, the
          exact lines to fix, and the interview questions that role is likely to
          ask.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-4 xl:justify-start">
          <Link
            to={primaryTo}
            className={`inline-flex max-w-full items-center justify-center rounded-lg bg-blue-700 px-5 py-3 text-base font-semibold text-white transition-colors hover:bg-blue-800 ${FOCUS_RING}`}
          >
            {primaryLabel}
          </Link>

          <a
            href="#how-it-works"
            className={`text-base font-semibold text-slate-800 underline decoration-slate-400 underline-offset-4 hover:decoration-slate-900 ${FOCUS_RING}`}
          >
            See how it works
          </a>
        </div>

        {!isAuth && (
          <p className="mt-5 text-sm text-slate-500">
            Free to start. No credit card needed.
          </p>
        )}
      </div>

      <div className="mx-auto w-full min-w-0 max-w-xl lg:justify-self-end">
        <SampleReport />
      </div>
    </section>
  );
};

export default HeroSection;
