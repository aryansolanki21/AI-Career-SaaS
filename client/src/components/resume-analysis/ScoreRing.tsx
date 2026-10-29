import { useEffect, useState } from "react";

interface ScoreRingProps {
  score: number;
  size?: number;
}

const RADIUS = 42;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const getRingColor = (score: number): string => {
  if (score >= 80) return "stroke-emerald-600";
  if (score >= 60) return "stroke-amber-600";
  return "stroke-red-600";
};

const ScoreRing = ({ score, size = 128 }: ScoreRingProps) => {
  const safeScore = Number.isFinite(score) ? score : 0;
  const normalizedScore = Math.round(Math.min(100, Math.max(0, safeScore)));

  const [filled, setFilled] = useState(false);

  // One-time fill when the report appears. Disabled for reduced-motion users via CSS.
  useEffect(() => {
    const id = requestAnimationFrame(() => setFilled(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const offset = filled
    ? CIRCUMFERENCE * (1 - normalizedScore / 100)
    : CIRCUMFERENCE;

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
          r={RADIUS}
          fill="none"
          strokeWidth="8"
          className="stroke-slate-200"
        />
        <circle
          cx="50"
          cy="50"
          r={RADIUS}
          fill="none"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={offset}
          className={`${getRingColor(normalizedScore)} transition-[stroke-dashoffset] duration-1000 ease-out motion-reduce:transition-none`}
        />
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold tabular-nums text-slate-950">
          {normalizedScore}
        </span>
        <span className="text-xs text-slate-500">out of 100</span>
      </div>
    </div>
  );
};

export default ScoreRing;
