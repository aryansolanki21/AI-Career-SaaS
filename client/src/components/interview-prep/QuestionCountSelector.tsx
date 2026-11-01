import type { QuestionCount } from "../../types/interviewPrep";
import OptionCard from "./OptionCard";
import { QUESTION_COUNTS, QUESTIONS_PER_PAGE } from "./constants";

interface QuestionCountSelectorProps {
  value: QuestionCount;
  disabled?: boolean;
  onChange: (count: QuestionCount) => void;
}

const QuestionCountSelector = ({
  value,
  disabled = false,
  onChange,
}: QuestionCountSelectorProps) => (
  <fieldset disabled={disabled}>
    <legend className="mb-2 text-sm font-medium text-slate-800">
      Number of questions
    </legend>

    <div className="grid grid-cols-3 gap-3">
      {QUESTION_COUNTS.map((count) => (
        <OptionCard
          key={count}
          name="question-count"
          value={String(count)}
          checked={value === count}
          onSelect={() => onChange(count)}
        >
          <span className="block text-center text-xl font-semibold tabular-nums text-slate-950">
            {count}
          </span>
        </OptionCard>
      ))}
    </div>

    <p className="mt-1.5 text-xs text-slate-500">
      Shown {QUESTIONS_PER_PAGE} at a time.
    </p>
  </fieldset>
);

export default QuestionCountSelector;
