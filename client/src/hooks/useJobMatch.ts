import axios from "axios";
import { useCallback, useState } from "react";
import type { JobMatchApiResponse, JobMatchResult } from "../types/jobMatcher";
import { getApiErrorMessage, isFreeLimitReached } from "../utils/apiError";

const SERVER = import.meta.env.VITE_API_URL || "http://localhost:5000";
const REQUEST_TIMEOUT_MS = 120_000;

export const useJobMatch = () => {
  const [result, setResult] = useState<JobMatchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [freeLimitReached, setFreeLimitReached] = useState(false);

  const submit = useCallback(
    async (resume: File, jobDescription: string): Promise<void> => {
      const token = localStorage.getItem("token");

      if (!token) {
        setError("Please log in to use job matching.");
        setFreeLimitReached(false);
        return;
      }

      const formData = new FormData();
      formData.append("resume", resume);
      formData.append("jobDescription", jobDescription);

      setLoading(true);
      setError("");
      setFreeLimitReached(false);

      try {
        const { data } = await axios.post<JobMatchApiResponse>(
          `${SERVER}/api/ai/job-matcher`,
          formData,
          {
            headers: { Authorization: `Bearer ${token}` },
            timeout: REQUEST_TIMEOUT_MS,
          },
        );

        setResult(data.result);
      } catch (err: unknown) {
        setFreeLimitReached(isFreeLimitReached(err));

        setError(
          getApiErrorMessage(
            err,
            "Unable to match your resume with the job description. Please try again.",
          ),
        );
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const reset = useCallback(() => {
    setResult(null);
    setError("");
    setFreeLimitReached(false);
  }, []);

  return {
    result,
    loading,
    error,
    freeLimitReached,
    submit,
    reset,
  };
};
