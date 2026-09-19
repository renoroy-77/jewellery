const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';

export interface RazorpayOrderResponse {
  id: string;
  amount: number;
  currency: string;
  keyId: string;
  status: string;
  receipt?: string;
  notes?: Record<string, any>;
}

export interface VerifyPaymentPayload {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
  orderData?: any;
}

export const paymentsService = {
  /**
   * Create Razorpay payment order on the backend
   */
  async createOrder(amount: number, notes?: Record<string, any>): Promise<RazorpayOrderResponse> {
    const res = await fetch(`${API_BASE_URL}/api/payments/razorpay/create-order`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount,
        currency: 'INR',
        receipt: `rcpt_${Date.now()}`,
        notes: notes || {},
      }),
    });

    if (!res.ok) {
      throw new Error(`Failed to initialize payment gateway (${res.statusText})`);
    }

    return res.json();
  },

  /**
   * Verify payment signature and commit order to database
   */
  async verifyPayment(payload: VerifyPaymentPayload) {
    const res = await fetch(`${API_BASE_URL}/api/payments/razorpay/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      throw new Error(`Payment verification failed (${res.statusText})`);
    }

    return res.json();
  },
};
