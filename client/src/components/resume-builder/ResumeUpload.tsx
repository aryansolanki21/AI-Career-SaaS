import { useRef, useState } from "react";

interface Props {
  onFileSelect: (file: File | null) => void;
}

const MAX_PDF_SIZE = 5 * 1024 * 1024;

const ResumeUpload = ({ onFileSelect }: Props) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState("");

  const handleFile = (selected?: File) => {
    if (!selected) return;

    setError("");

    const isPdf =
      selected.type === "application/pdf" ||
      selected.name.toLowerCase().endsWith(".pdf");

    if (!isPdf) {
      setFile(null);
      onFileSelect(null);
      setError("Only PDF files are supported.");
      return;
    }

    if (selected.size > MAX_PDF_SIZE) {
      setFile(null);
      onFileSelect(null);
      setError("File size must not exceed 5 MB.");
      return;
    }

    if (selected.size === 0) {
      setFile(null);
      onFileSelect(null);
      setError("The selected file is empty. Please choose another PDF.");
      return;
    }

    setFile(selected);
    onFileSelect(selected);
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selected = event.target.files?.[0];

    // Reset the input so the same file can be selected again.
    event.target.value = "";

    handleFile(selected);
  };

  const handleRemoveFile = () => {
    setFile(null);
    setError("");
    onFileSelect(null);

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-3">
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,application/pdf"
        hidden
        onChange={handleInputChange}
        aria-label="Choose an existing resume PDF"
      />

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        aria-describedby="resume-upload-hint"
        className="w-full rounded-xl border-2 border-dashed border-slate-300 bg-white p-8 text-center transition hover:border-blue-500 hover:bg-blue-50/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 sm:p-10"
      >
        <span className="block font-medium text-slate-800">
          {file ? file.name : "Choose your existing resume"}
        </span>

        <span
          id="resume-upload-hint"
          className="mt-2 block text-sm text-slate-500"
        >
          PDF format · Maximum 5 MB
        </span>

        {file && (
          <span className="mt-2 block text-xs text-slate-500">
            {(file.size / (1024 * 1024)).toFixed(2)} MB · Ready to upload
          </span>
        )}
      </button>

      {file && (
        <div className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
          <p className="min-w-0 truncate text-sm text-slate-700">
            Selected: {file.name}
          </p>

          <button
            type="button"
            onClick={handleRemoveFile}
            className="shrink-0 rounded-md px-2 py-1 text-sm font-medium text-red-600 transition hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
            aria-label="Remove selected resume"
          >
            Remove
          </button>
        </div>
      )}

      {error && (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
};

export default ResumeUpload;
