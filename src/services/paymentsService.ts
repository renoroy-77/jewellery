const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';

export interface PayUOrderResponse {
  success: boolean;
  key: string;
  txnid: string;
  amount: string;
  productinfo: string;
  firstname: string;
  email: string;
  phone: string;
  surl: string;
  furl: string;
  hash: string;
  udf1?: string;
  udf2?: string;
  udf3?: string;
  udf4?: string;
  udf5?: string;
  actionUrl: string;
  boltScriptUrl?: string;
  environment: string;
  orderId: string;
  // Compatibility fields
  paymentSessionId?: string;
  cfOrderId?: string;
  orderStatus?: string;
  orderAmount?: number;
  currency?: string;
  id?: string;
  appId?: string;
  keyId?: string;
}

export interface VerifyPayUPaymentPayload {
  txnid?: string;
  orderId?: string;
  payuPaymentId?: string;
  mihpayid?: string;
  status?: string;
  hash?: string;
  orderData?: any;
  // Legacy aliases
  cfPaymentId?: string;
  paymentSessionId?: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
}

export const paymentsService = {
  /**
   * Create PayU payment order on the backend
   */
  async createOrder(
    amount: number,
    notesOrCustomer?: Record<string, any>,
    legacyNotes?: Record<string, any>,
    orderData?: any,
  ): Promise<PayUOrderResponse> {
    const customerDetails =
      notesOrCustomer?.customerPhone || notesOrCustomer?.customerEmail
        ? notesOrCustomer
        : {
            customerName: notesOrCustomer?.customerName || notesOrCustomer?.devoteeName || 'Devotee Customer',
            customerEmail: notesOrCustomer?.email,
            customerPhone: notesOrCustomer?.phone,
          };

    const notes = legacyNotes || notesOrCustomer || {};
    const returnUrl =
      typeof window !== 'undefined'
        ? `${window.location.origin}/order-success?orderId={order_id}&method=payu`
        : undefined;

    const res = await fetch(`${API_BASE_URL}/api/payments/payu/create-order`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount,
        currency: 'INR',
        receipt: `rcpt_${Date.now()}`,
        customerDetails,
        returnUrl,
        notes,
        orderData,
      }),
    });

    if (!res.ok) {
      let errMsg = res.statusText;
      try {
        const errJson = await res.json();
        errMsg = errJson.message || errMsg;
      } catch {}
      throw new Error(errMsg);
    }

    return res.json();
  },

  /**
   * Verify PayU payment and commit order to database
   */
  async verifyPayment(payload: VerifyPayUPaymentPayload) {
    const res = await fetch(`${API_BASE_URL}/api/payments/payu/verify`, {
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

export type CashfreeOrderResponse = PayUOrderResponse;
export type VerifyCashfreePaymentPayload = VerifyPayUPaymentPayload;
export type RazorpayOrderResponse = PayUOrderResponse;
export type VerifyPaymentPayload = VerifyPayUPaymentPayload;
