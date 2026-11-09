import { useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { AlertCircle, Eye, EyeOff, LoaderCircle } from "lucide-react";

const FOCUS_RING =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700";

const LABEL_CLASS = "mb-1.5 block text-sm font-medium text-slate-800";

const inputClass = (invalid: boolean): string =>
  `h-11 w-full rounded-lg border bg-white px-3.5 text-sm text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:ring-2 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500 ${invalid
    ? "border-red-600 focus:border-red-600 focus:ring-red-600/20"
    : "border-slate-300 focus:border-blue-700 focus:ring-blue-700/20"
  }`;

/* ---------- Page frame ---------- */

interface AuthLayoutProps {
  title: string;
  subtitle?: string;
  footer: ReactNode;
  children: ReactNode;
}

export const AuthLayout = ({
  title,
  subtitle,
  footer,
  children,
}: AuthLayoutProps) => (
  <main className="flex min-h-[calc(100svh-4rem)] items-center justify-center px-4 py-10 sm:px-6">
    <section className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <header className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-slate-950">
          {title}
        </h1>

        {subtitle && (
          <p className="mt-1.5 text-sm leading-6 text-slate-600">{subtitle}</p>
        )}
      </header>

      {children}

      <p className="mt-6 text-center text-sm text-slate-600">{footer}</p>
    </section>
  </main>
);

export const AuthLink = ({ to, children }: { to: string; children: ReactNode }) => (
  <Link
    to={to}
    className={`rounded font-semibold text-blue-700 underline-offset-4 hover:underline ${FOCUS_RING}`}
  >
    {children}
  </Link>
);

export const OrDivider = ({ label }: { label: string }) => (
  <div className="my-6 flex items-center gap-4">
    <span className="h-px flex-1 bg-slate-200" />
    <span className="text-xs font-medium text-slate-500">{label}</span>
    <span className="h-px flex-1 bg-slate-200" />
  </div>
);

/* ---------- Fields ---------- */

interface TextFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: "text" | "email";
  autoComplete?: string;
  placeholder?: string;
  maxLength?: number;
  error?: string;
  disabled?: boolean;
}

export const TextField = ({
  id,
  label,
  value,
  onChange,
  type = "text",
  autoComplete,
  placeholder,
  maxLength,
  error,
  disabled = false,
}: TextFieldProps) => (
  <div>
    <label htmlFor={id} className={LABEL_CLASS}>
      {label}
    </label>

    <input
      id={id}
      name={id}
      type={type}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      autoComplete={autoComplete}
      placeholder={placeholder}
      maxLength={maxLength}
      disabled={disabled}
      aria-invalid={Boolean(error)}
      aria-describedby={error ? `${id}-error` : undefined}
      className={inputClass(Boolean(error))}
    />

    {error && (
      <p id={`${id}-error`} className="mt-1.5 text-sm text-red-700">
        {error}
      </p>
    )}
  </div>
);

interface PasswordFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  autoComplete: "current-password" | "new-password";
  placeholder?: string;
  error?: string;
  disabled?: boolean;
  /** Id of an element, such as a requirements list, that also describes this field. */
  describedBy?: string;
  children?: ReactNode;
}

export const PasswordField = ({
  id,
  label,
  value,
  onChange,
  autoComplete,
  placeholder,
  error,
  disabled = false,
  describedBy,
  children,
}: PasswordFieldProps) => {
  const [visible, setVisible] = useState(false);

  const descriptionIds = [error ? `${id}-error` : null, describedBy]
    .filter(Boolean)
    .join(" ");

  return (
    <div>
      <label htmlFor={id} className={LABEL_CLASS}>
        {label}
      </label>

      <div className="relative">
        <input
          id={id}
          name={id}
          type={visible ? "text" : "password"}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          autoComplete={autoComplete}
          placeholder={placeholder}
          disabled={disabled}
          aria-invalid={Boolean(error)}
          aria-describedby={descriptionIds || undefined}
          className={`${inputClass(Boolean(error))} pr-11`}
        />

        <button
          type="button"
          onClick={() => setVisible((current) => !current)}
          disabled={disabled}
          aria-label={visible ? "Hide password" : "Show password"}
          aria-pressed={visible}
          className={`absolute inset-y-0 right-0 flex w-11 items-center justify-center rounded-r-lg text-slate-500 transition-colors hover:text-slate-900 disabled:cursor-not-allowed ${FOCUS_RING}`}
        >
          {visible ? (
            <EyeOff size={18} aria-hidden="true" />
          ) : (
            <Eye size={18} aria-hidden="true" />
          )}
        </button>
      </div>

      {error && (
        <p id={`${id}-error`} className="mt-1.5 text-sm text-red-700">
          {error}
        </p>
      )}

      {children}
    </div>
  );
};

/* ---------- Buttons and messages ---------- */

interface SubmitButtonProps {
  label: string;
  loadingLabel: string;
  loading: boolean;
  disabled: boolean;
}

export const SubmitButton = ({
  label,
  loadingLabel,
  loading,
  disabled,
}: SubmitButtonProps) => (
  <button
    type="submit"
    disabled={disabled}
    className={`inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-blue-700 px-4 text-sm font-semibold text-white transition-colors hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60 ${FOCUS_RING}`}
  >
    {loading && (
      <LoaderCircle size={18} className="animate-spin" aria-hidden="true" />
    )}

    {loading ? loadingLabel : label}
  </button>
);

interface GoogleButtonProps {
  label: string;
  loadingLabel: string;
  loading: boolean;
  disabled: boolean;
  onClick: () => void;
}

export const GoogleButton = ({
  label,
  loadingLabel,
  loading,
  disabled,
  onClick,
}: GoogleButtonProps) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    aria-busy={loading}
    className={`inline-flex h-11 w-full items-center justify-center gap-3 rounded-lg border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-800 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 ${FOCUS_RING}`}
  >
    {loading ? (
      <LoaderCircle size={18} className="animate-spin" aria-hidden="true" />
    ) : (
      <svg aria-hidden="true" viewBox="0 0 48 48" className="h-5 w-5">
        <path
          fill="#EA4335"
          d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 3.11 13.22l7.98 6.19C13 13.72 18.1 9.5 24 9.5Z"
          transform="translate(0 4)"
        />
        <path
          fill="#4285F4"
          d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.73 7.18l7.66 5.94c4.47-4.13 7.11-10.2 7.11-17.59Z"
        />
        <path
          fill="#FBBC05"
          d="M10.53 28.59A14.4 14.4 0 0 1 9.75 24c0-1.59.27-3.13.75-4.59l-7.98-6.19A23.9 23.9 0 0 0 0 24c0 3.87.93 7.52 2.52 10.78l8.01-6.19Z"
        />
        <path
          fill="#34A853"
          d="M24 48c6.48 0 11.93-2.13 15.9-5.82l-7.66-5.94c-2.13 1.43-4.86 2.26-8.24 2.26-5.9 0-11-4.22-12.91-9.91l-8.01 6.19C6.51 42.62 14.62 48 24 48Z"
        />
      </svg>
    )}

    {loading ? loadingLabel : label}
  </button>
);

export const FormAlert = ({ message }: { message: string }) =>
  message ? (
    <div
      role="alert"
      className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700"
    >
      <AlertCircle size={18} className="mt-0.5 shrink-0" aria-hidden="true" />

      <p className="leading-6">{message}</p>
    </div>
  ) : null;