import axios from "axios";
import { useCallback, useState } from "react";
import type {
  InterviewPrepRequest,
  InterviewPrepResponse,
  InterviewPrepResult,
} from "../types/interviewPrep";
import { getApiErrorMessage } from "../utils/apiError";

const SERVER = import.meta.env.VITE_API_URL || "http://localhost:5000";
const REQUEST_TIMEOUT_MS = 120_000;

export const useInterviewPrep = () => {
  const [result, setResult] = useState<InterviewPrepResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const generateQuestions = useCallback(
    async (input: InterviewPrepRequest): Promise<void> => {
      const token = localStorage.getItem("token");

      if (!token) {
        setError("Please log in to generate interview questions.");
        return;
      }

      setLoading(true);
      setError("");
      setResult(null);

      try {
        const { data } = await axios.post<InterviewPrepResponse>(
          `${SERVER}/api/ai/interview-prep`,
          input,
          {
            headers: { Authorization: `Bearer ${token}` },
            timeout: REQUEST_TIMEOUT_MS,
          },
        );

        setResult(data.result);
      } catch (err: unknown) {
        setError(
          getApiErrorMessage(
            err,
            "Unable to generate interview questions. Please try again.",
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
  }, []);

  return { result, loading, error, generateQuestions, reset };
};
