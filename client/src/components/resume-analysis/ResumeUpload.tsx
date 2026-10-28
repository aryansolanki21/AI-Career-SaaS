import { useRef, useState } from "react";
import { FileText, Upload, X } from "lucide-react";

interface ResumeUploadProps {
  onAnalyze: (file: File) => void;
  loading: boolean;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024;

const ResumeUpload = ({ onAnalyze, loading }: ResumeUploadProps) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [dragging, setDragging] = useState(false);

  const validateFile = (file: File): boolean => {
    if (
      file.type !== "application/pdf" &&
      !file.name.toLowerCase().endsWith(".pdf")
    ) {
      setError("Please select a PDF file.");
      return false;
    }

    if (file.size > MAX_FILE_SIZE) {
      setError("The PDF must not exceed 5 MB.");
      return false;
    }

    if (file.size === 0) {
      setError("The selected PDF is empty.");
      return false;
    }

    setError("");
    setSelectedFile(file);

    return true;
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (file) {
      validateFile(file);
    }

    event.target.value = "";
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragging(false);

    if (loading) {
      return;
    }

    const file = event.dataTransfer.files[0];

    if (file) {
      validateFile(file);
    }
  };

  const handleAnalyze = () => {
    if (!selectedFile || loading) {
      return;
    }

    onAnalyze(selectedFile);
  };

  const removeFile = () => {
    setSelectedFile(null);
    setError("");
  };

  return (
    <section className="mx-auto w-full max-w-3xl">
      <div
        onDragOver={(event) => {
          event.preventDefault();

          if (!loading) {
            setDragging(true);
          }
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={`rounded-2xl border-2 border-dashed p-6 transition-colors sm:p-10 ${
          dragging
            ? "border-indigo-500 bg-indigo-50"
            : "border-slate-300 bg-white"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,application/pdf"
          onChange={handleFileChange}
          disabled={loading}
          className="hidden"
          aria-label="Select a PDF resume"
        />

        {!selectedFile ? (
          <div className="flex flex-col items-center text-center">
            <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
              <Upload size={30} />
            </div>

            <h2 className="text-xl font-semibold text-slate-900">
              Upload your resume
            </h2>

            <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
              Drag and drop your resume here, or select a PDF from your device
              to receive your ATS compatibility report.
            </p>

            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={loading}
              className="mt-6 inline-flex items-center justify-center rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Choose PDF
            </button>

            <p className="mt-4 text-xs text-slate-400">
              PDF only · Maximum file size: 5 MB
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <FileText size={28} />
            </div>

            <h2 className="mt-4 max-w-full break-all text-base font-semibold text-slate-900">
              {selectedFile.name}
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
            </p>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={handleAnalyze}
                disabled={loading}
                className="rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Analyze Resume
              </button>

              <button
                type="button"
                onClick={removeFile}
                disabled={loading}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-5 py-3 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <X size={16} />
                Remove
              </button>
            </div>
          </div>
        )}
      </div>

      {error && (
        <p
          role="alert"
          className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600"
        >
          {error}
        </p>
      )}
    </section>
  );
};

export default ResumeUpload;
