import type { ResumeBuilderMode } from "../../types/resumeBuilder";

interface Props {
  mode: ResumeBuilderMode | null;
  onChange: (mode: ResumeBuilderMode) => void;
}

const options: {
  id: ResumeBuilderMode;
  title: string;
  description: string;
}[] = [
  {
    id: "manual",
    title: "Build from Scratch",
    description: "Create a professional resume using your details.",
  },
  {
    id: "improve",
    title: "Improve Existing Resume",
    description: "Upload your resume and let AI improve its content.",
  },
];

const ResumeModeSelector = ({ mode, onChange }: Props) => {
  return (
    <div
      className="grid gap-4 sm:grid-cols-2"
      aria-label="Resume building mode"
    >
      {options.map((option) => {
        const isSelected = mode === option.id;

        return (
          <button
            key={option.id}
            type="button"
            aria-pressed={isSelected}
            onClick={() => onChange(option.id)}
            className={`rounded-xl border p-5 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 ${
              isSelected
                ? "border-blue-600 bg-blue-50 ring-1 ring-blue-600"
                : "border-slate-200 bg-white hover:border-blue-300 hover:bg-slate-50"
            }`}
          >
            <h3 className="font-semibold text-slate-900">{option.title}</h3>

            <p className="mt-2 text-sm text-slate-600">{option.description}</p>
          </button>
        );
      })}
    </div>
  );
};

export default ResumeModeSelector;
