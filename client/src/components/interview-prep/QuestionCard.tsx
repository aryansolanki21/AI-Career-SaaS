import type { InterviewQuestion } from "../../types/interviewPrep";
import { FOCUS_RING } from "./constants";

interface QuestionCardProps {
  number: number;
  question: InterviewQuestion;
}

const QuestionCard = ({ number, question }: QuestionCardProps) => (
  <article className="rounded-xl border border-slate-200 bg-white p-5">
    <div className="flex flex-wrap items-center justify-between gap-2">
      <span className="text-sm font-medium text-slate-500">
        Question {number}
      </span>
      <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-xs font-medium text-slate-600">
        {question.category}
      </span>
    </div>

    <h3 className="mt-3 text-base font-medium leading-7 text-slate-950">
      {question.question}
    </h3>

    {/* Hidden by default so you can try to answer before looking. */}
    <details className="group mt-4">
      <summary
        className={`inline-block cursor-pointer list-none rounded text-sm font-medium text-blue-700 underline-offset-4 hover:underline [&::-webkit-details-marker]:hidden ${FOCUS_RING}`}
      >
        <span className="group-open:hidden">Show hint</span>
        <span className="hidden group-open:inline">Hide hint</span>
      </summary>
      <p className="mt-2 text-sm leading-6 text-slate-600">{question.hint}</p>
    </details>
  </article>
);

export default QuestionCard;
