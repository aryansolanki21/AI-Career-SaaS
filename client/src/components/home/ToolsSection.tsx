import {
  BriefcaseBusiness,
  FileSearch,
  FileText,
  MessageSquareText,
  type LucideIcon,
} from "lucide-react";
import { Link } from "react-router-dom";

interface Tool {
  name: string;
  to: string;
  icon: LucideIcon;
  summary: string;
  input: string;
  output: string;
}

const TOOLS: Tool[] = [
  {
    name: "Resume analysis",
    to: "/analyse",
    icon: FileSearch,
    summary:
      "Analyzes your resume and identifies areas to improve its ATS compatibility.",
    input: "Resume + job description",
    output: "ATS score, keyword gaps and improvement suggestions",
  },
  {
    name: "Job matching",
    to: "/jobmatcher",
    icon: BriefcaseBusiness,
    summary:
      "Compares your resume against a job description to identify matching skills and missing requirements.",
    input: "Resume + job description",
    output: "Match score, requirement analysis and skill gaps",
  },
  {
    name: "Resume builder",
    to: "/resumebuilder",
    icon: FileText,
    summary:
      "Builds a professional, ATS-friendly resume with a clean and readable layout.",
    input: "Your personal, educational and professional details",
    output: "A downloadable resume PDF",
  },
  {
    name: "Interview prep",
    to: "/interviewprep",
    icon: MessageSquareText,
    summary:
      "Generates job-specific technical or HR interview questions with helpful hints.",
    input: "Job role + job description",
    output: "20–40 interview questions with hints and PDF download",
  },
];

const FOCUS_RING =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700";

const ToolsSection = () => {
  return (
    <section id="tools" className="border-y border-slate-200 bg-white">
      <div className="mx-auto max-w-6xl px-6 py-14 lg:py-16">
        <div className="max-w-2xl">
          <h2 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
            Four tools, built around your career
          </h2>

          <p className="mt-3 text-lg leading-relaxed text-slate-600">
            From improving your resume to preparing for interviews, get the
            tools you need throughout your job search.
          </p>
        </div>

        <ul className="mt-10 divide-y divide-slate-200 border-y border-slate-200">
          {TOOLS.map(({ name, to, icon: Icon, summary, input, output }) => (
            <li key={name}>
              <Link
                to={to}
                className={`group grid gap-3 py-6 transition-colors hover:bg-slate-50 md:grid-cols-[1fr_1.4fr_1.2fr] md:gap-10 md:px-4 ${FOCUS_RING}`}
              >
                <div className="flex gap-4">
                  <Icon
                    size={22}
                    className="mt-0.5 shrink-0 text-slate-500 group-hover:text-blue-700"
                    aria-hidden="true"
                  />

                  <div>
                    <h3 className="text-xl font-semibold text-slate-950 group-hover:text-blue-700">
                      {name}
                    </h3>

                    <p className="mt-1 max-w-[36ch] text-base text-slate-600">
                      {summary}
                    </p>
                  </div>
                </div>

                <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm md:col-span-2 md:grid-cols-[1fr_1.2fr]">
                  <div className="contents md:block">
                    <dt className="font-medium text-slate-500">You give</dt>
                    <dd className="text-slate-800">{input}</dd>
                  </div>

                  <div className="contents md:block">
                    <dt className="font-medium text-slate-500">You get</dt>
                    <dd className="text-slate-800">{output}</dd>
                  </div>
                </dl>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};

export default ToolsSection;
