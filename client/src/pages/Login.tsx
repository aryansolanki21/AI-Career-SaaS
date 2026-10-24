import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGoogleLogin } from "@react-oauth/google";
import axios from "axios";
import toast from "react-hot-toast";
import { ArrowRight, Sparkles } from "lucide-react";
import { useAppData } from "../context/useAppData";

const server = import.meta.env.VITE_API_URL || "http://localhost:5000";

interface LoginResponse {
  message: string;
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    image: string | null;
    subscription: string | null;
    freeRequestsUsed?: number;
  };
}

const Login = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { setUser, setIsAuth } = useAppData();

  const handleGoogleLogin = useGoogleLogin({
    flow: "auth-code",

    onSuccess: async (response) => {
      setLoading(true);

      try {
        const result = await axios.post<LoginResponse>(
          `${server}/api/user/login`,
          {
            code: response.code,
          },
        );

        localStorage.setItem("token", result.data.token);

        setUser({
          ...result.data.user,
          freeRequestsUsed: result.data.user.freeRequestsUsed ?? 0,
        });

        setIsAuth(true);

        toast.success(result.data.message || "Login successful");
        navigate("/", { replace: true });
      } catch (error) {
        console.error("Google login failed:", error);

        if (axios.isAxiosError(error)) {
          toast.error(
            error.response?.data?.message || "Login failed. Please try again.",
          );
        } else {
          toast.error("Something went wrong. Please try again.");
        }
      } finally {
        setLoading(false);
      }
    },

    onError: () => {
      toast.error("Google sign-in was unsuccessful.");
    },
  });

  return (
    <main className="relative flex min-h-[calc(100svh-76px)] items-center justify-center overflow-hidden bg-[#f8faff] px-4 py-8 sm:px-6">
      {/* Subtle background accents */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-32 top-10 h-72 w-72 rounded-full bg-indigo-200/30 blur-3xl sm:h-96 sm:w-96"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-32 -right-24 h-72 w-72 rounded-full bg-violet-200/25 blur-3xl sm:h-96 sm:w-96"
      />

      {/* Centered authentication card */}
      <section className="relative z-10 w-full max-w-md rounded-3xl border border-slate-200/80 bg-white px-6 py-9 shadow-xl shadow-slate-200/50 sm:px-10 sm:py-10">
        {/* Brand */}
        <div className="flex flex-col items-center text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-200/70">
            <Sparkles size={27} strokeWidth={1.9} />
          </div>

          <p className="mt-4 text-xl font-bold tracking-tight text-slate-900">
            CareerCraft <span className="text-indigo-600">AI</span>
          </p>

          <h1 className="mt-8 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Welcome back
          </h1>

          <p className="mt-3 text-sm leading-6 text-slate-500 sm:text-base">
            Sign in to your account to continue.
          </p>
        </div>

        {/* Google authentication */}
        <div className="mt-8">
          <button
            type="button"
            onClick={() => handleGoogleLogin()}
            disabled={loading}
            aria-label="Continue with Google"
            className="group flex min-h-14 w-full items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white px-5 py-3.5 text-sm font-semibold text-slate-800 shadow-sm transition-all duration-200 hover:border-indigo-300 hover:bg-slate-50 hover:shadow-md focus:outline-none focus-visible:ring-4 focus-visible:ring-indigo-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? (
              <>
                <span className="h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-indigo-600" />
                <span>Signing you in...</span>
              </>
            ) : (
              <>
                {/* Google logo */}
                <svg
                  aria-hidden="true"
                  className="h-5 w-5 shrink-0"
                  viewBox="0 0 48 48"
                >
                  <path
                    fill="#EA4335"
                    d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5Z"
                  />
                  <path
                    fill="#4285F4"
                    d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.76 7.18l7.73 6C44.42 37.96 46.98 31.78 46.98 24.55Z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M10.53 28.59A14.4 14.4 0 0 1 9.75 24c0-1.59.27-3.13.76-4.59l-7.98-6.19A23.9 23.9 0 0 0 0 24c0 3.87.93 7.52 2.56 10.78l7.97-6.19Z"
                  />
                  <path
                    fill="#34A853"
                    d="M24 48c6.48 0 11.93-2.13 15.91-5.8l-7.73-6c-2.14 1.45-4.89 2.3-8.18 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48Z"
                  />
                </svg>

                <span>Continue with Google</span>

                <ArrowRight
                  size={17}
                  className="ml-auto text-slate-400 transition-transform group-hover:translate-x-1 group-hover:text-indigo-600"
                />
              </>
            )}
          </button>
        </div>
      </section>

      {/* Footer */}
      <p className="absolute bottom-3 left-4 right-4 text-center text-[11px] text-slate-400">
        © {new Date().getFullYear()} CareerCraft AI. All rights reserved.
      </p>
    </main>
  );
};

export default Login;
