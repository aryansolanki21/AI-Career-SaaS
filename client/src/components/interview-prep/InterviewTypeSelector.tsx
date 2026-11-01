import type { InterviewType } from "../../types/interviewPrep";
import OptionCard from "./OptionCard";
import { INTERVIEW_TYPES } from "./constants";

interface InterviewTypeSelectorProps {
  value: InterviewType;
  disabled?: boolean;
  onChange: (type: InterviewType) => void;
}

const InterviewTypeSelector = ({
  value,
  disabled = false,
  onChange,
}: InterviewTypeSelectorProps) => (
  <fieldset disabled={disabled}>
    <legend className="mb-2 text-sm font-medium text-slate-800">
      Interview type
    </legend>

    <div className="grid gap-3 sm:grid-cols-2">
      {INTERVIEW_TYPES.map((type) => (
        <OptionCard
          key={type.value}
          name="interview-type"
          value={type.value}
          checked={value === type.value}
          onSelect={() => onChange(type.value)}
        >
          <span className="block text-sm font-semibold text-slate-950">
            {type.label}
          </span>
          <span className="mt-1 block text-sm text-slate-600">
            {type.description}
          </span>
        </OptionCard>
      ))}
    </div>
  </fieldset>
);

export default InterviewTypeSelector;
