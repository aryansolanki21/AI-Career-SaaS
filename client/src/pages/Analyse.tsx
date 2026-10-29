import { useState } from "react";
import axios from "axios";
import { AlertCircle, LoaderCircle } from "lucide-react";
import toast from "react-hot-toast";

import ResumeUpload from "../components/resume-analysis/ResumeUpload";
import AnalysisResults from "../components/resume-analysis/AnalysisResults";
import { useAppData } from "../context/useAppData";
import type { Analysis } from "../types";
import { toBase64 } from "../utils";

const SERVER = import.meta.env.VITE_API_URL || "http://localhost:5000";

const Analyse = () => {
  const { isAuth } = useAppData();

  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleAnalyze = async (file: File) => {
    if (!isAuth) {
      toast.error("Please log in to analyse your resume.");
      return;
    }

    setLoading(true);
    setError("");
    setAnalysis(null);

    try {
      const pdfBase64 = await toBase64(file);
      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("Your session has expired. Please log in again.");
      }

      const response = await axios.post(
        `${SERVER}/api/ai/analyse`,
        { pdfBase64 },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          timeout: 120_000,
        },
      );

      const result: Analysis = response.data.analysis;

      if (!result || typeof result.atsScore !== "number") {
        throw new Error("The server returned an invalid analysis.");
      }

      setAnalysis(result);
      toast.success("Resume analysed.");
    } catch (err: unknown) {
      let message = "Unable to analyse your resume. Please try again.";

      if (axios.isAxiosError(err)) {
        message =
          err.response?.data?.message ||
          (err.code === "ECONNABORTED"
            ? "Analysis timed out. Please try again."
            : message);
      } else if (err instanceof Error) {
        message = err.message;
      }

      // Shown inline below. No second toast, so the same message isn't repeated.
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setAnalysis(null);
    setError("");
  };

  return (
    <main className="px-4 py-10 sm:px-6 sm:py-14">
      <div className="mx-auto max-w-4xl">
        <header className="mb-8 max-w-2xl">
          <h1 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
            Resume analysis
          </h1>

          <p className="mt-3 text-base leading-relaxed text-slate-600">
            Upload your resume as a PDF. You get an ATS score, what is already
            working, and the fixes that matter most.
          </p>
        </header>

        {!analysis && (
          <ResumeUpload onAnalyze={handleAnalyze} loading={loading} />
        )}

        {loading && (
          <div
            role="status"
            aria-live="polite"
            className="mt-6 flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-5"
          >
            <LoaderCircle
              size={22}
              className="mt-0.5 shrink-0 animate-spin text-blue-700"
              aria-hidden="true"
            />

            <div>
              <p className="font-semibold text-slate-950">
                Analysing your resume
              </p>
              <p className="mt-1 text-sm leading-6 text-slate-600">
                Checking formatting, keywords, structure and readability. This
                can take a little while.
              </p>
            </div>
          </div>
        )}

        {error && !loading && (
          <div
            role="alert"
            className="mt-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >
            <AlertCircle
              size={20}
              className="mt-0.5 shrink-0"
              aria-hidden="true"
            />

            <div>
              <p className="font-semibold">Analysis failed</p>
              <p className="mt-1 leading-6">{error}</p>
            </div>
          </div>
        )}

        {analysis && (
          <AnalysisResults analysis={analysis} onReset={handleReset} />
        )}
      </div>
    </main>
  );
};

export default Analyse;
