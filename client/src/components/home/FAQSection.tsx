interface FAQItem {
  q: string;
  a: string;
}

const FAQS: FAQItem[] = [
  {
    q: "What file types can I upload?",
    a: "PDF and DOCX. Scanned images of a resume are not supported yet.",
  },
  {
    q: "Is the ATS score the same as what employers see?",
    a: "No. Every employer's system works differently. The score shows how well your resume matches a job description and how easily software can read it. Treat it as a guide, not a guarantee.",
  },
  {
    q: "Who can see my resume?",
    a: "Only you. Your resume is used to generate your reports and is not shown to other users.",
  },
  {
    q: "Can I delete my data?",
    a: "Yes. You can delete your resumes and reports from your account settings.",
  },
];

const FOCUS_RING =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700";

const FAQSection = () => {
  return (
    <section id="faq" className="border-t border-slate-200 bg-white">
      <div className="mx-auto grid max-w-6xl gap-8 px-6 py-14 lg:grid-cols-[1fr_1.6fr] lg:py-16">
        <h2 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
          Before you upload
        </h2>

        <div className="divide-y divide-slate-200 border-y border-slate-200">
          {FAQS.map((item) => (
            <details key={item.q} className="group py-5">
              <summary
                className={`flex cursor-pointer list-none items-start justify-between gap-6 text-lg font-semibold text-slate-900 [&::-webkit-details-marker]:hidden ${FOCUS_RING}`}
              >
                <span>{item.q}</span>

                <span
                  aria-hidden="true"
                  className="shrink-0 text-slate-400 group-open:hidden"
                >
                  +
                </span>

                <span
                  aria-hidden="true"
                  className="hidden shrink-0 text-slate-400 group-open:inline"
                >
                  −
                </span>
              </summary>

              <p className="mt-3 max-w-[60ch] text-base leading-relaxed text-slate-600">
                {item.a}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
