import axios from "axios";
import type { PlanId } from "../config/plans";

const SERVER = import.meta.env.VITE_API_URL || "http://localhost:5000";

export type ProPlanId = Exclude<PlanId, "free">;

export interface BillingOrder {
  keyId: string;
  orderId: string;
  amount: number;
  currency: string;
  planId: ProPlanId;
  planName: string;
}

export interface SubscriptionDetails {
  id: string;
  planId: ProPlanId;
  startsAt: string;
  expiresAt: string;
  status: "active";
}

interface CreateOrderResponse {
  message: string;
  order: BillingOrder;
}

interface VerifyPaymentResponse {
  message: string;
  subscription: {
    planId: ProPlanId;
    startsAt: string;
    expiresAt: string;
  };
}

interface SubscriptionResponse {
  subscription: SubscriptionDetails | null;
}

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error("Please log in to continue.");
  }

  return {
    Authorization: `Bearer ${token}`,
  };
};

export const createBillingOrder = async (
  planId: ProPlanId,
): Promise<BillingOrder> => {
  const { data } = await axios.post<CreateOrderResponse>(
    `${SERVER}/api/billing/orders`,
    { planId },
    { headers: getAuthHeaders() },
  );

  return data.order;
};

export const verifyBillingPayment = async (
  payment: RazorpayPaymentResponse,
): Promise<VerifyPaymentResponse> => {
  const { data } = await axios.post<VerifyPaymentResponse>(
    `${SERVER}/api/billing/verify`,
    {
      orderId: payment.razorpay_order_id,
      paymentId: payment.razorpay_payment_id,
      signature: payment.razorpay_signature,
    },
    { headers: getAuthHeaders() },
  );

  return data;
};

export const getSubscription =
  async (): Promise<SubscriptionDetails | null> => {
    const { data } = await axios.get<SubscriptionResponse>(
      `${SERVER}/api/billing/subscription`,
      {
        headers: getAuthHeaders(),
      },
    );

    return data.subscription;
  };
