import { ArrowLeft, ArrowRight } from "lucide-react";
import { FOCUS_RING } from "./constants";

interface QuestionPaginationProps {
  currentPage: number;
  totalPages: number;
  totalQuestions: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

const QuestionPagination = ({
  currentPage,
  totalPages,
  totalQuestions,
  pageSize,
  onPageChange,
}: QuestionPaginationProps) => {
  if (totalPages <= 1) return null;

  const first = (currentPage - 1) * pageSize + 1;
  const last = Math.min(currentPage * pageSize, totalQuestions);

  return (
    <nav
      aria-label="Question pages"
      className="flex flex-col gap-4 border-t border-slate-200 pt-5 sm:flex-row sm:items-center sm:justify-between"
    >
      <p className="text-sm text-slate-600">
        Showing{" "}
        <span className="font-semibold text-slate-950">
          {first}–{last}
        </span>{" "}
        of{" "}
        <span className="font-semibold text-slate-950">{totalQuestions}</span>{" "}
        questions
      </p>

      <div className="flex items-center justify-between gap-3 sm:justify-end">
        <button
          type="button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 ${FOCUS_RING}`}
        >
          <ArrowLeft size={16} aria-hidden="true" />
          Previous
        </button>

        <span className="whitespace-nowrap text-sm tabular-nums text-slate-600">
          {currentPage} / {totalPages}
        </span>

        <button
          type="button"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`inline-flex items-center gap-2 rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-40 ${FOCUS_RING}`}
        >
          Next
          <ArrowRight size={16} aria-hidden="true" />
        </button>
      </div>
    </nav>
  );
};

export default QuestionPagination;
