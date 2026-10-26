interface Step {
  title: string;
  body: string;
}

const STEPS: Step[] = [
  {
    title: "Upload your resume",
    body: "PDF or DOCX. Add the job description you are applying for, or skip it for a general review.",
  },
  {
    title: "Read your report",
    body: "See your score, what is missing, and which lines to rewrite, in order of impact.",
  },
  {
    title: "Fix it and apply",
    body: "Edit in the builder, check matching roles, then practise the questions for the one you pick.",
  },
];

const HowItWorksSection = () => {
  return (
    <section
      id="how-it-works"
      className="mx-auto max-w-6xl scroll-mt-20 px-6 py-14 lg:py-16"
    >
      <h2 className="max-w-2xl text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
        From upload to a better application in three steps
      </h2>

      <ol className="mt-10 grid gap-8 md:grid-cols-3">
        {STEPS.map((step, index) => (
          <li key={step.title} className="border-t-2 border-slate-900 pt-5">
            <span className="text-sm font-semibold tabular-nums text-blue-700">
              Step {index + 1}
            </span>

            <h3 className="mt-2 text-xl font-semibold text-slate-950">
              {step.title}
            </h3>

            <p className="mt-2 max-w-[38ch] text-base leading-relaxed text-slate-600">
              {step.body}
            </p>
          </li>
        ))}
      </ol>
    </section>
  );
};

export default HowItWorksSection;
