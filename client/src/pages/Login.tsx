import { useState, type SubmitEventHandler } from "react";
import { Navigate } from "react-router-dom";
import { useGoogleLogin } from "@react-oauth/google";
import axios from "axios";
import toast from "react-hot-toast";
import validator from "validator";
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

interface AuthResponse {
  token: string;
  user: User;
}

interface FieldErrors {
  email?: string;
  password?: string;
}

// A 401 here means wrong credentials, so the server's own message comes first.
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

const Login = () => {
  const { isAuth, setUser, setIsAuth } = useAppData();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const busy = loading || googleLoading;

  const completeLogin = (data: AuthResponse) => {
    if (!data.token || !data.user) {
      throw new Error("Unexpected response from the server.");
    }

    localStorage.setItem("token", data.token);

    setUser({
      ...data.user,
      freeRequestsUsed: data.user.freeRequestsUsed ?? 0,
    });
    setIsAuth(true);

    toast.success("Welcome back.");
  };

  const handleSubmit: SubmitEventHandler<HTMLFormElement> = async (event) => {
    event.preventDefault();
    setFormError("");

    const nextErrors: FieldErrors = {};

    if (!validator.isEmail(email.trim())) {
      nextErrors.email = "Enter a valid email address.";
    }

    if (!password) {
      nextErrors.password = "Enter your password.";
    }

    setErrors(nextErrors);

    if (nextErrors.email || nextErrors.password) {
      document
        .getElementById(nextErrors.email ? "login-email" : "login-password")
        ?.focus();
      return;
    }

    setLoading(true);

    try {
      const { data } = await axios.post<AuthResponse>(
        `${SERVER}/api/user/login`,
        { email: email.trim().toLowerCase(), password },
      );

      completeLogin(data);
    } catch (error: unknown) {
      setFormError(getErrorMessage(error, "Unable to log in. Please try again."));
    } finally {
      setLoading(false);
    }
  };

  const googleLogin = useGoogleLogin({
    flow: "auth-code",
    onSuccess: async ({ code }) => {
      setGoogleLoading(true);
      setFormError("");

      try {
        const { data } = await axios.post<AuthResponse>(
          `${SERVER}/api/user/google`,
          { code },
        );

        completeLogin(data);
      } catch (error: unknown) {
        setFormError(
          getErrorMessage(error, "Google log in failed. Please try again."),
        );
      } finally {
        setGoogleLoading(false);
      }
    },
    onError: () =>
      setFormError("Google log in was cancelled or could not be completed."),
  });

  // Anyone who is already logged in goes straight to the home page.
  if (isAuth) return <Navigate to="/" replace />;

  return (
    <AuthLayout
      title="Log in"
      footer={
        <>
          Don&apos;t have an account? <AuthLink to="/register">Sign up</AuthLink>
        </>
      }
    >
      <GoogleButton
        label="Continue with Google"
        loadingLabel="Logging in with Google..."
        loading={googleLoading}
        disabled={busy}
        onClick={() => googleLogin()}
      />

      <OrDivider label="or log in with email" />

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <TextField
          id="login-email"
          label="Email address"
          type="email"
          autoComplete="username"
          placeholder="you@example.com"
          value={email}
          onChange={(value) => {
            setEmail(value);
            setErrors((current) => ({ ...current, email: undefined }));
          }}
          error={errors.email}
          disabled={busy}
        />

        <PasswordField
          id="login-password"
          label="Password"
          autoComplete="current-password"
          placeholder="Enter your password"
          value={password}
          onChange={(value) => {
            setPassword(value);
            setErrors((current) => ({ ...current, password: undefined }));
          }}
          error={errors.password}
          disabled={busy}
        />

        <FormAlert message={formError} />

        <SubmitButton
          label="Log in"
          loadingLabel="Logging in..."
          loading={loading}
          disabled={busy}
        />
      </form>
    </AuthLayout>
  );
};

export default Login;