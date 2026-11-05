import { Router } from "express";
import { isAuth } from "../middlewares/auth-middleware.js";
import {
  createBillingOrderController,
  verifyBillingPaymentController,
} from "../controllers/billing.controller.js";
import { getSubscriptionController } from "../controllers/get-subscription.controller.js";

const router = Router();

router.post("/orders", isAuth, createBillingOrderController);

router.post("/verify", isAuth, verifyBillingPaymentController);

router.get("/subscription", isAuth, getSubscriptionController);

export default router;
