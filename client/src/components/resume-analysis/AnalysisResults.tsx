import { CheckCircle2, Download, RotateCcw } from "lucide-react";

import type { Analysis } from "../../types";
import { downloadReport } from "../../utils";
import toast from "react-hot-toast";
import ScoreRing from "./ScoreRing";

interface AnalysisResultsProps {
  analysis: Analysis;
  onReset: () => void;
}

type Priority = Analysis["suggestions"][number]["priority"];

/* ---------- Local style maps (no dependency on the old utils colour helpers) ---------- */

const FOCUS_RING =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700";

const CARD = "rounded-xl border border-slate-200 bg-white p-6 sm:p-8";

const PRIORITY_ORDER: Record<Priority, number> = {
  high: 0,
  medium: 1,
  low: 2,
};

const PRIORITY_LABEL: Record<Priority, string> = {
  high: "High priority",
  medium: "Medium priority",
  low: "Low priority",
};

const PRIORITY_BADGE: Record<Priority, string> = {
  high: "border-red-200 bg-red-50 text-red-700",
  medium: "border-amber-200 bg-amber-50 text-amber-800",
  low: "border-slate-200 bg-slate-50 text-slate-600",
};

const getScoreTone = (score: number): { text: string; bar: string } => {
  if (score >= 80) return { text: "text-emerald-700", bar: "bg-emerald-600" };
  if (score >= 60) return { text: "text-amber-700", bar: "bg-amber-600" };
  return { text: "text-red-700", bar: "bg-red-600" };
};

/* ---------- Component ---------- */

const AnalysisResults = ({ analysis, onReset }: AnalysisResultsProps) => {
  const breakdown = [
    { label: "Formatting", data: analysis.scoreBreakdown.formatting },
    { label: "Keywords", data: analysis.scoreBreakdown.keywords },
    { label: "Structure", data: analysis.scoreBreakdown.structure },
    { label: "Readability", data: analysis.scoreBreakdown.readability },
  ];

  // Most important fixes first. Array.sort is stable, so order within a priority is kept.
  const sortedSuggestions = [...analysis.suggestions].sort(
    (a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority],
  );

  return (
    <section className="w-full space-y-6" aria-label="Resume analysis report">
      {/* Summary */}
      <div
        className={`${CARD} flex flex-col gap-6 sm:flex-row sm:items-center`}
      >
        <ScoreRing score={analysis.atsScore} />

        <div className="min-w-0 flex-1">
          <h2 className="text-2xl font-bold tracking-tight text-slate-950">
            ATS compatibility report
          </h2>

          <p className="mt-2 text-base leading-relaxed text-slate-600">
            {analysis.summary}
          </p>

          <div className="mt-5 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() =>
                void downloadReport(analysis).catch(() =>
                  toast.error("Could not create the report. Please try again."),
                )
              }
              className={`inline-flex items-center justify-center gap-2 rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-800 ${FOCUS_RING}`}
            >
              <Download size={16} aria-hidden="true" />
              Download report
            </button>

            <button
              type="button"
              onClick={onReset}
              className={`inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 ${FOCUS_RING}`}
            >
              <RotateCcw size={16} aria-hidden="true" />
              Analyse another resume
            </button>
          </div>
        </div>
      </div>

      {/* Score breakdown */}
      <div className={CARD}>
        <h3 className="text-lg font-semibold text-slate-950">
          Score breakdown
        </h3>

        <div className="mt-6 grid gap-x-10 gap-y-7 sm:grid-cols-2">
          {breakdown.map(({ label, data }) => {
            const tone = getScoreTone(data.score);

            return (
              <div key={label}>
                <div className="flex items-baseline justify-between gap-3">
                  <span className="text-sm font-medium text-slate-800">
                    {label}
                  </span>

                  <span
                    className={`text-sm font-semibold tabular-nums ${tone.text}`}
                  >
                    {data.score}/100
                  </span>
                </div>

                <div
                  className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100"
                  role="progressbar"
                  aria-label={`${label} score`}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={data.score}
                >
                  <div
                    className={`h-full rounded-full ${tone.bar}`}
                    style={{ width: `${data.score}%` }}
                  />
                </div>

                <p className="mt-2.5 text-sm leading-6 text-slate-600">
                  {data.feedback}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Strengths */}
      <div className={CARD}>
        <h3 className="text-lg font-semibold text-slate-950">
          What is working
        </h3>

        {analysis.strengths.length > 0 ? (
          <ul className="mt-5 space-y-3">
            {analysis.strengths.map((strength, index) => (
              <li
                key={`${index}-${strength}`}
                className="flex items-start gap-3 text-sm leading-6 text-slate-700"
              >
                <CheckCircle2
                  size={18}
                  className="mt-0.5 shrink-0 text-emerald-600"
                  aria-hidden="true"
                />
                <span>{strength}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-4 text-sm text-slate-500">
            No strengths were returned for this analysis.
          </p>
        )}
      </div>

      {/* Suggestions */}
      <div className={CARD}>
        <h3 className="text-lg font-semibold text-slate-950">
          What to fix
          {sortedSuggestions.length > 0 && (
            <span className="ml-2 text-sm font-normal text-slate-500">
              {sortedSuggestions.length}{" "}
              {sortedSuggestions.length === 1 ? "suggestion" : "suggestions"},
              most important first
            </span>
          )}
        </h3>

        {sortedSuggestions.length > 0 ? (
          <ul className="mt-5 divide-y divide-slate-200">
            {sortedSuggestions.map((suggestion, index) => (
              <li
                key={`${index}-${suggestion.category}`}
                className="py-5 first:pt-0 last:pb-0"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h4 className="font-semibold text-slate-950">
                    {suggestion.category}
                  </h4>

                  <span
                    className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${PRIORITY_BADGE[suggestion.priority]}`}
                  >
                    {PRIORITY_LABEL[suggestion.priority]}
                  </span>
                </div>

                <dl className="mt-3 space-y-3 text-sm leading-6">
                  <div>
                    <dt className="font-medium text-slate-500">Issue</dt>
                    <dd className="mt-0.5 text-slate-700">
                      {suggestion.issue}
                    </dd>
                  </div>

                  <div>
                    <dt className="font-medium text-slate-500">
                      Recommendation
                    </dt>
                    <dd className="mt-0.5 text-slate-700">
                      {suggestion.recommendation}
                    </dd>
                  </div>
                </dl>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-4 text-sm text-slate-500">
            No improvement suggestions were returned.
          </p>
        )}
      </div>
    </section>
  );
};

export default AnalysisResults;
