import axios from "axios";
import { useCallback, useEffect, useRef, useState } from "react";
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

  const controllerRef = useRef<AbortController | null>(null);
  const requestIdRef = useRef(0);

  const generateQuestions = useCallback(
    async (input: InterviewPrepRequest): Promise<void> => {
      const requestId = ++requestIdRef.current;

      controllerRef.current?.abort();
      controllerRef.current = null;

      setResult(null);
      setError("");

      const token = localStorage.getItem("token");

      if (!token) {
        setLoading(false);
        setError("Please log in to generate interview questions.");
        return;
      }

      const controller = new AbortController();
      controllerRef.current = controller;

      setLoading(true);

      try {
        const { data } = await axios.post<InterviewPrepResponse>(
          `${SERVER}/api/ai/interview-prep`,
          input,
          {
            headers: { Authorization: `Bearer ${token}` },
            timeout: REQUEST_TIMEOUT_MS,
            signal: controller.signal,
          },
        );

        if (requestId === requestIdRef.current) {
          setResult(data.result);
        }
      } catch (err: unknown) {
        if (requestId !== requestIdRef.current || axios.isCancel(err)) {
          return;
        }

        setError(
          getApiErrorMessage(
            err,
            "Unable to generate interview questions. Please try again.",
          ),
        );
      } finally {
        if (requestId === requestIdRef.current) {
          setLoading(false);
          controllerRef.current = null;
        }
      }
    },
    [],
  );

  const reset = useCallback(() => {
    requestIdRef.current++;
    controllerRef.current?.abort();
    controllerRef.current = null;

    setResult(null);
    setError("");
    setLoading(false);
  }, []);

  useEffect(() => {
    return () => {
      requestIdRef.current++;
      controllerRef.current?.abort();
    };
  }, []);

  return {
    result,
    loading,
    error,
    generateQuestions,
    reset,
  };
};
