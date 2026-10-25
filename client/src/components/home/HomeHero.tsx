import { ArrowDown, ArrowRight, Check, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import CareerWorkspacePreview from "./CareerWorkspacePreview";

const HomeHero = () => {
  return (
    <section
      aria-labelledby="home-hero-title"
      className="relative isolate overflow-hidden bg-white text-slate-900"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
      >
        <div className="absolute -left-40 top-32 h-96 w-96 rounded-full bg-emerald-100/60 blur-[100px]" />
        <div className="absolute -right-40 -top-24 h-[34rem] w-[34rem] rounded-full bg-violet-100/70 blur-[110px]" />
        <div className="absolute inset-0 bg-[radial-gradient(#cbd5e1_0.7px,transparent_0.7px)] bg-size-[22px_22px] opacity-35 [mask-image:linear-gradient(to_bottom,black,transparent_85%)]" />
      </div>

      <div className="mx-auto grid min-h-[calc(100svh-80px)] max-w-7xl items-center gap-14 px-5 py-16 sm:px-8 sm:py-20 lg:grid-cols-[0.96fr_1.04fr] lg:gap-12 lg:px-10 lg:py-20">
        <div className="mx-auto w-full max-w-2xl lg:mx-0">
          <div className="inline-flex items-center gap-2 rounded-full border border-violet-200/80 bg-white/80 px-3.5 py-2 text-xs font-semibold text-violet-700 shadow-sm backdrop-blur sm:text-sm">
            <Sparkles size={15} />
            Your career, with a clearer direction
            <span
              aria-hidden="true"
              className="ml-0.5 h-1.5 w-1.5 rounded-full bg-emerald-500"
            />
          </div>

          <h1
            id="home-hero-title"
            className="mt-7 max-w-2xl text-4xl font-bold leading-[1.12] tracking-[-0.045em] text-slate-950 sm:text-5xl md:text-6xl xl:text-[4.25rem]"
          >
            Build your next career move{" "}
            <span className="bg-linear-to-r from-violet-600 via-indigo-600 to-emerald-500 bg-clip-text text-transparent">
              with confidence.
            </span>
          </h1>

          <p className="mt-6 max-w-xl text-base leading-7 text-slate-600 sm:text-lg sm:leading-8">
            Improve your resume, find roles that fit your skills, and prepare
            for interviews—all in one place.
          </p>

          <div className="mt-8 flex flex-col gap-3 min-[420px]:flex-row">
            <Link
              to="/register"
              className="inline-flex min-h-13 items-center justify-center gap-2 rounded-xl bg-violet-600 px-6 py-3.5 text-sm font-semibold text-white shadow-[0_8px_24px_-10px_rgba(124,58,237,0.75)] transition hover:-translate-y-0.5 hover:bg-violet-700 hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-600"
            >
              Get started for free
              <ArrowRight size={18} />
            </Link>

            <a
              href="#career-tools"
              className="inline-flex min-h-13 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white/80 px-6 py-3.5 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-600"
            >
              Explore career tools
              <ArrowDown size={17} />
            </a>
          </div>

          <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-3 text-sm text-slate-500">
            <span className="inline-flex items-center gap-2">
              <Check size={16} className="text-emerald-600" />
              Four career tools
            </span>

            <span className="inline-flex items-center gap-2">
              <Check size={16} className="text-emerald-600" />
              One connected workspace
            </span>
          </div>
        </div>

        <div className="w-full lg:pl-2">
          <CareerWorkspacePreview />
        </div>
      </div>
    </section>
  );
};

export default HomeHero;
