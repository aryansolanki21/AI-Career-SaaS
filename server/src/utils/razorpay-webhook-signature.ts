import { createHmac, timingSafeEqual } from "node:crypto";

export const verifyRazorpayWebhookSignature = (
  body: Buffer,
  signature: string,
): boolean => {
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

  if (!webhookSecret || !signature || !/^[a-f0-9]{64}$/i.test(signature)) {
    return false;
  }

  const expectedSignature = createHmac("sha256", webhookSecret)
    .update(body)
    .digest();

  const receivedSignature = Buffer.from(signature, "hex");

  return (
    expectedSignature.length === receivedSignature.length &&
    timingSafeEqual(expectedSignature, receivedSignature)
  );
};
