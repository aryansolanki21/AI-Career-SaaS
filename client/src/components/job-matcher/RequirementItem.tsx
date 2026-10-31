import type { JobRequirement } from "../../types/jobMatcher";
import DetailRow from "./Detailrow";
import {
  FOCUS_RING,
  IMPORTANCE_LABEL,
  STATUS_BADGE,
  STATUS_LABEL,
} from "./constants";

interface RequirementItemProps {
  requirement: JobRequirement;
}

const RequirementItem = ({ requirement }: RequirementItemProps) => (
  // Gaps start open so they are seen first. Matched items start closed.
  <details open={requirement.status !== "matched"} className="group py-4">
    <summary
      className={`flex cursor-pointer list-none items-start justify-between gap-4 [&::-webkit-details-marker]:hidden ${FOCUS_RING}`}
    >
      <span className="min-w-0">
        <span className="block font-semibold text-slate-950">
          {requirement.name}
        </span>
        <span className="mt-0.5 block text-sm text-slate-500">
          {IMPORTANCE_LABEL[requirement.importance]}
        </span>
      </span>

      <span className="flex shrink-0 items-center gap-3">
        <span
          className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${STATUS_BADGE[requirement.status]}`}
        >
          {STATUS_LABEL[requirement.status]}
        </span>
        <span aria-hidden="true" className="text-slate-400 group-open:hidden">
          +
        </span>
        <span
          aria-hidden="true"
          className="hidden text-slate-400 group-open:inline"
        >
          −
        </span>
      </span>
    </summary>

    <dl className="mt-3 space-y-3 text-sm leading-6">
      <DetailRow label="What the job asks">
        {requirement.jobEvidence || "Not quoted."}
      </DetailRow>
      <DetailRow label="What your resume shows">
        {requirement.resumeEvidence || "No supporting evidence found."}
      </DetailRow>
      <DetailRow label="Why">{requirement.explanation}</DetailRow>
    </dl>
  </details>
);

export default RequirementItem;
