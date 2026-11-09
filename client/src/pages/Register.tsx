import { useState, type SubmitEventHandler } from "react";
import { Navigate } from "react-router-dom";
import { useGoogleLogin } from "@react-oauth/google";
import axios from "axios";
import toast from "react-hot-toast";
import validator from "validator";
import { Check, Circle } from "lucide-react";
import {
  AuthLayout,
  AuthLink,
  FormAlert,
  GoogleButton,
  OrDivider,
  PasswordField,
  SubmitButton,
  TextField,
} from "../components/auth/AutoParts";
import { useAppData } from "../context/useAppData";
import type { User } from "../types";

const SERVER = import.meta.env.VITE_API_URL || "http://localhost:5000";

// bcrypt only reads the first 72 bytes of a password.
const MAX_PASSWORD_BYTES = 72;

interface AuthResponse {
  token: string;
  user: User;
}

type Fields = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
};

type FieldErrors = Partial<Record<keyof Fields, string>>;

const FIELD_ORDER: (keyof Fields)[] = [
  "name",
  "email",
  "password",
  "confirmPassword",
];

// Each rule is checked with the same library as the final check, so they always agree.
const NO_MINIMUMS = {
  minLength: 0,
  minLowercase: 0,
  minUppercase: 0,
  minNumbers: 0,
  minSymbols: 0,
};

const PASSWORD_RULES: { label: string; test: (value: string) => boolean }[] = [
  { label: "At least 8 characters", test: (value) => value.length >= 8 },
  {
    label: "A lowercase letter",
    test: (value) =>
      validator.isStrongPassword(value, { ...NO_MINIMUMS, minLowercase: 1 }),
  },
  {
    label: "An uppercase letter",
    test: (value) =>
      validator.isStrongPassword(value, { ...NO_MINIMUMS, minUppercase: 1 }),
  },
  {
    label: "A number",
    test: (value) =>
      validator.isStrongPassword(value, { ...NO_MINIMUMS, minNumbers: 1 }),
  },
  {
    label: "A special character",
    test: (value) =>
      validator.isStrongPassword(value, { ...NO_MINIMUMS, minSymbols: 1 }),
  },
];

const validate = (fields: Fields): FieldErrors => {
  const errors: FieldErrors = {};

  if (fields.name.trim().length < 2) {
    errors.name = "Enter your full name.";
  }

  if (!validator.isEmail(fields.email.trim())) {
    errors.email = "Enter a valid email address.";
  }

  if (new TextEncoder().encode(fields.password).length > MAX_PASSWORD_BYTES) {
    errors.password = "Use a shorter password (at most 72 bytes).";
  } else if (!PASSWORD_RULES.every((rule) => rule.test(fields.password))) {
    errors.password = "Your password does not meet every requirement yet.";
  }

  if (fields.password !== fields.confirmPassword) {
    errors.confirmPassword = "The passwords do not match.";
  }

  return errors;
};

const getErrorMessage = (error: unknown, fallback: string): string => {
  if (axios.isAxiosError(error)) {
    const message = error.response?.data?.message;

    if (typeof message === "string" && message.trim()) return message;

    if (!error.response) {
      return "Unable to reach the server. Check your connection and try again.";
    }
  }

  return fallback;
};

const PasswordChecklist = ({ id, password }: { id: string; password: string }) => (
  <ul id={id} aria-label="Password requirements" className="mt-3 space-y-1.5">
    {PASSWORD_RULES.map((rule) => {
      const met = rule.test(password);

      return (
        <li
          key={rule.label}
          className={`flex items-center gap-2 text-sm ${met ? "text-emerald-700" : "text-slate-500"
            }`}
        >
          {met ? (
            <Check size={16} aria-hidden="true" />
          ) : (
            <Circle size={16} aria-hidden="true" />
          )}
          {rule.label}
          <span className="sr-only">{met ? "(done)" : "(not done yet)"}</span>
        </li>
      );
    })}
  </ul>
);

const Register = () => {
  const { isAuth, setUser, setIsAuth } = useAppData();

  const [fields, setFields] = useState<Fields>({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const busy = loading || googleLoading;

  const setField = (key: keyof Fields) => (value: string) => {
    setFields((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  };

  const completeRegistration = (data: AuthResponse, message: string) => {
    if (!data.token || !data.user) {
      throw new Error("Unexpected response from the server.");
    }

    localStorage.setItem("token", data.token);

    setUser({
      ...data.user,
      freeRequestsUsed: data.user.freeRequestsUsed ?? 0,
    });
    setIsAuth(true);

    toast.success(message);
  };

  const handleSubmit: SubmitEventHandler<HTMLFormElement> = async (event) => {
    event.preventDefault();
    setFormError("");

    const nextErrors = validate(fields);
    setErrors(nextErrors);

    const firstInvalid = FIELD_ORDER.find((key) => nextErrors[key]);

    if (firstInvalid) {
      document.getElementById(`register-${firstInvalid}`)?.focus();
      return;
    }

    setLoading(true);

    try {
      const { data } = await axios.post<AuthResponse>(
        `${SERVER}/api/user/register`,
        {
          name: fields.name.trim(),
          email: fields.email.trim().toLowerCase(),
          password: fields.password,
        },
      );

      completeRegistration(data, "Your account is ready.");
    } catch (error: unknown) {
      setFormError(
        getErrorMessage(error, "Unable to create your account. Please try again."),
      );
    } finally {
      setLoading(false);
    }
  };

  const googleSignUp = useGoogleLogin({
    flow: "auth-code",
    onSuccess: async ({ code }) => {
      setGoogleLoading(true);
      setFormError("");

      try {
        const { data } = await axios.post<AuthResponse>(
          `${SERVER}/api/user/google`,
          { code },
        );

        completeRegistration(data, "Welcome to CareerCraft AI.");
      } catch (error: unknown) {
        setFormError(
          getErrorMessage(error, "Google sign up failed. Please try again."),
        );
      } finally {
        setGoogleLoading(false);
      }
    },
    onError: () =>
      setFormError("Google sign up was cancelled or could not be completed."),
  });

  // Anyone who is already logged in goes straight to the home page.
  if (isAuth) return <Navigate to="/" replace />;

  return (
    <AuthLayout
      title="Create your account"
      footer={
        <>
          Already have an account? <AuthLink to="/login">Log in</AuthLink>
        </>
      }
    >
      <GoogleButton
        label="Continue with Google"
        loadingLabel="Signing up with Google..."
        loading={googleLoading}
        disabled={busy}
        onClick={() => googleSignUp()}
      />

      <OrDivider label="or sign up with email" />

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <TextField
          id="register-name"
          label="Full name"
          autoComplete="name"
          placeholder="Your full name"
          maxLength={100}
          value={fields.name}
          onChange={setField("name")}
          error={errors.name}
          disabled={busy}
        />

        <TextField
          id="register-email"
          label="Email address"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          maxLength={254}
          value={fields.email}
          onChange={setField("email")}
          error={errors.email}
          disabled={busy}
        />

        <PasswordField
          id="register-password"
          label="Password"
          autoComplete="new-password"
          placeholder="Create a password"
          value={fields.password}
          onChange={setField("password")}
          error={errors.password}
          disabled={busy}
          describedBy="register-password-rules"
        >
          <PasswordChecklist
            id="register-password-rules"
            password={fields.password}
          />
        </PasswordField>

        <PasswordField
          id="register-confirmPassword"
          label="Confirm password"
          autoComplete="new-password"
          placeholder="Re-enter your password"
          value={fields.confirmPassword}
          onChange={setField("confirmPassword")}
          error={errors.confirmPassword}
          disabled={busy}
        />

        <FormAlert message={formError} />

        <SubmitButton
          label="Create account"
          loadingLabel="Creating account..."
          loading={loading}
          disabled={busy}
        />

        <p className="text-center text-xs leading-5 text-slate-500">
          By signing up, you agree to our{" "}
          <AuthLink to="/terms">Terms</AuthLink> and{" "}
          <AuthLink to="/privacy">Privacy Policy</AuthLink>.
        </p>
      </form>
    </AuthLayout>
  );
};

export default Register;