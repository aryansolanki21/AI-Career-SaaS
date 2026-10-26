import { useEffect, useState } from "react";

interface Finding {
  id: string;
  title: string;
  detail: string;
}

const SAMPLE_SCORE = 72;

const SAMPLE_BREAKDOWN = [
  { label: "Keyword match", value: 64 },
  { label: "Formatting", value: 90 },
  { label: "Impact and numbers", value: 58 },
];

const SAMPLE_FINDINGS: Finding[] = [
  {
    id: "numbers",
    title: "Only 2 of 9 bullet points include a number",
    detail:
      "Say how big or how much. “Improved API performance” becomes “Cut average API response time from 800 ms to 210 ms”.",
  },
  {
    id: "keywords",
    title: "5 keywords from the job post are missing",
    detail:
      "The posting mentions PostgreSQL, Docker, CI/CD, REST and TypeScript. None of them appear in your resume. Add them where they are true.",
  },
  {
    id: "layout",
    title: "Two-column skills table may be misread",
    detail:
      "Many applicant tracking systems read tables left to right and mix up the order. A single comma-separated list is safer.",
  },
];

const SAMPLE_MATCH = {
  role: "Junior Backend Engineer",
  match: 82,
  gaps: "Docker, CI/CD",
};

const SAMPLE_QUESTION =
  "Walk me through an API you built and how you handled errors.";

const ScoreRing = ({ score }: { score: number }) => {
  const radius = 44;
  const circumference = 2 * Math.PI * radius;
  const [filled, setFilled] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => setFilled(true));

    return () => cancelAnimationFrame(id);
  }, []);

  const offset = filled ? circumference * (1 - score / 100) : circumference;

  return (
    <div className="relative h-28 w-28 shrink-0">
      <svg
        viewBox="0 0 100 100"
        className="h-full w-full -rotate-90"
        aria-hidden="true"
      >
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          strokeWidth="8"
          className="stroke-slate-200"
        />

        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="stroke-blue-700 transition-[stroke-dashoffset] duration-1000 ease-out motion-reduce:transition-none"
        />
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold tabular-nums text-slate-900">
          {score}
        </span>

        <span className="text-xs text-slate-500">out of 100</span>
      </div>
    </div>
  );
};

const SampleReport = () => {
  const [openId, setOpenId] = useState<string>(SAMPLE_FINDINGS[0].id);

  return (
    <figure
      className="w-full min-w-0 max-w-xl overflow-hidden rounded-xl border border-slate-300 bg-white shadow-[0_1px_0_rgba(15,23,42,0.04),0_20px_40px_-24px_rgba(15,23,42,0.35)]"
      aria-label="Sample resume analysis report"
    >
      <figcaption className="flex min-w-0 items-center justify-between gap-3 border-b border-slate-200 px-3 py-3 text-sm sm:px-5">
        <span className="min-w-0 font-semibold text-slate-900">
          Backend developer resume
        </span>

        <span className="shrink-0 text-slate-500">Sample report</span>
      </figcaption>

      <div className="flex flex-col gap-6 px-4 py-5 sm:px-5 md:flex-row md:items-center">
        <ScoreRing score={SAMPLE_SCORE} />

        <dl className="w-full min-w-0 space-y-3">
          {SAMPLE_BREAKDOWN.map((row) => (
            <div key={row.label} className="min-w-0">
              <div className="flex items-center justify-between gap-3 text-sm">
                <dt className="min-w-0 text-slate-600">{row.label}</dt>

                <dd className="shrink-0 font-medium tabular-nums text-slate-900">
                  {row.value}%
                </dd>
              </div>

              <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-slate-800"
                  style={{ width: `${row.value}%` }}
                />
              </div>
            </div>
          ))}
        </dl>
      </div>

      <div className="border-t border-slate-200">
        <p className="px-4 pt-4 text-sm font-semibold text-slate-900 sm:px-5">
          Fix these first
        </p>

        <ul className="mt-2 divide-y divide-slate-100 pb-2">
          {SAMPLE_FINDINGS.map((finding) => {
            const isOpen = openId === finding.id;

            return (
              <li key={finding.id} className="min-w-0">
                <button
                  type="button"
                  onClick={() => setOpenId(isOpen ? "" : finding.id)}
                  aria-expanded={isOpen}
                  aria-controls={`finding-${finding.id}`}
                  className="flex w-full min-w-0 items-start justify-between gap-3 px-4 py-3 text-left text-sm font-medium text-slate-800 hover:bg-slate-50 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-blue-700 sm:px-5"
                >
                  <span className="min-w-0">{finding.title}</span>

                  <span
                    aria-hidden="true"
                    className="mt-0.5 shrink-0 text-slate-400"
                  >
                    {isOpen ? "−" : "+"}
                  </span>
                </button>

                {isOpen && (
                  <p
                    id={`finding-${finding.id}`}
                    className="break-words px-4 pb-4 text-sm leading-relaxed text-slate-600 sm:px-5"
                  >
                    {finding.detail}
                  </p>
                )}
              </li>
            );
          })}
        </ul>
      </div>

      <div className="grid min-w-0 gap-px border-t border-slate-200 bg-slate-200 sm:grid-cols-2">
        <div className="min-w-0 bg-white px-4 py-4 sm:px-5 sm:rounded-bl-xl">
          <p className="text-sm font-semibold text-slate-900">
            Best matching role
          </p>

          <p className="mt-1 break-words text-sm text-slate-700">
            {SAMPLE_MATCH.role}{" "}
            <span className="font-semibold tabular-nums text-blue-700">
              {SAMPLE_MATCH.match}% match
            </span>
          </p>

          <p className="mt-0.5 break-words text-sm text-slate-500">
            Missing: {SAMPLE_MATCH.gaps}
          </p>
        </div>

        <div className="min-w-0 bg-white px-4 py-4 sm:px-5 sm:rounded-br-xl">
          <p className="text-sm font-semibold text-slate-900">
            Likely interview question
          </p>

          <p className="mt-1 break-words text-sm text-slate-700">
            “{SAMPLE_QUESTION}”
          </p>
        </div>
      </div>
    </figure>
  );
};

export default SampleReport;
