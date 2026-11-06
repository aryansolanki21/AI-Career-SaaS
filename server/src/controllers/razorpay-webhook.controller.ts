import type { Request, Response, NextFunction } from "express";
import { findPaymentByOrderId } from "../repositories/payment-repository.js";
import { recordWebhookEvent } from "../repositories/webhook-repository.js";
import { activateSubscription } from "../services/subscription.service.js";
import { verifyRazorpayWebhookSignature } from "../utils/razorpay-webhook-signature.js";

interface RazorpayWebhookPayload {
  event?: string;
  payload?: {
    payment?: {
      entity?: {
        id?: string;
        order_id?: string;
        amount?: number;
        currency?: string;
        status?: string;
      };
    };
  };
}

export const razorpayWebhookController = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    if (!Buffer.isBuffer(req.body)) {
      res.status(400).json({ message: "Invalid webhook request body." });
      return;
    }

    const signature = req.headers["x-razorpay-signature"];
    const eventId = req.headers["x-razorpay-event-id"];

    if (
      typeof signature !== "string" ||
      typeof eventId !== "string" ||
      !eventId.trim()
    ) {
      res.status(400).json({ message: "Missing webhook headers." });
      return;
    }

    const isValid = verifyRazorpayWebhookSignature(req.body, signature);

    if (!isValid) {
      res.status(400).json({ message: "Invalid webhook signature." });
      return;
    }

    let webhook: RazorpayWebhookPayload;

    try {
      webhook = JSON.parse(req.body.toString("utf8")) as RazorpayWebhookPayload;
    } catch {
      res.status(400).json({ message: "Invalid webhook payload." });
      return;
    }

    if (webhook.event !== "payment.captured") {
      res.status(200).json({ received: true });
      return;
    }

    const payment = webhook.payload?.payment?.entity;

    if (
      !payment?.id ||
      !payment.order_id ||
      typeof payment.amount !== "number" ||
      !payment.currency ||
      payment.status !== "captured"
    ) {
      res.status(400).json({ message: "Invalid captured payment details." });
      return;
    }

    const storedPayment = await findPaymentByOrderId(payment.order_id);

    if (!storedPayment) {
      res.status(404).json({ message: "Payment order not found." });
      return;
    }

    if (
      storedPayment.amount !== payment.amount ||
      storedPayment.currency !== payment.currency
    ) {
      res.status(400).json({ message: "Payment details do not match." });
      return;
    }

    await activateSubscription({
      razorpayOrderId: payment.order_id,
      razorpayPaymentId: payment.id,
    });

    await recordWebhookEvent(eventId, webhook.event);

    res.status(200).json({ received: true });
  } catch (error: unknown) {
    next(error);
  }
};
