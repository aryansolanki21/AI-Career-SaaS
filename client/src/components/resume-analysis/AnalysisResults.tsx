import {
  AlertCircle,
  CheckCircle2,
  Download,
  Lightbulb,
  RotateCcw,
} from "lucide-react";

import type { Analysis } from "../../types";

import {
  downloadReport,
  prioBg,
  prioColor,
  prioEmoji,
  scoreBar,
  scoreColor,
} from "../../utils";

import ScoreRing from "./ScoreRing";

interface AnalysisResultsProps {
  analysis: Analysis;
  onReset: () => void;
}

const AnalysisResults = ({ analysis, onReset }: AnalysisResultsProps) => {
  const breakdown = [
    {
      label: "Formatting",
      data: analysis.scoreBreakdown.formatting,
    },
    {
      label: "Keywords",
      data: analysis.scoreBreakdown.keywords,
    },
    {
      label: "Structure",
      data: analysis.scoreBreakdown.structure,
    },
    {
      label: "Readability",
      data: analysis.scoreBreakdown.readability,
    },
  ];

  return (
    <section className="mx-auto w-full max-w-5xl space-y-6">
      <div className="flex flex-col gap-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:p-8">
        <ScoreRing score={analysis.atsScore} />

        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold uppercase tracking-widest text-indigo-600">
            Resume Analysis Complete
          </p>

          <h2 className="mt-3 text-2xl font-bold text-slate-900 sm:text-3xl">
            Your ATS compatibility report
          </h2>

          <p className="mt-3 text-sm leading-7 text-slate-600">
            {analysis.summary}
          </p>

          <div className="mt-5 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => downloadReport(analysis)}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
            >
              <Download size={17} />
              Download Report
            </button>

            <button
              type="button"
              onClick={onReset}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              <RotateCcw size={16} />
              Analyze Another Resume
            </button>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <h3 className="text-xl font-bold text-slate-900">Score Breakdown</h3>

        <p className="mt-2 text-sm text-slate-500">
          Review each area to understand where your resume performs well.
        </p>

        <div className="mt-7 grid gap-6 sm:grid-cols-2">
          {breakdown.map(({ label, data }) => (
            <div key={label}>
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm font-medium text-slate-700">
                  {label}
                </span>

                <span className={`text-sm font-bold ${scoreColor(data.score)}`}>
                  {data.score}/100
                </span>
              </div>

              <div
                className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100"
                role="progressbar"
                aria-label={`${label} score`}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={data.score}
              >
                <div
                  className={`h-full rounded-full bg-linear-to-r ${scoreBar(data.score)} transition-all duration-700`}
                  style={{ width: `${data.score}%` }}
                />
              </div>

              <p className="mt-3 text-sm leading-6 text-slate-500">
                {data.feedback}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
            <CheckCircle2 size={22} />
          </div>

          <div>
            <h3 className="text-xl font-bold text-slate-900">
              Resume Strengths
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              What your resume already does well.
            </p>
          </div>
        </div>

        {analysis.strengths.length > 0 ? (
          <ul className="mt-6 space-y-4">
            {analysis.strengths.map((strength, index) => (
              <li
                key={`${index}-${strength}`}
                className="flex items-start gap-3 text-sm leading-6 text-slate-700"
              >
                <CheckCircle2
                  size={18}
                  className="mt-1 shrink-0 text-emerald-500"
                />

                <span>{strength}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-5 text-sm text-slate-500">
            No strengths were returned for this analysis.
          </p>
        )}
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
            <Lightbulb size={22} />
          </div>

          <div>
            <h3 className="text-xl font-bold text-slate-900">
              Improvement Suggestions
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Prioritized actions to improve your resume.
            </p>
          </div>
        </div>

        {analysis.suggestions.length > 0 ? (
          <div className="mt-6 space-y-4">
            {analysis.suggestions.map((suggestion, index) => (
              <article
                key={`${index}-${suggestion.category}`}
                className={`rounded-xl border p-5 ${prioBg[suggestion.priority]}`}
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h4 className="font-semibold text-slate-900">
                    {suggestion.category}
                  </h4>

                  <span
                    className={`text-xs font-bold uppercase tracking-wider ${prioColor[suggestion.priority]}`}
                  >
                    {prioEmoji[suggestion.priority]} {suggestion.priority}{" "}
                    priority
                  </span>
                </div>

                <div className="mt-4 flex items-start gap-2">
                  <AlertCircle
                    size={17}
                    className="mt-1 shrink-0 text-slate-500"
                  />

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Issue
                    </p>

                    <p className="mt-1 text-sm leading-6 text-slate-700">
                      {suggestion.issue}
                    </p>
                  </div>
                </div>

                <div className="mt-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Recommendation
                  </p>

                  <p className="mt-1 text-sm leading-6 text-slate-700">
                    {suggestion.recommendation}
                  </p>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <p className="mt-5 text-sm text-slate-500">
            No improvement suggestions were returned.
          </p>
        )}
      </div>
    </section>
  );
};

export default AnalysisResults;
