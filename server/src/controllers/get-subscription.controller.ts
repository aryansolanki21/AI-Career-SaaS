import type { Response, NextFunction } from "express";
import type { AuthenticatedRequest } from "../middlewares/auth-middleware.js";
import { findActiveSubscriptionByUserId } from "../repositories/subscription-repository.js";

export const getSubscriptionController = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ message: "Authentication required." });
      return;
    }

    const subscription = await findActiveSubscriptionByUserId(userId);

    res.status(200).json({
      subscription: subscription
        ? {
            id: subscription.id,
            planId: subscription.planId,
            startsAt: subscription.startsAt,
            expiresAt: subscription.expiresAt,
            status: "active",
          }
        : null,
    });
  } catch (error: unknown) {
    next(error);
  }
};
