import { pool } from "../config/db.js";
import type { PoolClient, QueryResultRow } from "pg";

export type SubscriptionPlanId = "pro_monthly" | "pro_six_month";

export interface CreateSubscriptionInput {
  userId: string;
  paymentId: string;
  planId: SubscriptionPlanId;
  startsAt: Date;
  expiresAt: Date;
}

export interface Subscription {
  id: string;
  userId: string;
  paymentId: string;
  planId: SubscriptionPlanId;
  startsAt: Date;
  expiresAt: Date;
  createdAt: Date;
}

interface SubscriptionRow extends QueryResultRow {
  id: string;
  user_id: string;
  payment_id: string;
  plan_id: SubscriptionPlanId;
  starts_at: Date;
  expires_at: Date;
  created_at: Date;
}

const SUBSCRIPTION_COLUMNS = `
  id,
  user_id,
  payment_id,
  plan_id,
  starts_at,
  expires_at,
  created_at
`;

const mapSubscription = (row: SubscriptionRow): Subscription => ({
  id: row.id,
  userId: row.user_id,
  paymentId: row.payment_id,
  planId: row.plan_id,
  startsAt: row.starts_at,
  expiresAt: row.expires_at,
  createdAt: row.created_at,
});

// Creates a subscription using an existing transaction client.
export const createSubscription = async (
  client: PoolClient,
  input: CreateSubscriptionInput,
): Promise<Subscription> => {
  const result = await client.query<SubscriptionRow>(
    `INSERT INTO subscriptions (
      user_id,
      payment_id,
      plan_id,
      starts_at,
      expires_at
    )
    VALUES ($1, $2, $3, $4, $5)
    RETURNING ${SUBSCRIPTION_COLUMNS}`,
    [
      input.userId,
      input.paymentId,
      input.planId,
      input.startsAt,
      input.expiresAt,
    ],
  );

  const row = result.rows[0];

  if (!row) {
    throw new Error("Failed to create subscription record.");
  }

  return mapSubscription(row);
};

export const findSubscriptionByPaymentId = async (
  client: PoolClient,
  paymentId: string,
): Promise<Subscription | null> => {
  const result = await client.query<SubscriptionRow>(
    `SELECT ${SUBSCRIPTION_COLUMNS}
     FROM subscriptions
     WHERE payment_id = $1
     LIMIT 1`,
    [paymentId],
  );

  const row = result.rows[0];

  return row ? mapSubscription(row) : null;
};

// Retrieves the latest subscription belonging to a user.
export const findLatestSubscriptionByUserId = async (
  userId: string,
): Promise<Subscription | null> => {
  const result = await pool.query<SubscriptionRow>(
    `SELECT ${SUBSCRIPTION_COLUMNS}
     FROM subscriptions
     WHERE user_id = $1
     ORDER BY expires_at DESC, created_at DESC
     LIMIT 1`,
    [userId],
  );

  const row = result.rows[0];

  return row ? mapSubscription(row) : null;
};

// Retrieves an active subscription belonging to a user.
export const findActiveSubscriptionByUserId = async (
  userId: string,
): Promise<Subscription | null> => {
  const result = await pool.query<SubscriptionRow>(
    `SELECT
       s.id,
       s.user_id,
       s.payment_id,
       s.plan_id,
       s.starts_at,
       (
         SELECT MAX(future.expires_at)
         FROM subscriptions future
         WHERE future.user_id = s.user_id
           AND future.expires_at > NOW()
       ) AS expires_at,
       s.created_at
     FROM subscriptions s
     WHERE s.user_id = $1
       AND s.starts_at <= NOW()
       AND s.expires_at > NOW()
     ORDER BY s.starts_at DESC, s.created_at DESC
     LIMIT 1`,
    [userId],
  );

  const row = result.rows[0];

  return row ? mapSubscription(row) : null;
};
