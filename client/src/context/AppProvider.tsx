import axios from "axios";
import { useEffect, useState, type ReactNode } from "react";
import toast, { Toaster } from "react-hot-toast";
import type { AppContextType, User } from "../types";
import AppContext from "./AppContext";

const server = import.meta.env.VITE_API_URL || "http://localhost:5000";

interface AppProps {
  children: ReactNode;
}

export const AppProvider = ({ children }: AppProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuth, setIsAuth] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const restoreSession = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        if (!cancelled) {
          setLoading(false);
        }
        return;
      }

      try {
        const { data } = await axios.get(`${server}/api/user/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!cancelled) {
          const currentUser: User = data.user ?? data;
          setUser(currentUser);
          setIsAuth(true);
        }
      } catch (error) {
        if (!cancelled) {
          console.error("Failed to fetch current user:", error);
          localStorage.removeItem("token");
          setUser(null);
          setIsAuth(false);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    // Defer initialization so the effect doesn't synchronously trigger state updates.
    void Promise.resolve().then(restoreSession);

    return () => {
      cancelled = true;
    };
  }, []);

  const LogoutUser = () => {
    localStorage.removeItem("token");
    setUser(null);
    setIsAuth(false);
    toast.success("Logged out successfully");
  };

  const contextValue: AppContextType = {
    user,
    isAuth,
    loading,
    setUser,
    setIsAuth,
    setLoading,
    LogoutUser,
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
      <Toaster position="top-right" />
    </AppContext.Provider>
  );
};

export default AppProvider;
