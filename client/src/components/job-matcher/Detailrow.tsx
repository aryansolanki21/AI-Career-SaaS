import type { ReactNode } from "react";

interface DetailRowProps {
  label: string;
  children: ReactNode;
}

// Renders inside a <dl>.
const DetailRow = ({ label, children }: DetailRowProps) => (
  <div>
    <dt className="font-medium text-slate-500">{label}</dt>
    <dd className="mt-0.5 text-slate-700">{children}</dd>
  </div>
);

export default DetailRow;
