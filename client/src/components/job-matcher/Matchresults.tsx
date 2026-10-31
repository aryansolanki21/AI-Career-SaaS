import { CheckCircle2, RotateCcw } from "lucide-react";
import type { JobAssessment, JobMatchResult } from "../../types/jobMatcher";
import ScoreRing from "../resume-analysis/ScoreRing";
import DetailRow from "./Detailrow.js";
import RequirementItem from "./RequirementItem";
import {
  FOCUS_RING,
  IMPORTANCE_ORDER,
  PRIORITY_BADGE,
  PRIORITY_LABEL,
  PRIORITY_ORDER,
  STATUS_BADGE,
  STATUS_LABEL,
  STATUS_ORDER,
} from "./constants";

interface MatchResultsProps {
  result: JobMatchResult;
  onReset: () => void;
}

const CARD = "rounded-xl border border-slate-200 bg-white p-6 sm:p-8";

const getVerdict = (score: number): string => {
  if (score >= 80) return "Strong match";
  if (score >= 60) return "Moderate match";
  return "Weak match";
};

const formatRole = (jobTitle: string, seniority: string): string => {
  const parts = [jobTitle, seniority].filter(
    (part) => part.trim() && part.trim().toLowerCase() !== "not specified",
  );

  return parts.length > 0 ? parts.join(" · ") : "Role not specified";
};

const AssessmentBlock = ({
  title,
  assessment,
}: {
  title: string;
  assessment: JobAssessment;
}) => (
  <div>
    <div className="flex items-center justify-between gap-3">
      <h4 className="font-semibold text-slate-950">{title}</h4>
      <span
        className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${STATUS_BADGE[assessment.status]}`}
      >
        {STATUS_LABEL[assessment.status]}
      </span>
    </div>

    <dl className="mt-3 space-y-3 text-sm leading-6">
      {assessment.status !== "not_specified" && (
        <>
          <DetailRow label="What the job asks">
            {assessment.jobExpectation}
          </DetailRow>
          <DetailRow label="What your resume shows">
            {assessment.resumeEvidence || "No supporting evidence found."}
          </DetailRow>
        </>
      )}
      <DetailRow label="Why">{assessment.explanation}</DetailRow>
    </dl>
  </div>
);

const MatchResults = ({ result, onReset }: MatchResultsProps) => {
  const { essential, preferred } = result.scoreBreakdown;

  const requirements = [...result.requirements].sort(
    (a, b) =>
      IMPORTANCE_ORDER[a.importance] - IMPORTANCE_ORDER[b.importance] ||
      STATUS_ORDER[a.status] - STATUS_ORDER[b.status],
  );

  const suggestions = [...result.improvementSuggestions].sort(
    (a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority],
  );

  return (
    <section className="w-full space-y-6" aria-label="Job match report">
      {/* Summary */}
      <div
        className={`${CARD} flex flex-col gap-6 sm:flex-row sm:items-center`}
      >
        <ScoreRing score={result.matchScore} />

        <div className="min-w-0 flex-1">
          <p className="text-sm text-slate-500">
            {formatRole(result.jobTitle, result.seniority)}
          </p>
          <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-950">
            {getVerdict(result.matchScore)}
          </h2>
          <p className="mt-2 text-base leading-relaxed text-slate-600">
            {result.summary}
          </p>

          <dl className="mt-4 flex flex-wrap gap-x-8 gap-y-2 text-sm">
            <div>
              <dt className="text-slate-500">Essential requirements</dt>
              <dd className="font-semibold tabular-nums text-slate-950">
                {essential.matched} of {essential.total} matched
              </dd>
            </div>
            <div>
              <dt className="text-slate-500">Preferred requirements</dt>
              <dd className="font-semibold tabular-nums text-slate-950">
                {preferred.matched} of {preferred.total} matched
              </dd>
            </div>
          </dl>

          <button
            type="button"
            onClick={onReset}
            className={`mt-5 inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 ${FOCUS_RING}`}
          >
            <RotateCcw size={16} aria-hidden="true" />
            Match another job
          </button>
        </div>
      </div>

      {/* Experience and education */}
      <div className={CARD}>
        <h3 className="text-lg font-semibold text-slate-950">
          Experience and education
        </h3>
        <div className="mt-5 grid gap-8 sm:grid-cols-2">
          <AssessmentBlock
            title="Experience"
            assessment={result.experienceAssessment}
          />
          <AssessmentBlock
            title="Education"
            assessment={result.educationAssessment}
          />
        </div>
      </div>

      {/* Requirements */}
      <div className={CARD}>
        <h3 className="text-lg font-semibold text-slate-950">
          Requirements
          <span className="ml-2 text-sm font-normal text-slate-500">
            gaps first
          </span>
        </h3>
        {requirements.length > 0 ? (
          <ul className="mt-3 divide-y divide-slate-200">
            {requirements.map((requirement, index) => (
              <li key={`${requirement.name}-${index}`}>
                <RequirementItem requirement={requirement} />
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-4 text-sm text-slate-500">
            No job requirements were identified for this analysis.
          </p>
        )}
      </div>

      {/* Strengths */}
      <div className={CARD}>
        <h3 className="text-lg font-semibold text-slate-950">
          What is working
        </h3>

        {result.strengths.length > 0 ? (
          <ul className="mt-5 space-y-5">
            {result.strengths.map((strength, index) => (
              <li
                key={`${strength.title}-${index}`}
                className="flex items-start gap-3"
              >
                <CheckCircle2
                  size={18}
                  className="mt-0.5 shrink-0 text-emerald-600"
                  aria-hidden="true"
                />
                <div className="text-sm leading-6">
                  <h4 className="font-semibold text-slate-950">
                    {strength.title}
                  </h4>
                  <p className="mt-0.5 text-slate-700">{strength.evidence}</p>
                  <p className="mt-1 text-slate-500">{strength.relevance}</p>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-4 text-sm text-slate-500">
            No strengths were returned for this match.
          </p>
        )}
      </div>

      {/* Improvement plan */}
      <div className={CARD}>
        <h3 className="text-lg font-semibold text-slate-950">What to fix</h3>

        {suggestions.length > 0 ? (
          <ul className="mt-5 divide-y divide-slate-200">
            {suggestions.map((suggestion, index) => (
              <li
                key={`${suggestion.gap}-${index}`}
                className="py-5 first:pt-0 last:pb-0"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <h4 className="font-semibold text-slate-950">
                    {suggestion.gap}
                  </h4>
                  <span
                    className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${PRIORITY_BADGE[suggestion.priority]}`}
                  >
                    {PRIORITY_LABEL[suggestion.priority]}
                  </span>
                </div>
                <p className="mt-2 text-sm leading-6 text-slate-700">
                  {suggestion.recommendation}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-4 text-sm text-slate-500">
            No improvement suggestions were returned for this match.
          </p>
        )}
      </div>

      <p className="text-sm leading-6 text-slate-500">
        This score is an estimate based on your resume and the job text you
        pasted. It does not predict a hiring decision or guarantee an interview.
      </p>
    </section>
  );
};

export default MatchResults;
