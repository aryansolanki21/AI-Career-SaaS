import { pool } from "../config/db.js";
import type { PoolClient } from "pg";
import { getSubscriptionPlan } from "../config/plans.js";
import {
  findPaymentByOrderIdForUpdate,
  markPaymentAsPaid,
} from "../repositories/payment-repository.js";
import {
  createSubscription,
  findSubscriptionByPaymentId,
  type SubscriptionPlanId,
} from "../repositories/subscription-repository.js";

export interface ActivateSubscriptionInput {
  razorpayOrderId: string;
  razorpayPaymentId: string;
}

export interface ActivatedSubscription {
  paymentId: string;
  subscriptionId: string;
  planId: SubscriptionPlanId;
  startsAt: Date;
  expiresAt: Date;
}

const addDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setUTCDate(result.getUTCDate() + days);
  return result;
};

const updateUserSubscription = async (
  client: PoolClient,
  userId: string,
  expiresAt: Date,
): Promise<void> => {
  const result = await client.query(
    `UPDATE users
     SET subscription = $2,
         updated_at = NOW()
     WHERE id = $1`,
    [userId, expiresAt],
  );

  if (result.rowCount !== 1) {
    throw new Error("Failed to update user subscription.");
  }
};

export const activateSubscription = async (
  input: ActivateSubscriptionInput,
): Promise<ActivatedSubscription> => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const payment = await findPaymentByOrderIdForUpdate(
      client,
      input.razorpayOrderId,
    );

    if (!payment) {
      throw new Error("Payment record not found.");
    }

    if (payment.status === "paid") {
      if (payment.razorpayPaymentId !== input.razorpayPaymentId) {
        throw new Error("Payment has already been completed with another ID.");
      }

      const existingSubscription = await findSubscriptionByPaymentId(
        client,
        payment.id,
      );

      if (!existingSubscription) {
        throw new Error("Processed payment has no associated subscription.");
      }

      await client.query("COMMIT");

      return {
        paymentId: payment.id,
        subscriptionId: existingSubscription.id,
        planId: existingSubscription.planId,
        startsAt: existingSubscription.startsAt,
        expiresAt: existingSubscription.expiresAt,
      };
    }

    if (payment.status !== "created") {
      throw new Error("Payment is not eligible for activation.");
    }

    const plan = getSubscriptionPlan(payment.planId);

    if (!plan) {
      throw new Error("Invalid subscription plan.");
    }

    const userResult = await client.query<{ subscription: Date | null }>(
      `SELECT subscription
       FROM users
       WHERE id = $1
       FOR UPDATE`,
      [payment.userId],
    );

    const user = userResult.rows[0];

    if (!user) {
      throw new Error("User not found.");
    }

    const now = new Date();

    const currentExpiry = user.subscription
      ? new Date(user.subscription)
      : null;

    const startsAt = currentExpiry && currentExpiry > now ? currentExpiry : now;

    const expiresAt = addDays(startsAt, plan.durationDays);

    const updatedPayment = await markPaymentAsPaid(
      client,
      input.razorpayOrderId,
      input.razorpayPaymentId,
    );

    const subscription = await createSubscription(client, {
      userId: payment.userId,
      paymentId: updatedPayment.id,
      planId: plan.id,
      startsAt,
      expiresAt,
    });

    await updateUserSubscription(client, payment.userId, expiresAt);

    await client.query("COMMIT");

    return {
      paymentId: updatedPayment.id,
      subscriptionId: subscription.id,
      planId: subscription.planId,
      startsAt: subscription.startsAt,
      expiresAt: subscription.expiresAt,
    };
  } catch (error: unknown) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};
