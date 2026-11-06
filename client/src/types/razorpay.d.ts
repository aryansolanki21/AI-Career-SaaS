export {};

declare global {
  interface RazorpayPaymentResponse {
    razorpay_payment_id: string;
    razorpay_order_id: string;
    razorpay_signature: string;
  }

  interface RazorpayPaymentFailedResponse {
    error: {
      code: string;
      description: string;
      reason: string;
      source: string;
      step: string;
      metadata?: {
        order_id?: string;
        payment_id?: string;
      };
    };
  }

  interface RazorpayOptions {
    key: string;
    amount: number;
    currency: string;
    name: string;
    description: string;
    order_id: string;
    prefill?: {
      name?: string;
      email?: string;
    };
    theme?: {
      color?: string;
    };
    handler: (response: RazorpayPaymentResponse) => void | Promise<void>;
    modal?: {
      ondismiss?: () => void;
    };
  }

  interface RazorpayInstance {
    open: () => void;
    on: (
      event: "payment.failed",
      callback: (response: RazorpayPaymentFailedResponse) => void,
    ) => void;
  }

  interface Window {
    Razorpay?: new (options: RazorpayOptions) => RazorpayInstance;
  }
}
