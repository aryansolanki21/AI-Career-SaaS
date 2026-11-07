import axios from "axios";
import { useEffect, useState } from "react";

import { getSubscription } from "../services/billing.service";
import type { SubscriptionDetails } from "../services/billing.service";
import { useAppData } from "../context/useAppData";

const getErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    return (
      error.response?.data?.message ??
      "Unable to load your subscription details."
    );
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Unable to load your subscription details.";
};

export const useSubscription = () => {
  const { isAuth } = useAppData();

  const [subscription, setSubscription] = useState<SubscriptionDetails | null>(
    null,
  );

  const [error, setError] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!isAuth) {
      return;
    }

    let cancelled = false;

    const loadSubscription = async () => {
      try {
        const data = await getSubscription();

        if (cancelled) return;

        setSubscription(data);
        setError(null);
        setLoaded(true);
      } catch (error: unknown) {
        if (cancelled) return;

        setSubscription(null);
        setError(getErrorMessage(error));
        setLoaded(true);
      }
    };

    void loadSubscription();

    return () => {
      cancelled = true;
    };
  }, [isAuth]);

  const refetch = async () => {
    if (!isAuth) return;

    setLoaded(false);
    setError(null);

    try {
      const data = await getSubscription();

      setSubscription(data);
      setError(null);
      setLoaded(true);
    } catch (error: unknown) {
      setSubscription(null);
      setError(getErrorMessage(error));
      setLoaded(true);
    }
  };

  return {
    subscription,
    loading: isAuth && !loaded,
    error,
    refetch,
  };
};
