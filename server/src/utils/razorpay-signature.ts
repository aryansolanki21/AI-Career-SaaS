import { createHmac, timingSafeEqual } from "node:crypto";

export const verifyRazorpaySignature = (
  orderId: string,
  paymentId: string,
  signature: string,
): boolean => {
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keySecret || !signature || !/^[a-f0-9]{64}$/i.test(signature)) {
    return false;
  }

  const expectedSignature = createHmac("sha256", keySecret)
    .update(`${orderId}|${paymentId}`)
    .digest();

  const receivedSignature = Buffer.from(signature, "hex");

  return (
    expectedSignature.length === receivedSignature.length &&
    timingSafeEqual(expectedSignature, receivedSignature)
  );
};
