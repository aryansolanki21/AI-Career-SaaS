interface ScoreRingProps {
  score: number;
  size?: number;
}

const ScoreRing = ({ score, size = 160 }: ScoreRingProps) => {
  const normalizedScore = Math.min(100, Math.max(0, score));
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const progress = (normalizedScore / 100) * circumference;

  const scoreColor =
    normalizedScore >= 80
      ? "#34d399"
      : normalizedScore >= 60
        ? "#fbbf24"
        : "#f87171";

  return (
    <div
      className="relative shrink-0"
      style={{ width: size, height: size }}
      role="img"
      aria-label={`ATS score: ${normalizedScore} out of 100`}
    >
      <svg
        className="-rotate-90"
        width={size}
        height={size}
        viewBox="0 0 100 100"
        aria-hidden="true"
      >
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeOpacity="0.1"
          strokeWidth="7"
        />

        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke={scoreColor}
          strokeWidth="7"
          strokeLinecap="round"
          strokeDasharray={`${progress} ${circumference}`}
          className="transition-all duration-1000 ease-out"
        />
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold text-slate-900">
          {normalizedScore}
        </span>

        <span className="mt-1 text-xs font-medium uppercase tracking-widest text-slate-500">
          ATS Score
        </span>

        <span className="mt-1 text-xs text-slate-400">out of 100</span>
      </div>
    </div>
  );
};

export default ScoreRing;
