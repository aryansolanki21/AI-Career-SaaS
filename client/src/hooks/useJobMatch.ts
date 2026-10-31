import axios from "axios";
import { useCallback, useState } from "react";
import type { JobMatchApiResponse, JobMatchResult } from "../types/jobMatcher";

const SERVER = import.meta.env.VITE_API_URL || "http://localhost:5000";
const REQUEST_TIMEOUT_MS = 120_000;

const getErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    if (!error.response) {
      return error.code === "ECONNABORTED"
        ? "The request timed out. Please try again."
        : "Unable to reach the server. Check your connection and try again.";
    }

    if (error.response.status === 401) {
      return "Your session has expired. Please log in again.";
    }

    // The server sends a readable message for validation, quota and AI errors.
    const message = error.response.data?.message;

    if (typeof message === "string" && message.trim()) {
      return message;
    }
  }

  return "Something went wrong. Please try again.";
};

export const useJobMatch = () => {
  const [result, setResult] = useState<JobMatchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = useCallback(
    async (resume: File, jobDescription: string): Promise<void> => {
      const token = localStorage.getItem("token");

      if (!token) {
        setError("Please log in to use job matching.");
        return;
      }

      const formData = new FormData();
      formData.append("resume", resume);
      formData.append("jobDescription", jobDescription);

      setLoading(true);
      setError("");

      try {
        // No Content-Type header: the browser adds the multipart boundary.
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
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const reset = useCallback(() => {
    setResult(null);
    setError("");
  }, []);

  return { result, loading, error, submit, reset };
};
