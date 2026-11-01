import type { ReactNode } from "react";

interface OptionCardProps {
  name: string;
  value: string;
  checked: boolean;
  onSelect: () => void;
  children: ReactNode;
}

// A native radio input, so keyboard and screen reader support come for free.
const OptionCard = ({
  name,
  value,
  checked,
  onSelect,
  children,
}: OptionCardProps) => (
  <label
    className={`block cursor-pointer rounded-lg border p-4 transition-colors has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-60 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-blue-700 ${
      checked
        ? "border-blue-700 bg-blue-50 ring-1 ring-blue-700"
        : "border-slate-300 bg-white hover:border-slate-400"
    }`}
  >
    <input
      type="radio"
      name={name}
      value={value}
      checked={checked}
      onChange={onSelect}
      className="sr-only"
    />
    {children}
  </label>
);

export default OptionCard;
