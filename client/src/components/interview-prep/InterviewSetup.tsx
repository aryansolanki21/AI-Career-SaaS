import { useState, type SubmitEventHandler } from "react";
import { AlertCircle, LoaderCircle } from "lucide-react";
import type {
  InterviewPrepRequest,
  InterviewType,
  QuestionCount,
} from "../../types/interviewPrep";
import InterviewTypeSelector from "./InterviewTypeSelector";
import QuestionCountSelector from "./QuestionCountSelector";
import {
  FOCUS_RING,
  INPUT_CLASS,
  MAX_JOB_DESCRIPTION_LENGTH,
  MAX_JOB_ROLE_LENGTH,
  MIN_JOB_DESCRIPTION_LENGTH,
  QUESTION_COUNTS,
} from "./constants";

interface InterviewSetupProps {
  loading: boolean;
  error: string;
  onSubmit: (input: InterviewPrepRequest) => void;
}

const InterviewSetup = ({ loading, error, onSubmit }: InterviewSetupProps) => {
  const [jobRole, setJobRole] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [interviewType, setInterviewType] =
    useState<InterviewType>("technical");
  const [questionCount, setQuestionCount] = useState<QuestionCount>(
    QUESTION_COUNTS[0],
  );
  const [validationError, setValidationError] = useState("");

  // Local validation messages take priority over errors from the server.
  const message = validationError || error;

  const handleSubmit: SubmitEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault();

    const role = jobRole.trim();
    const description = jobDescription.trim();

    if (!role) {
      setValidationError("Enter the job role you are preparing for.");
      return;
    }

    if (description.length < MIN_JOB_DESCRIPTION_LENGTH) {
      setValidationError(
        `Paste the full job description (at least ${MIN_JOB_DESCRIPTION_LENGTH} characters).`,
      );
      return;
    }

    setValidationError("");
    onSubmit({
      jobRole: role,
      jobDescription: description,
      interviewType,
      questionCount,
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="space-y-6 rounded-xl border border-slate-200 bg-white p-6 sm:p-8"
    >
      <div>
        <label
          htmlFor="job-role"
          className="mb-1.5 block text-sm font-medium text-slate-800"
        >
          Job role
        </label>
        <input
          id="job-role"
          type="text"
          value={jobRole}
          onChange={(event) => {
            setJobRole(event.target.value);
            setValidationError("");
          }}
          placeholder="e.g. Associate Frontend Developer"
          maxLength={MAX_JOB_ROLE_LENGTH}
          disabled={loading}
          className={`${INPUT_CLASS} h-11`}
        />
      </div>

      <div>
        <div className="mb-1.5 flex items-baseline justify-between gap-3">
          <label
            htmlFor="job-description"
            className="text-sm font-medium text-slate-800"
          >
            Job description
          </label>
          <span className="text-xs tabular-nums text-slate-500">
            {jobDescription.length}/{MAX_JOB_DESCRIPTION_LENGTH}
          </span>
        </div>
        <textarea
          id="job-description"
          value={jobDescription}
          onChange={(event) => {
            setJobDescription(event.target.value);
            setValidationError("");
          }}
          placeholder="Paste the full posting: responsibilities, required skills and tools."
          aria-describedby="job-description-hint"
          rows={8}
          maxLength={MAX_JOB_DESCRIPTION_LENGTH}
          disabled={loading}
          className={`${INPUT_CLASS} resize-y py-3 leading-6`}
        />
        <p id="job-description-hint" className="mt-1.5 text-xs text-slate-500">
          The more of the posting you include, the more relevant the questions.
        </p>
      </div>

      <InterviewTypeSelector
        value={interviewType}
        disabled={loading}
        onChange={setInterviewType}
      />

      <QuestionCountSelector
        value={questionCount}
        disabled={loading}
        onChange={setQuestionCount}
      />

      {message && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          <AlertCircle
            size={18}
            className="mt-0.5 shrink-0"
            aria-hidden="true"
          />
          <p className="leading-6">{message}</p>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-4">
        <button
          type="submit"
          disabled={loading}
          className={`inline-flex items-center justify-center gap-2 rounded-lg bg-blue-700 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60 ${FOCUS_RING}`}
        >
          {loading && (
            <LoaderCircle
              size={18}
              className="animate-spin"
              aria-hidden="true"
            />
          )}
          {loading ? "Generating..." : "Generate questions"}
        </button>

        {loading && (
          <p role="status" className="text-sm text-slate-600">
            Writing your questions. This can take a little while.
          </p>
        )}
      </div>
    </form>
  );
};

export default InterviewSetup;
