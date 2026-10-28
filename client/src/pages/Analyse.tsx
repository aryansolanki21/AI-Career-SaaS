import { useState } from "react";
import axios from "axios";
import { AlertCircle, LoaderCircle, Sparkles } from "lucide-react";
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
      toast.error("Please log in to analyze your resume.");
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
      toast.success("Resume analyzed successfully.");
    } catch (err: unknown) {
      let message = "Unable to analyze your resume. Please try again.";

      if (axios.isAxiosError(err)) {
        message =
          err.response?.data?.message ||
          (err.code === "ECONNABORTED"
            ? "Analysis timed out. Please try again."
            : message);
      } else if (err instanceof Error) {
        message = err.message;
      }

      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setAnalysis(null);
    setError("");
  };

  return (
    <main className="min-h-[calc(100vh-64px)] bg-slate-50 px-4 py-10 sm:px-6 sm:py-14">
      <div className="mx-auto max-w-6xl">
        <header className="mx-auto mb-10 max-w-3xl text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-700">
            <Sparkles size={24} aria-hidden="true" />
          </div>

          <p className="mt-5 text-sm font-semibold uppercase tracking-widest text-indigo-600">
            AI-powered resume review
          </p>

          <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
            Resume Analyzer
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
            Discover your resume's ATS compatibility, identify its strengths,
            and get actionable recommendations to improve it.
          </p>
        </header>

        {!analysis && (
          <ResumeUpload onAnalyze={handleAnalyze} loading={loading} />
        )}

        {loading && (
          <div
            className="mx-auto mt-8 flex max-w-md flex-col items-center rounded-2xl border border-indigo-100 bg-white p-8 text-center shadow-sm"
            role="status"
            aria-live="polite"
          >
            <LoaderCircle
              size={36}
              className="animate-spin text-indigo-600"
              aria-hidden="true"
            />

            <h2 className="mt-4 text-lg font-semibold text-slate-900">
              Analyzing your resume
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Our AI is reviewing your resume's formatting, keywords, structure,
              and readability. This may take a moment.
            </p>
          </div>
        )}

        {error && !loading && (
          <div
            role="alert"
            className="mx-auto mt-6 flex max-w-3xl items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
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

        {!analysis && !loading && !error && (
          <div className="mx-auto mt-8 flex flex-wrap justify-center gap-3">
            {[
              "ATS compatibility score",
              "Resume strengths",
              "Actionable suggestions",
            ].map((feature) => (
              <span
                key={feature}
                className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-medium text-slate-600"
              >
                {feature}
              </span>
            ))}
          </div>
        )}
      </div>
    </main>
  );
};

export default Analyse;
