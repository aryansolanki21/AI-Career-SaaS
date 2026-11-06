import { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

import type { ProPlanId } from "../config/plans";
import { useAppData } from "../context/useAppData";
import {
  createBillingOrder,
  verifyBillingPayment,
} from "../services/billing.service";

let razorpayScriptPromise: Promise<boolean> | null = null;

const loadRazorpayScript = (): Promise<boolean> => {
  if (window.Razorpay) {
    return Promise.resolve(true);
  }

  if (razorpayScriptPromise) {
    return razorpayScriptPromise;
  }

  razorpayScriptPromise = new Promise((resolve) => {
    const existingScript = document.querySelector(
      'script[src="https://checkout.razorpay.com/v1/checkout.js"]',
    );

    if (existingScript) {
      existingScript.addEventListener("load", () => {
        resolve(Boolean(window.Razorpay));
      });

      existingScript.addEventListener("error", () => {
        razorpayScriptPromise = null;
        resolve(false);
      });

      return;
    }

    const script = document.createElement("script");

    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;

    script.onload = () => {
      resolve(Boolean(window.Razorpay));
    };

    script.onerror = () => {
      razorpayScriptPromise = null;
      resolve(false);
    };

    document.body.appendChild(script);
  });

  return razorpayScriptPromise;
};

const getErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    return (
      error.response?.data?.message ??
      "Payment could not be processed. Please try again."
    );
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Something went wrong. Please try again.";
};

export const useRazorpayCheckout = () => {
  const { user, setUser } = useAppData();
  const [loadingPlanId, setLoadingPlanId] = useState<ProPlanId | null>(null);

  const startCheckout = async (planId: ProPlanId): Promise<void> => {
    if (loadingPlanId) return;

    setLoadingPlanId(planId);

    try {
      const scriptLoaded = await loadRazorpayScript();

      if (!scriptLoaded || !window.Razorpay) {
        throw new Error("Unable to load Razorpay Checkout. Please try again.");
      }

      const order = await createBillingOrder(planId);

      const checkout = new window.Razorpay({
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        name: "CareerCraft AI",
        description: `${order.planName} subscription`,
        order_id: order.orderId,

        prefill: {
          name: user?.name ?? "",
          email: user?.email ?? "",
        },

        theme: {
          color: "#2563eb",
        },

        handler: async (paymentResponse) => {
          try {
            const result = await verifyBillingPayment(paymentResponse);

            setUser((currentUser) =>
              currentUser
                ? {
                    ...currentUser,
                    subscription: result.subscription.expiresAt,
                  }
                : currentUser,
            );

            toast.success("Your Pro subscription is now active.");
          } catch (error: unknown) {
            toast.error(getErrorMessage(error));
          } finally {
            setLoadingPlanId(null);
          }
        },

        modal: {
          ondismiss: () => {
            setLoadingPlanId(null);
          },
        },
      });

      checkout.on("payment.failed", (response) => {
        toast.error(
          response.error.description || "Payment failed. Please try again.",
        );

        setLoadingPlanId(null);
      });

      checkout.open();
    } catch (error: unknown) {
      toast.error(getErrorMessage(error));
      setLoadingPlanId(null);
    }
  };

  return {
    startCheckout,
    loadingPlanId,
  };
};
