import { useRef, useState, type ChangeEvent, type DragEvent } from "react";
import { FileText, Upload, X } from "lucide-react";

interface ResumeUploadProps {
  onAnalyze: (file: File) => void;
  loading: boolean;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024;

const FOCUS_RING =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700";

const PRIMARY_BUTTON = `inline-flex items-center justify-center rounded-lg bg-blue-700 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60 ${FOCUS_RING}`;

const SECONDARY_BUTTON = `inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 ${FOCUS_RING}`;

const formatFileSize = (bytes: number): string => {
  if (bytes < 1024 * 1024) {
    return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};

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

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (file) {
      validateFile(file);
    }

    // Allows choosing the same file again after removing it.
    event.target.value = "";
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
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
    <section className="w-full" aria-label="Upload your resume">
      <div
        onDragOver={(event) => {
          event.preventDefault();

          if (!loading) {
            setDragging(true);
          }
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={`rounded-xl border-2 border-dashed p-8 transition-colors sm:p-12 ${
          dragging ? "border-blue-700 bg-blue-50" : "border-slate-300 bg-white"
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
            <Upload size={28} className="text-slate-500" aria-hidden="true" />

            <h2 className="mt-4 text-lg font-semibold text-slate-950">
              Drop your resume here
            </h2>

            <p className="mt-1.5 max-w-md text-sm leading-6 text-slate-600">
              or choose a PDF from your device. PDF only, up to 5 MB.
            </p>

            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={loading}
              className={`${PRIMARY_BUTTON} mt-6`}
            >
              Choose PDF
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center text-center">
            <FileText size={28} className="text-slate-500" aria-hidden="true" />

            <h2 className="mt-4 max-w-full break-all text-base font-semibold text-slate-950">
              {selectedFile.name}
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              {formatFileSize(selectedFile.size)}
            </p>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={handleAnalyze}
                disabled={loading}
                className={PRIMARY_BUTTON}
              >
                {loading ? "Analysing..." : "Analyse resume"}
              </button>

              <button
                type="button"
                onClick={removeFile}
                disabled={loading}
                className={SECONDARY_BUTTON}
              >
                <X size={16} aria-hidden="true" />
                Remove
              </button>
            </div>
          </div>
        )}
      </div>

      {error && (
        <p
          role="alert"
          className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {error}
        </p>
      )}
    </section>
  );
};

export default ResumeUpload;
