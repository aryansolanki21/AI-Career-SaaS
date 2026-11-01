import { useEffect, useRef, useState } from "react";
import { Download } from "lucide-react";
import toast from "react-hot-toast";
import InterviewSetup from "../components/interview-prep/InterviewSetup";
import QuestionList from "../components/interview-prep/QuestionList";
import QuestionPagination from "../components/interview-prep/QuestionPagination";
import {
  FOCUS_RING,
  INTERVIEW_TYPE_LABEL,
  QUESTIONS_PER_PAGE,
} from "../components/interview-prep/constants";
import { useInterviewPrep } from "../hooks/useInterviewPrep";
import type { InterviewPrepRequest } from "../types/interviewPrep";
import { downloadInterviewQuestions } from "../utils/interviewPrep";

const SECONDARY_BUTTON = `inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 ${FOCUS_RING}`;

const InterviewPrep = () => {
  const { result, loading, error, generateQuestions, reset } =
    useInterviewPrep();
  const [currentPage, setCurrentPage] = useState(1);
  const questionsRef = useRef<HTMLDivElement>(null);

  // Use the real list length, in case fewer questions came back than requested.
  const questions = result?.questions ?? [];
  const totalPages = Math.ceil(questions.length / QUESTIONS_PER_PAGE);
  const startIndex = (currentPage - 1) * QUESTIONS_PER_PAGE;
  const visibleQuestions = questions.slice(
    startIndex,
    startIndex + QUESTIONS_PER_PAGE,
  );

  useEffect(() => {
    if (result) {
      window.scrollTo({ top: 0 });
    }
  }, [result]);

  const handleGenerate = async (input: InterviewPrepRequest) => {
    setCurrentPage(1);
    await generateQuestions(input);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    questionsRef.current?.scrollIntoView({ block: "start" });
  };

  const handleDownload = () => {
    if (!result) return;

    downloadInterviewQuestions(result).catch(() => {
      toast.error("Could not create the PDF. Please try again.");
    });
  };

  return (
    <main className="px-4 py-10 sm:px-6 sm:py-14">
      <div className="mx-auto max-w-4xl">
        <header className="mb-8 max-w-2xl">
          <h1 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
            Interview preparation
          </h1>

          {!result && (
            <p className="mt-3 text-base leading-relaxed text-slate-600">
              Enter a job role and paste the job description. You get likely
              interview questions for that role, each with a hint you can open
              when you need it.
            </p>
          )}
        </header>

        {/* Hidden, not unmounted, so your job details are kept. */}
        <div hidden={result !== null}>
          <InterviewSetup
            loading={loading}
            error={error}
            onSubmit={(input) => void handleGenerate(input)}
          />
        </div>

        {result && (
          <section aria-label="Generated interview questions">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-sm text-slate-500">
                  {INTERVIEW_TYPE_LABEL[result.interviewType]} ·{" "}
                  {questions.length} questions
                </p>
                <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-950">
                  {result.jobRole}
                </h2>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={reset}
                  className={SECONDARY_BUTTON}
                >
                  Change details
                </button>
                <button
                  type="button"
                  onClick={handleDownload}
                  className={SECONDARY_BUTTON}
                >
                  <Download size={16} aria-hidden="true" />
                  Download PDF
                </button>
              </div>
            </div>

            <div ref={questionsRef} className="mt-6 scroll-mt-24">
              <QuestionList
                questions={visibleQuestions}
                startNumber={startIndex + 1}
              />

              <div className="mt-6">
                <QuestionPagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalQuestions={questions.length}
                  pageSize={QUESTIONS_PER_PAGE}
                  onPageChange={handlePageChange}
                />
              </div>
            </div>
          </section>
        )}
      </div>
    </main>
  );
};

export default InterviewPrep;
