import type { InterviewQuestion } from "../../types/interviewPrep";
import QuestionCard from "./QuestionCard";

interface QuestionListProps {
  questions: InterviewQuestion[];
  /** Number of the first question on this page, starting at 1. */
  startNumber: number;
}

const QuestionList = ({ questions, startNumber }: QuestionListProps) => (
  <ol className="space-y-4">
    {questions.map((question, index) => (
      <li key={question.id}>
        <QuestionCard number={startNumber + index} question={question} />
      </li>
    ))}
  </ol>
);

export default QuestionList;
