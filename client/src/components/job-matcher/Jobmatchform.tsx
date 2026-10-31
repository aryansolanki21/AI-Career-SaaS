import { useState, type SubmitEventHandler } from "react";
import { AlertCircle, LoaderCircle } from "lucide-react";
import ResumeFileInput from "./Resumefileinput";
import {
  FOCUS_RING,
  MAX_JOB_DESCRIPTION_LENGTH,
  MIN_JOB_DESCRIPTION_LENGTH,
} from "./constants";

interface JobMatchFormProps {
  loading: boolean;
  error: string;
  onSubmit: (resume: File, jobDescription: string) => void;
}

const JobMatchForm = ({ loading, error, onSubmit }: JobMatchFormProps) => {
  const [resume, setResume] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState("");
  const [validationError, setValidationError] = useState("");

  // Local validation messages take priority over errors from the server.
  const message = validationError || error;

  const handleSubmit: SubmitEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault();

    const trimmed = jobDescription.trim();

    if (!resume) {
      setValidationError("Please upload your resume as a PDF.");
      return;
    }

    if (trimmed.length < MIN_JOB_DESCRIPTION_LENGTH) {
      setValidationError(
        `Please paste the full job description (at least ${MIN_JOB_DESCRIPTION_LENGTH} characters).`,
      );
      return;
    }

    setValidationError("");
    onSubmit(resume, trimmed);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 rounded-xl border border-slate-200 bg-white p-6 sm:p-8"
    >
      <ResumeFileInput
        file={resume}
        disabled={loading}
        onSelect={(file) => {
          setResume(file);
          setValidationError("");
        }}
        onClear={() => {
          setResume(null);
          setValidationError("");
        }}
        onError={setValidationError}
      />

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
          disabled={loading}
          rows={10}
          maxLength={MAX_JOB_DESCRIPTION_LENGTH}
          placeholder="Paste the full posting: responsibilities, required skills and qualifications."
          aria-describedby="job-description-hint"
          className="w-full resize-y rounded-lg border border-slate-300 bg-white px-3.5 py-3 text-sm leading-6 text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-blue-700 focus:ring-2 focus:ring-blue-700/20 disabled:cursor-not-allowed disabled:bg-slate-50"
        />

        <p id="job-description-hint" className="mt-1.5 text-xs text-slate-500">
          Keep the original wording. Text copied from LinkedIn or a job portal
          works well.
        </p>
      </div>

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
          {loading ? "Analysing..." : "Check match"}
        </button>

        {loading && (
          <p role="status" className="text-sm text-slate-600">
            Comparing your resume with the job. This can take a little while.
          </p>
        )}
      </div>
    </form>
  );
};

export default JobMatchForm;
