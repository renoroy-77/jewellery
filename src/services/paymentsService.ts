const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';

export interface CashfreeOrderResponse {
  success: boolean;
  orderId: string;
  paymentSessionId: string;
  cfOrderId?: string;
  orderStatus?: string;
  orderAmount: number;
  currency: string;
  environment?: string;
  appId?: string;
  // Legacy compatibility
  id: string;
  amount: number;
  keyId?: string;
}

export interface VerifyCashfreePaymentPayload {
  orderId: string;
  cfPaymentId?: string;
  paymentSessionId?: string;
  orderData?: any;
  // Legacy aliases
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
}

export const paymentsService = {
  /**
   * Create Cashfree payment order on the backend
   */
  async createOrder(
    amount: number,
    notesOrCustomer?: Record<string, any>,
    legacyNotes?: Record<string, any>,
  ): Promise<CashfreeOrderResponse> {
    // Support either createOrder(amount, notes) or createOrder(amount, customerDetails, notes)
    const customerDetails =
      notesOrCustomer?.customerPhone || notesOrCustomer?.customerEmail
        ? notesOrCustomer
        : {
            customerName: notesOrCustomer?.devoteeName,
            customerEmail: notesOrCustomer?.email,
            customerPhone: notesOrCustomer?.phone,
          };

    const notes = legacyNotes || notesOrCustomer || {};

    const res = await fetch(`${API_BASE_URL}/api/payments/cashfree/create-order`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount,
        currency: 'INR',
        receipt: `rcpt_${Date.now()}`,
        customerDetails,
        notes,
      }),
    });

    if (!res.ok) {
      throw new Error(`Failed to initialize Cashfree payment gateway (${res.statusText})`);
    }

    return res.json();
  },

  /**
   * Verify Cashfree payment and commit order to database
   */
  async verifyPayment(payload: VerifyCashfreePaymentPayload) {
    const res = await fetch(`${API_BASE_URL}/api/payments/cashfree/verify`, {
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

export type RazorpayOrderResponse = CashfreeOrderResponse;
export type VerifyPaymentPayload = VerifyCashfreePaymentPayload;
