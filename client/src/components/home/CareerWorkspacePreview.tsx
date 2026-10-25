import {
  ArrowUpRight,
  BriefcaseBusiness,
  FileSearch,
  FileText,
  MessageSquareText,
  Sparkles,
} from "lucide-react";
import { Link } from "react-router-dom";

const tools = [
  {
    title: "Resume analysis",
    description: "Find ways to improve",
    label: "ANALYSE",
    path: "/analyse",
    icon: FileSearch,
    color: "text-violet-600",
    background: "bg-violet-50",
    border: "border-violet-100",
  },
  {
    title: "Job matching",
    description: "Explore relevant roles",
    label: "DISCOVER",
    path: "/jobmatcher",
    icon: BriefcaseBusiness,
    color: "text-emerald-600",
    background: "bg-emerald-50",
    border: "border-emerald-100",
  },
  {
    title: "Resume builder",
    description: "Present your strengths",
    label: "CREATE",
    path: "/resumebuilder",
    icon: FileText,
    color: "text-purple-600",
    background: "bg-purple-50",
    border: "border-purple-100",
  },
  {
    title: "Interview prep",
    description: "Practise with purpose",
    label: "PREPARE",
    path: "/interviewprep",
    icon: MessageSquareText,
    color: "text-amber-600",
    background: "bg-amber-50",
    border: "border-amber-100",
  },
];

const CareerWorkspacePreview = () => {
  return (
    <div className="relative mx-auto w-full max-w-[570px]">
      <div className="absolute -inset-8 -z-10 rounded-[3rem] bg-linear-to-br from-violet-200/50 via-indigo-100/40 to-emerald-100/50 blur-3xl" />

      <div className="rounded-[1.75rem] border border-slate-200/80 bg-white p-5 shadow-[0_24px_80px_-32px_rgba(30,41,59,0.24)] sm:p-7">
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-5">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-violet-600">
              <Sparkles size={15} />
              Career workspace
            </div>

            <h2 className="mt-3 text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
              Your next step, organised.
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              The tools to move your career forward.
            </p>
          </div>

          <div className="hidden h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-violet-50 text-violet-600 sm:flex">
            <BriefcaseBusiness size={23} />
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {tools.map((tool) => {
            const Icon = tool.icon;

            return (
              <Link
                key={tool.title}
                to={tool.path}
                aria-label={`${tool.title}: ${tool.description}`}
                className={`group rounded-2xl border ${tool.border} ${tool.background} p-4 transition duration-200 hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-600`}
              >
                <div className="flex items-center justify-between gap-3">
                  <span
                    className={`flex h-10 w-10 items-center justify-center rounded-xl bg-white ${tool.color} shadow-sm`}
                  >
                    <Icon size={20} strokeWidth={1.9} />
                  </span>

                  <span className="rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-bold tracking-wide text-slate-500">
                    {tool.label}
                  </span>
                </div>

                <div className="mt-4 flex items-center justify-between gap-2">
                  <h3 className="text-sm font-semibold text-slate-900">
                    {tool.title}
                  </h3>

                  <ArrowUpRight
                    size={16}
                    className="shrink-0 text-slate-400 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-slate-700"
                  />
                </div>

                <p className="mt-1.5 text-xs leading-5 text-slate-500">
                  {tool.description}
                </p>
              </Link>
            );
          })}
        </div>

        <div className="mt-4 flex items-start gap-3 rounded-2xl border border-slate-200/70 bg-slate-50 p-4">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-violet-600 shadow-sm">
            <Sparkles size={19} />
          </span>

          <div>
            <h3 className="text-sm font-semibold text-slate-800">
              A clearer path forward
            </h3>
            <p className="mt-1 text-xs leading-5 text-slate-500">
              Understand where you stand, identify what to improve, and prepare
              for your next opportunity.
            </p>
          </div>
        </div>

        <div className="mt-5 flex items-center gap-2 text-xs text-slate-400">
          <span className="flex h-5 w-5 items-center justify-center rounded-full border border-emerald-200 text-emerald-600">
            <Sparkles size={11} />
          </span>
          One workspace for your career journey
        </div>
      </div>

      <div className="absolute -right-2 top-[42%] hidden items-center gap-3 rounded-2xl border border-slate-100 bg-white px-4 py-3 shadow-[0_12px_35px_-15px_rgba(15,23,42,0.28)] sm:flex lg:-right-7">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
          <Sparkles size={19} />
        </span>

        <div>
          <p className="text-xs font-semibold text-slate-800">
            Ready for your next step
          </p>
          <p className="mt-1 text-[11px] text-slate-500">
            Start with your career profile
          </p>
        </div>
      </div>
    </div>
  );
};

export default CareerWorkspacePreview;
