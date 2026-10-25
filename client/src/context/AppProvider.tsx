import axios from "axios";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import toast, { Toaster } from "react-hot-toast";

import type { AppContextType, User } from "../types";
import AppContext from "./AppContext";

const server = import.meta.env.VITE_API_URL || "http://localhost:5000";

interface AppProviderProps {
  children: ReactNode;
}

type ApiUser = Omit<User, "freeRequestsUsed"> & {
  freeRequestsUsed?: number;
};

type CurrentUserResponse =
  | ApiUser
  | {
      user: ApiUser;
    };

const normalizeUser = (data: CurrentUserResponse): User => {
  const apiUser = "user" in data ? data.user : data;

  return {
    ...apiUser,
    freeRequestsUsed: apiUser.freeRequestsUsed ?? 0,
  };
};

export const AppProvider = ({ children }: AppProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuth, setIsAuth] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const restoreSession = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const { data } = await axios.get<CurrentUserResponse>(
          `${server}/api/user/me`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        if (cancelled) return;

        setUser(normalizeUser(data));
        setIsAuth(true);
      } catch (error: unknown) {
        if (cancelled) return;

        if (
          axios.isAxiosError(error) &&
          (error.response?.status === 401 || error.response?.status === 403)
        ) {
          localStorage.removeItem("token");
          setUser(null);
          setIsAuth(false);
        } else {
          console.error("Failed to restore session:", error);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void restoreSession();

    return () => {
      cancelled = true;
    };
  }, []);

  const LogoutUser = useCallback(() => {
    localStorage.removeItem("token");
    setUser(null);
    setIsAuth(false);
    toast.success("Logged out successfully");
  }, []);

  const contextValue: AppContextType = useMemo(
    () => ({
      user,
      isAuth,
      loading,
      setUser,
      setIsAuth,
      setLoading,
      LogoutUser,
    }),
    [user, isAuth, loading, LogoutUser],
  );

  return (
    <AppContext.Provider value={contextValue}>
      {children}
      <Toaster position="top-right" />
    </AppContext.Provider>
  );
};

export default AppProvider;
