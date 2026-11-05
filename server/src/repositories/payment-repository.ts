import { pool } from "../config/db.js";
import type { PoolClient, QueryResultRow } from "pg";

export type PaymentStatus = "created" | "paid" | "failed";

export interface CreatePaymentInput {
  userId: string;
  planId: string;
  razorpayOrderId: string;
  amount: number;
  currency: string;
}

export interface Payment {
  id: string;
  userId: string;
  planId: string;
  razorpayOrderId: string;
  razorpayPaymentId: string | null;
  amount: number;
  currency: string;
  status: PaymentStatus;
  createdAt: Date;
  updatedAt: Date;
}

interface PaymentRow extends QueryResultRow {
  id: string;
  user_id: string;
  plan_id: string;
  razorpay_order_id: string;
  razorpay_payment_id: string | null;
  amount: number;
  currency: string;
  status: PaymentStatus;
  created_at: Date;
  updated_at: Date;
}

const PAYMENT_COLUMNS = `
  id,
  user_id,
  plan_id,
  razorpay_order_id,
  razorpay_payment_id,
  amount,
  currency,
  status,
  created_at,
  updated_at
`;

const mapPayment = (row: PaymentRow): Payment => ({
  id: row.id,
  userId: row.user_id,
  planId: row.plan_id,
  razorpayOrderId: row.razorpay_order_id,
  razorpayPaymentId: row.razorpay_payment_id,
  amount: row.amount,
  currency: row.currency,
  status: row.status,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

export const createPayment = async (
  input: CreatePaymentInput,
): Promise<Payment> => {
  const result = await pool.query<PaymentRow>(
    `INSERT INTO payments (
      user_id,
      plan_id,
      razorpay_order_id,
      amount,
      currency
    )
    VALUES ($1, $2, $3, $4, $5)
    RETURNING ${PAYMENT_COLUMNS}`,
    [
      input.userId,
      input.planId,
      input.razorpayOrderId,
      input.amount,
      input.currency,
    ],
  );

  const row = result.rows[0];

  if (!row) {
    throw new Error("Failed to create payment record.");
  }

  return mapPayment(row);
};

export const findPaymentByOrderId = async (
  razorpayOrderId: string,
): Promise<Payment | null> => {
  const result = await pool.query<PaymentRow>(
    `SELECT ${PAYMENT_COLUMNS}
     FROM payments
     WHERE razorpay_order_id = $1
     LIMIT 1`,
    [razorpayOrderId],
  );

  const row = result.rows[0];

  return row ? mapPayment(row) : null;
};

export const findPaymentByOrderIdForUpdate = async (
  client: PoolClient,
  razorpayOrderId: string,
): Promise<Payment | null> => {
  const result = await client.query<PaymentRow>(
    `SELECT ${PAYMENT_COLUMNS}
     FROM payments
     WHERE razorpay_order_id = $1
     FOR UPDATE`,
    [razorpayOrderId],
  );

  const row = result.rows[0];

  return row ? mapPayment(row) : null;
};

export const markPaymentAsPaid = async (
  client: PoolClient,
  razorpayOrderId: string,
  razorpayPaymentId: string,
): Promise<Payment> => {
  const result = await client.query<PaymentRow>(
    `UPDATE payments
     SET razorpay_payment_id = $2,
         status = 'paid',
         updated_at = NOW()
     WHERE razorpay_order_id = $1
       AND status = 'created'
       AND razorpay_payment_id IS NULL
     RETURNING ${PAYMENT_COLUMNS}`,
    [razorpayOrderId, razorpayPaymentId],
  );

  const row = result.rows[0];

  if (!row) {
    throw new Error("Payment could not be marked as paid.");
  }

  return mapPayment(row);
};
