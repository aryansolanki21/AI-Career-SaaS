import { useRef, useState, type ChangeEvent, type DragEvent } from "react";
import { FileText, Upload, X } from "lucide-react";
import { FOCUS_RING, MAX_PDF_SIZE } from "./constants";

interface ResumeFileInputProps {
  file: File | null;
  disabled?: boolean;
  onSelect: (file: File) => void;
  onClear: () => void;
  onError: (message: string) => void;
}

const getPdfError = (file: File): string | null => {
  const isPdf = file.name.toLowerCase().endsWith(".pdf");

  if (!isPdf || (file.type && file.type !== "application/pdf")) {
    return "Please select a valid PDF file.";
  }

  if (file.size === 0) return "The selected PDF is empty.";
  if (file.size > MAX_PDF_SIZE) return "The PDF must not exceed 5 MB.";

  return null;
};

const formatFileSize = (bytes: number): string =>
  bytes < 1024 * 1024
    ? `${Math.max(1, Math.round(bytes / 1024))} KB`
    : `${(bytes / (1024 * 1024)).toFixed(2)} MB`;

const ResumeFileInput = ({
  file,
  disabled = false,
  onSelect,
  onClear,
  onError,
}: ResumeFileInputProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const handleFile = (candidate?: File) => {
    if (!candidate) return;

    const error = getPdfError(candidate);

    if (error) {
      onError(error);
      return;
    }

    onSelect(candidate);
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    handleFile(event.target.files?.[0]);
    // Lets the same file be chosen again after it is removed.
    event.target.value = "";
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragging(false);

    if (!disabled) {
      handleFile(event.dataTransfer.files[0]);
    }
  };

  return (
    <div>
      <p className="mb-1.5 text-sm font-medium text-slate-800">Resume (PDF)</p>

      <input
        ref={inputRef}
        type="file"
        accept=".pdf,application/pdf"
        onChange={handleChange}
        disabled={disabled}
        className="hidden"
        aria-label="Select a PDF resume"
      />

      {file ? (
        <div className="flex items-center gap-3 rounded-lg border border-slate-300 bg-white p-3">
          <FileText
            size={22}
            className="shrink-0 text-slate-500"
            aria-hidden="true"
          />

          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-slate-950">
              {file.name}
            </p>
            <p className="text-xs text-slate-500">
              {formatFileSize(file.size)}
            </p>
          </div>

          <button
            type="button"
            onClick={onClear}
            disabled={disabled}
            aria-label="Remove selected resume"
            className={`rounded-md p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-60 ${FOCUS_RING}`}
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>
      ) : (
        <div
          onDragOver={(event) => {
            event.preventDefault();
            if (!disabled) setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          className={`flex flex-col items-center rounded-lg border-2 border-dashed px-4 py-8 text-center transition-colors ${
            dragging
              ? "border-blue-700 bg-blue-50"
              : "border-slate-300 bg-white"
          }`}
        >
          <Upload size={24} className="text-slate-500" aria-hidden="true" />
          <p className="mt-3 text-sm font-medium text-slate-900">
            Drop your resume here
          </p>
          <p className="mt-1 text-sm text-slate-500">PDF only, up to 5 MB</p>

          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={disabled}
            className={`mt-4 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 ${FOCUS_RING}`}
          >
            Choose PDF
          </button>
        </div>
      )}
    </div>
  );
};

export default ResumeFileInput;
