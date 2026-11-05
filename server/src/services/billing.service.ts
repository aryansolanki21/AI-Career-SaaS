import { randomUUID } from "node:crypto";
import { razorpay, razorpayKeyId } from "../config/razorpay.js";
import { getSubscriptionPlan } from "../config/plans.js";
import {
  createPayment,
  findPaymentByOrderId,
} from "../repositories/payment-repository.js";
import { activateSubscription } from "./subscription.service.js";
import { verifyRazorpaySignature } from "../utils/razorpay-signature.js";
import { HttpError } from "../utils/http-error.js";

export class BillingError extends HttpError {
  constructor(message: string, statusCode: number) {
    super(message, statusCode);
    this.name = "BillingError";
  }
}

export interface CreateOrderInput {
  userId: string;
  planId: string;
}

export interface CreateOrderResult {
  keyId: string;
  orderId: string;
  amount: number;
  currency: string;
  planId: string;
  planName: string;
}

export interface VerifyPaymentInput {
  userId: string;
  orderId: string;
  paymentId: string;
  signature: string;
}

export interface VerifyPaymentResult {
  message: string;
  planId: string;
  startsAt: Date;
  expiresAt: Date;
}

export const createBillingOrder = async (
  input: CreateOrderInput,
): Promise<CreateOrderResult> => {
  const plan = getSubscriptionPlan(input.planId);

  if (!plan) {
    throw new BillingError("Invalid subscription plan.", 400);
  }

  const receipt = `cc_${randomUUID().replace(/-/g, "").slice(0, 32)}`;

  const order = await razorpay.orders.create({
    amount: plan.amount,
    currency: plan.currency,
    receipt,
    notes: {
      userId: input.userId,
      planId: plan.id,
    },
  });

  try {
    await createPayment({
      userId: input.userId,
      planId: plan.id,
      razorpayOrderId: order.id,
      amount: plan.amount,
      currency: plan.currency,
    });
  } catch (error: unknown) {
    console.error("Failed to persist Razorpay order:", error);

    throw new BillingError(
      "Unable to prepare your payment. Please try again.",
      500,
    );
  }

  return {
    keyId: razorpayKeyId,
    orderId: order.id,
    amount: plan.amount,
    currency: plan.currency,
    planId: plan.id,
    planName: plan.name,
  };
};

export const verifyBillingPayment = async (
  input: VerifyPaymentInput,
): Promise<VerifyPaymentResult> => {
  const paymentRecord = await findPaymentByOrderId(input.orderId);

  if (!paymentRecord) {
    throw new BillingError("Payment order not found.", 404);
  }

  if (paymentRecord.userId !== input.userId) {
    throw new BillingError(
      "You are not authorized to verify this payment.",
      403,
    );
  }

  if (paymentRecord.status === "paid") {
    throw new BillingError("This payment has already been processed.", 409);
  }

  if (paymentRecord.status !== "created") {
    throw new BillingError("This payment cannot be verified.", 400);
  }

  const signatureIsValid = verifyRazorpaySignature(
    input.orderId,
    input.paymentId,
    input.signature,
  );

  if (!signatureIsValid) {
    throw new BillingError("Invalid payment signature.", 400);
  }

  const [order, payment] = await Promise.all([
    razorpay.orders.fetch(input.orderId),
    razorpay.payments.fetch(input.paymentId),
  ]);

  if (payment.order_id !== input.orderId) {
    throw new BillingError("Payment does not belong to this order.", 400);
  }

  if (
    order.amount !== paymentRecord.amount ||
    payment.amount !== paymentRecord.amount
  ) {
    throw new BillingError("Payment amount does not match the order.", 400);
  }

  if (
    order.currency !== paymentRecord.currency ||
    payment.currency !== paymentRecord.currency
  ) {
    throw new BillingError("Payment currency does not match the order.", 400);
  }

  if (payment.status !== "captured") {
    throw new BillingError("Payment has not been captured successfully.", 400);
  }

  if (order.status !== "paid") {
    throw new BillingError("Razorpay order is not marked as paid.", 400);
  }

  const subscription = await activateSubscription({
    razorpayOrderId: input.orderId,
    razorpayPaymentId: input.paymentId,
  });

  return {
    message: "Pro subscription activated successfully.",
    planId: subscription.planId,
    startsAt: subscription.startsAt,
    expiresAt: subscription.expiresAt,
  };
};
