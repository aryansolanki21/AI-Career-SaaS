import axios from "axios";
import { useCallback, useRef, useState } from "react";
import type { ResumeBuilderMode, ResumeData } from "../types/resumeBuilder";
import { getApiErrorMessage, isFreeLimitReached } from "../utils/apiError";

interface ResumeBuilderResponse {
  message: string;
  result: {
    resume: ResumeData;
  };
}

type ResumeRequestBody =
  | FormData
  | {
      mode: "manual";
      resumeData: ResumeData;
    };

const SERVER = import.meta.env.VITE_API_URL || "http://localhost:5000";
const REQUEST_TIMEOUT_MS = 120_000;

const isFile = (value: ResumeData | File): value is File =>
  typeof File !== "undefined" && value instanceof File;

const createRequestBody = (
  mode: ResumeBuilderMode,
  data: ResumeData | File,
): ResumeRequestBody | null => {
  if (mode === "improve") {
    if (!isFile(data)) return null;

    const formData = new FormData();
    formData.append("mode", mode);
    formData.append("resume", data);

    return formData;
  }

  if (isFile(data)) return null;

  return {
    mode: "manual",
    resumeData: data,
  };
};

const isValidResumeResponse = (
  response: unknown,
): response is ResumeBuilderResponse => {
  if (typeof response !== "object" || response === null) {
    return false;
  }

  const payload = response as Record<string, unknown>;
  const result = payload.result;

  if (typeof result !== "object" || result === null) {
    return false;
  }

  const resume = (result as Record<string, unknown>).resume;

  if (typeof resume !== "object" || resume === null || Array.isArray(resume)) {
    return false;
  }

  const personalDetails = (resume as Record<string, unknown>).personalDetails;

  return (
    typeof personalDetails === "object" &&
    personalDetails !== null &&
    !Array.isArray(personalDetails)
  );
};

export const useResumeBuilder = () => {
  const [resume, setResume] = useState<ResumeData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [freeLimitReached, setFreeLimitReached] = useState(false);

  const requestIdRef = useRef(0);
  const activeControllerRef = useRef<AbortController | null>(null);

  const generateResume = useCallback(
    async (
      mode: ResumeBuilderMode,
      data: ResumeData | File,
    ): Promise<ResumeData | null> => {
      if (activeControllerRef.current) {
        return null;
      }

      const token = localStorage.getItem("token");

      if (!token) {
        setError("Please log in to use the resume builder.");
        setFreeLimitReached(false);
        return null;
      }

      const body = createRequestBody(mode, data);

      if (!body) {
        setError(
          "Invalid input. Please check your resume details and try again.",
        );
        setFreeLimitReached(false);
        return null;
      }

      const requestId = ++requestIdRef.current;
      const controller = new AbortController();

      activeControllerRef.current = controller;

      setLoading(true);
      setError("");
      setFreeLimitReached(false);
      setResume(null);

      try {
        const { data: response } = await axios.post<ResumeBuilderResponse>(
          `${SERVER}/api/ai/resume-builder`,
          body,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            timeout: REQUEST_TIMEOUT_MS,
            signal: controller.signal,
          },
        );

        if (requestId !== requestIdRef.current) {
          return null;
        }

        if (!isValidResumeResponse(response)) {
          throw new Error("The server returned an invalid resume response.");
        }

        setResume(response.result.resume);
        return response.result.resume;
      } catch (err: unknown) {
        if (requestId !== requestIdRef.current) {
          return null;
        }

        if (axios.isCancel(err) || controller.signal.aborted) {
          return null;
        }

        setFreeLimitReached(isFreeLimitReached(err));

        setError(
          getApiErrorMessage(
            err,
            "Unable to generate your resume. Please try again.",
          ),
        );

        return null;
      } finally {
        if (requestId === requestIdRef.current) {
          activeControllerRef.current = null;
          setLoading(false);
        }
      }
    },
    [],
  );

  const reset = useCallback(() => {
    requestIdRef.current += 1;

    activeControllerRef.current?.abort();
    activeControllerRef.current = null;

    setResume(null);
    setError("");
    setFreeLimitReached(false);
    setLoading(false);
  }, []);

  return {
    resume,
    setResume,
    loading,
    error,
    freeLimitReached,
    generateResume,
    reset,
  };
};
