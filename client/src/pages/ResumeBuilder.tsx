import { useState } from "react";
import ResumeModeSelector from "../components/resume-builder/ResumeModeSelector";
import ResumeForm from "../components/resume-builder/ResumeForm";
import ResumeUpload from "../components/resume-builder/ResumeUpload";
import ResumeSectionEditor from "../components/resume-builder/ResumeSectionEditor";
import ResumePreview from "../components/resume-builder/ResumePreview";
import { useResumeBuilder } from "../hooks/useResumeBuilder";
import { downloadResumePDF } from "../utils/resumePdf";
import type { ResumeBuilderMode, ResumeData } from "../types/resumeBuilder";

const ResumeBuilder = () => {
  const [mode, setMode] = useState<ResumeBuilderMode | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showEditor, setShowEditor] = useState(true);

  const { resume, setResume, loading, error, generateResume, reset } =
    useResumeBuilder();

  const handleModeChange = (nextMode: ResumeBuilderMode) => {
    if (loading) return;

    reset();
    setMode(nextMode);
    setSelectedFile(null);
    setShowEditor(true);
  };

  const handleManualGenerate = async (data: ResumeData) => {
    if (loading) return;

    setShowEditor(true);
    await generateResume("manual", data);
  };

  const handleImprove = async () => {
    if (!selectedFile || loading) return;

    setShowEditor(true);
    await generateResume("improve", selectedFile);
  };

  const handleResumeChange = (updated: ResumeData) => {
    setResume(updated);
  };

  const handleCreateAnother = () => {
    reset();
    setMode(null);
    setSelectedFile(null);
    setShowEditor(true);
  };

  const handleDownload = () => {
    if (!resume) return;
    downloadResumePDF(resume);
  };

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8">
          <p className="text-sm font-medium text-blue-600">CareerCraft AI</p>

          <h1 className="mt-2 text-3xl font-bold text-slate-900">
            Resume Builder
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
            Create a professional, ATS-friendly resume or improve your existing
            resume with AI.
          </p>
        </header>

        {!resume && (
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
            <h2 className="mb-5 text-lg font-semibold text-slate-900">
              Choose how you want to create your resume
            </h2>

            <ResumeModeSelector mode={mode} onChange={handleModeChange} />

            {mode === "manual" && (
              <div className="mt-8 border-t border-slate-100 pt-7">
                <ResumeForm
                  onGenerate={handleManualGenerate}
                  loading={loading}
                />
              </div>
            )}

            {mode === "improve" && (
              <div className="mt-8 space-y-5 border-t border-slate-100 pt-7">
                <div>
                  <h2 className="font-semibold text-slate-900">
                    Upload your existing resume
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Upload a readable PDF. Your existing details will be
                    extracted and professionally rewritten.
                  </p>
                </div>

                <ResumeUpload onFileSelect={setSelectedFile} />

                <button
                  type="button"
                  onClick={handleImprove}
                  disabled={!selectedFile || loading}
                  className="w-full rounded-lg bg-blue-600 px-5 py-3 font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading ? "Improving Resume..." : "Improve My Resume"}
                </button>
              </div>
            )}

            {error && (
              <p
                role="alert"
                className="mt-5 rounded-lg bg-red-50 p-3 text-sm text-red-700"
              >
                {error}
              </p>
            )}

            {loading && (
              <p
                role="status"
                aria-live="polite"
                className="mt-4 text-sm text-slate-500"
              >
                Your resume is being processed. This may take a few moments.
              </p>
            )}
          </section>
        )}

        {resume && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">
                  Your Resume
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Review the generated content, make corrections, and download
                  your resume.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setShowEditor((current) => !current)}
                  aria-expanded={showEditor}
                  className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                >
                  {showEditor ? "Hide Editor" : "Edit Resume"}
                </button>

                <button
                  type="button"
                  onClick={handleDownload}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
                >
                  Download PDF
                </button>
              </div>
            </div>

            {showEditor && (
              <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
                <h3 className="mb-6 text-lg font-semibold text-slate-900">
                  Edit Resume Details
                </h3>

                <ResumeSectionEditor
                  resume={resume}
                  onChange={handleResumeChange}
                />
              </section>
            )}

            <section>
              <h3 className="mb-4 text-lg font-semibold text-slate-900">
                Resume Preview
              </h3>

              <div className="overflow-x-auto rounded-xl border border-slate-200 bg-slate-100 p-3 sm:p-6">
                <ResumePreview resume={resume} />
              </div>
            </section>

            <div className="flex flex-wrap justify-between gap-3">
              <button
                type="button"
                onClick={handleCreateAnother}
                className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                Create Another Resume
              </button>

              <button
                type="button"
                onClick={handleDownload}
                className="rounded-lg bg-blue-600 px-5 py-2 font-medium text-white transition hover:bg-blue-700"
              >
                Download Resume
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
};

export default ResumeBuilder;
