import type { Response, NextFunction } from "express";
import type { AuthenticatedRequest } from "../middlewares/auth-middleware.js";
import {
  createBillingOrder,
  verifyBillingPayment,
} from "../services/billing.service.js";

export const createBillingOrderController = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { planId } = req.body as { planId?: unknown };

    if (!userId) {
      res.status(401).json({ message: "Authentication required." });
      return;
    }

    if (typeof planId !== "string" || !planId.trim()) {
      res.status(400).json({ message: "A valid plan ID is required." });
      return;
    }

    const order = await createBillingOrder({
      userId,
      planId,
    });

    res.status(201).json({
      message: "Payment order created successfully.",
      order,
    });
  } catch (error: unknown) {
    next(error);
  }
};

export const verifyBillingPaymentController = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const userId = req.user?.id;

    const { orderId, paymentId, signature } = req.body as {
      orderId?: unknown;
      paymentId?: unknown;
      signature?: unknown;
    };

    if (!userId) {
      res.status(401).json({ message: "Authentication required." });
      return;
    }

    if (
      typeof orderId !== "string" ||
      typeof paymentId !== "string" ||
      typeof signature !== "string" ||
      !orderId.trim() ||
      !paymentId.trim() ||
      !signature.trim()
    ) {
      res.status(400).json({
        message: "Valid payment verification details are required.",
      });
      return;
    }

    const result = await verifyBillingPayment({
      userId,
      orderId,
      paymentId,
      signature,
    });

    res.status(200).json({
      message: result.message,
      subscription: {
        planId: result.planId,
        startsAt: result.startsAt,
        expiresAt: result.expiresAt,
      },
    });
  } catch (error: unknown) {
    next(error);
  }
};
