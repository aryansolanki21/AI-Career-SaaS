import { useEffect, useRef } from "react";

import JobMatchForm from "../components/job-matcher/Jobmatchform";
import MatchResults from "../components/job-matcher/Matchresults";
import UpgradeToPro from "../components/common/UpgradeToPro";
import { useJobMatch } from "../hooks/useJobMatch";

const JobMatcher = () => {
  const { result, loading, error, freeLimitReached, submit, reset } =
    useJobMatch();

  const resultsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (result) {
      resultsRef.current?.scrollIntoView({ block: "start" });
    }
  }, [result]);

  return (
    <main className="px-4 py-10 sm:px-6 sm:py-14">
      <div className="mx-auto max-w-4xl">
        <header className="mb-8 max-w-2xl">
          <h1 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
            Job matching
          </h1>

          <p className="mt-3 text-base leading-relaxed text-slate-600">
            Upload your resume and paste a job description. You get a match
            score, an evidence check for each requirement, and what to fix
            before you apply.
          </p>
        </header>

        <div hidden={result !== null}>
          <JobMatchForm
            loading={loading}
            error={error}
            freeLimitReached={freeLimitReached}
            onSubmit={(resume, jobDescription) =>
              void submit(resume, jobDescription)
            }
          />
        </div>

        {freeLimitReached && !loading && <UpgradeToPro />}

        {result && (
          <div ref={resultsRef} className="scroll-mt-24">
            <MatchResults result={result} onReset={reset} />
          </div>
        )}
      </div>
    </main>
  );
};

export default JobMatcher;
