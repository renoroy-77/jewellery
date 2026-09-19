'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ShieldCheck,
  Lock,
  ShoppingBag,
  CreditCard,
  Banknote,
  AlertCircle,
  Truck,
  CheckCircle2,
  ArrowRight,
  Gift,
  Tag,
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { paymentsService } from '@/services/paymentsService';
import { ordersService } from '@/services/ordersService';
import {
  referralsService,
  PublicReferralSettings,
  ValidateReferralResult,
} from '@/services/referralsService';

const INDIAN_STATES = [
  'Tamil Nadu',
  'Karnataka',
  'Kerala',
  'Andhra Pradesh',
  'Telangana',
  'Maharashtra',
  'Delhi',
  'Gujarat',
  'Uttar Pradesh',
  'West Bengal',
  'Rajasthan',
  'Madhya Pradesh',
  'Punjab',
  'Haryana',
  'Odisha',
  'Bihar',
  'Assam',
  'Goa',
  'Other',
];

// Strict Indian Mobile Number Regular Expression
// Allows optional +91 or 0 prefix, requires exactly 10 digits starting with 6, 7, 8, or 9
const INDIAN_PHONE_REGEX = /^(?:(?:\+|0{0,2})91[\s\-]*)?[6789](?:[\s\-]*\d){9}$/;

const validateIndianPhone = (
  phoneStr: string,
): { isValid: boolean; message?: string; cleaned?: string } => {
  const trimmed = phoneStr.trim();
  if (!trimmed) {
    return { isValid: false, message: 'Mobile number is required for dispatch & delivery tracking.' };
  }

  if (!INDIAN_PHONE_REGEX.test(trimmed)) {
    return {
      isValid: false,
      message: 'Please enter a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9.',
    };
  }

  // Extract purely digits
  const allDigits = trimmed.replace(/\D/g, '');
  let core10 = allDigits;
  if (allDigits.length === 12 && allDigits.startsWith('91')) {
    core10 = allDigits.slice(2);
  } else if (allDigits.length === 11 && allDigits.startsWith('0')) {
    core10 = allDigits.slice(1);
  }

  if (core10.length !== 10) {
    return { isValid: false, message: 'Mobile number must contain exactly 10 digits.' };
  }

  // Reject dummy repetitive sequences (e.g. 0000000000, 1111111111, 9999999999)
  if (/^(\d)\1{9}$/.test(core10)) {
    return { isValid: false, message: 'Please enter a genuine, active mobile number.' };
  }

  // Reject basic sequential test numbers
  if (core10 === '1234567890' || core10 === '9876543210') {
    return { isValid: false, message: 'Please enter an active personal mobile number.' };
  }

  return { isValid: true, cleaned: `+91 ${core10}` };
};

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, subtotal, totalItems, clearCart } = useCart();

  const [form, setForm] = useState({
    customerName: '',
    email: '',
    phone: '',
    streetAddress: '',
    city: '',
    state: 'Tamil Nadu',
    pincode: '',
  });

  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'razorpay' | 'cod'>('razorpay');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Referral Rewards State
  const [referralSettings, setReferralSettings] = useState<PublicReferralSettings | null>(null);
  const [referralInput, setReferralInput] = useState('');
  const [appliedReferral, setAppliedReferral] = useState<ValidateReferralResult | null>(null);
  const [referralError, setReferralError] = useState<string | null>(null);
  const [isValidatingReferral, setIsValidatingReferral] = useState(false);

  // Fetch referral settings and check for ?ref= URL param on load
  useEffect(() => {
    referralsService.getPublicSettings().then(setReferralSettings).catch(() => {});

    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const refParam = params.get('ref');
      if (refParam) {
        const cleaned = refParam.trim().toUpperCase();
        setReferralInput(cleaned);
        // Auto-validate if cart subtotal is present
        referralsService
          .validateReferral({ code: cleaned, subtotal })
          .then((res) => {
            if (res.valid) {
              setAppliedReferral(res);
            }
          })
          .catch(() => {});
      }
    }
  }, [subtotal]);

  const handleApplyReferral = async (overrideCode?: string) => {
    const codeToTest = (overrideCode || referralInput).trim().toUpperCase();
    if (!codeToTest) {
      setReferralError('Please enter a referral code.');
      return;
    }

    setIsValidatingReferral(true);
    setReferralError(null);

    try {
      const res = await referralsService.validateReferral({
        code: codeToTest,
        buyerEmail: form.email.trim() || undefined,
        buyerPhone: form.phone.trim() || undefined,
        subtotal,
      });

      if (res.valid) {
        setAppliedReferral(res);
        setReferralError(null);
      } else {
        setAppliedReferral(null);
        setReferralError(res.message || 'Invalid referral code.');
      }
    } catch (err: any) {
      setReferralError(err.message || 'Could not validate referral code.');
    } finally {
      setIsValidatingReferral(false);
    }
  };

  const handleRemoveReferral = () => {
    setAppliedReferral(null);
    setReferralInput('');
    setReferralError(null);
  };

  // Delivery & Referral calculations
  const shippingFee = subtotal >= 999 ? 0 : 99;
  const referralDiscount = appliedReferral?.valid ? appliedReferral.discount : 0;
  const grandTotal = Math.max(0, subtotal + shippingFee - referralDiscount);

  // Load Razorpay checkout script
  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (typeof window === 'undefined') return resolve(false);
      if ((window as any).Razorpay) return resolve(true);

      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    if (errorMessage) setErrorMessage(null);
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow digits, space, hyphens, and leading +
    const val = e.target.value.replace(/[^\d\s\-\+]/g, '');
    setForm({ ...form, phone: val });
    if (errorMessage) setErrorMessage(null);

    if (val.trim()) {
      const check = validateIndianPhone(val);
      setPhoneError(check.isValid ? null : check.message || null);
    } else {
      setPhoneError(null);
    }
  };

  const validateForm = () => {
    if (!form.customerName.trim()) {
      setErrorMessage('Please enter your full name.');
      return false;
    }
    if (!form.email.trim() || !form.email.includes('@')) {
      setErrorMessage('Please enter a valid email address for order confirmation.');
      return false;
    }

    // Strict Phone Validation
    const phoneCheck = validateIndianPhone(form.phone);
    if (!phoneCheck.isValid) {
      setPhoneError(phoneCheck.message || 'Please enter a valid 10-digit Indian mobile number.');
      setErrorMessage(phoneCheck.message || 'Please enter a valid 10-digit Indian mobile number.');
      return false;
    }

    if (!form.streetAddress.trim()) {
      setErrorMessage('Please enter your complete delivery address.');
      return false;
    }
    if (!form.city.trim()) {
      setErrorMessage('Please enter your city.');
      return false;
    }
    if (!form.pincode.trim() || form.pincode.replace(/\D/g, '').length !== 6) {
      setErrorMessage('Please enter a valid 6-digit postal PIN code.');
      return false;
    }
    return true;
  };

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    if (cart.length === 0) {
      setErrorMessage('Your shopping bag is empty.');
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);

    const phoneResult = validateIndianPhone(form.phone);
    const normalizedPhone = phoneResult.cleaned || form.phone.trim();
    const fullShippingAddress = `${form.streetAddress.trim()}, ${form.city.trim()}, ${form.state} - ${form.pincode.trim()}`;

    const orderItems = cart.map((item) => ({
      productId: item.product.id,
      productName: item.product.name,
      name: item.product.name,
      price: item.product.price,
      quantity: item.quantity,
      image: item.product.images?.[0] || '/images/placeholder.jpg',
    }));

    const referralCodeToSend =
      appliedReferral?.referrerCode ||
      (appliedReferral?.valid ? referralInput.trim().toUpperCase() : undefined);

    try {
      if (paymentMethod === 'cod') {
        // Direct E-Commerce Cash on Delivery
        const newOrder = await ordersService.create({
          devoteeName: form.customerName.trim(),
          email: form.email.trim(),
          phone: normalizedPhone,
          shippingAddress: fullShippingAddress,
          items: orderItems,
          subtotal,
          shippingFee,
          referralCodeUsed: referralCodeToSend,
          totalAmount: grandTotal,
          status: 'Pending',
          paymentMethod: 'Cash on Delivery (COD)',
        });

        clearCart();
        router.push(`/order-success?orderId=${newOrder.id}&method=cod`);
        return;
      }

      // Razorpay Online Payment Flow
      const notes = {
        customerName: form.customerName.trim(),
        email: form.email.trim(),
        phone: normalizedPhone,
        city: form.city.trim(),
        referralCode: referralCodeToSend || '',
      };

      const razorpayOrder = await paymentsService.createOrder(grandTotal, notes);
      const isScriptLoaded = await loadRazorpayScript();

      const preparedOrderPayload = {
        devoteeName: form.customerName.trim(),
        email: form.email.trim(),
        phone: normalizedPhone,
        shippingAddress: fullShippingAddress,
        items: orderItems,
        subtotal,
        shippingFee,
        referralCodeUsed: referralCodeToSend,
        totalAmount: grandTotal,
        paymentMethod: 'Razorpay UPI/Cards (Online)',
      };

      if (isScriptLoaded && (window as any).Razorpay) {
        const options = {
          key: razorpayOrder.keyId,
          amount: razorpayOrder.amount,
          currency: razorpayOrder.currency || 'INR',
          name: 'Aamadappetti Jewellery',
          description: 'E-Commerce Online Order Payment',
          image: '/images/brand/logo.png',
          order_id: razorpayOrder.id.startsWith('order_sim_') ? undefined : razorpayOrder.id,
          handler: async function (response: any) {
            try {
              const verifyRes = await paymentsService.verifyPayment({
                razorpayOrderId: response.razorpay_order_id || razorpayOrder.id,
                razorpayPaymentId: response.razorpay_payment_id || `pay_${Date.now()}`,
                razorpaySignature: response.razorpay_signature || 'simulated_signature',
                orderData: preparedOrderPayload,
              });

              clearCart();
              router.push(`/order-success?orderId=${verifyRes.orderId}&method=razorpay`);
            } catch (err: any) {
              setErrorMessage(`Payment verification error: ${err.message || 'Please contact support'}`);
              setIsProcessing(false);
            }
          },
          prefill: {
            name: form.customerName,
            email: form.email,
            contact: normalizedPhone,
          },
          theme: {
            color: '#d4af37',
          },
          modal: {
            ondismiss: function () {
              setIsProcessing(false);
            },
          },
        };

        const rzp = new (window as any).Razorpay(options);
        rzp.on('payment.failed', function (response: any) {
          setErrorMessage(`Payment failed: ${response.error.description || 'Transaction declined'}`);
          setIsProcessing(false);
        });
        rzp.open();
      } else {
        // Fallback for simulated/test environments
        const verifyRes = await paymentsService.verifyPayment({
          razorpayOrderId: razorpayOrder.id,
          razorpayPaymentId: `pay_sim_${Date.now()}`,
          razorpaySignature: 'simulated_signature',
          orderData: preparedOrderPayload,
        });

        clearCart();
        router.push(`/order-success?orderId=${verifyRes.orderId}&method=razorpay`);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'An error occurred during checkout. Please try again.');
      setIsProcessing(false);
    }
  };

  // Empty Bag State
  if (cart.length === 0) {
    return (
      <div
        style={{
          minHeight: '75vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px 16px',
          background: 'radial-gradient(ellipse at top, #062316 0%, #020c08 100%)',
        }}
      >
        <div
          style={{
            maxWidth: '500px',
            width: '100%',
            textAlign: 'center',
            background: 'rgba(5, 22, 15, 0.85)',
            border: '1px solid rgba(212, 175, 55, 0.25)',
            borderRadius: '16px',
            padding: '48px 32px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.6)',
          }}
        >
          <div
            style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              background: 'rgba(212, 175, 55, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 24px',
              border: '1px solid rgba(212, 175, 55, 0.3)',
            }}
          >
            <ShoppingBag size={40} color="#d4af37" />
          </div>
          <h2 style={{ fontSize: '1.75rem', color: '#fcf9f2', marginBottom: '12px' }}>
            Your Shopping Bag is Empty
          </h2>
          <p style={{ color: '#9db3a8', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '28px' }}>
            Browse our handcrafted jewellery collections and add items to proceed with checkout.
          </p>
          <Link
            href="/collections"
            className="btn-gold"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 28px',
              textDecoration: 'none',
              borderRadius: '8px',
              fontWeight: 600,
            }}
          >
            <span>Explore Collections</span>
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#020d09',
        color: '#fcf9f2',
        padding: '32px 16px 80px',
      }}
    >
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Navigation Breadcrumb */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '0.85rem',
            color: '#8fa59b',
            marginBottom: '28px',
          }}
        >
          <Link href="/" style={{ color: '#8fa59b', textDecoration: 'none' }}>
            Home
          </Link>
          <span>›</span>
          <Link href="/collections" style={{ color: '#8fa59b', textDecoration: 'none' }}>
            Collections
          </Link>
          <span>›</span>
          <span style={{ color: '#d4af37', fontWeight: 600 }}>Checkout</span>
        </div>

        {/* Page Header */}
        <div style={{ marginBottom: '36px' }}>
          <h1
            style={{
              fontFamily: "'Cinzel', serif",
              fontSize: '2rem',
              color: '#fcf9f2',
              marginBottom: '8px',
              letterSpacing: '0.02em',
            }}
          >
            Checkout &amp; Shipping
          </h1>
          <p style={{ color: '#9db3a8', fontSize: '0.92rem', margin: 0 }}>
            Complete your order with 256-bit encrypted secure payment and fast insured doorstep delivery.
          </p>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div
            style={{
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              color: '#fca5a5',
              padding: '14px 18px',
              borderRadius: '8px',
              marginBottom: '24px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              fontSize: '0.9rem',
            }}
          >
            <AlertCircle size={20} color="#ef4444" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* 2-Column Checkout Layout */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1fr) minmax(320px, 420px)',
            gap: '36px',
            alignItems: 'start',
          }}
          className="checkout-responsive-grid"
        >
          {/* Left Column: Customer Details, Address & Payment */}
          <form onSubmit={handleCheckoutSubmit}>
            {/* Step 1: Customer Contact Information */}
            <div
              style={{
                background: 'rgba(4, 20, 13, 0.75)',
                border: '1px solid rgba(212, 175, 55, 0.2)',
                borderRadius: '12px',
                padding: '24px',
                marginBottom: '24px',
                backdropFilter: 'blur(8px)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  marginBottom: '20px',
                  borderBottom: '1px solid rgba(212, 175, 55, 0.12)',
                  paddingBottom: '14px',
                }}
              >
                <span
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    background: 'var(--gold-primary)',
                    color: '#05160f',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                  }}
                >
                  1
                </span>
                <h2 style={{ fontSize: '1.2rem', color: '#fcf9f2', margin: 0 }}>
                  Customer Contact Details
                </h2>
              </div>

              <div style={{ display: 'grid', gap: '16px' }}>
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '0.85rem',
                      color: '#b0c4b8',
                      marginBottom: '6px',
                      fontWeight: 500,
                    }}
                  >
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="customerName"
                    id="checkout-name"
                    required
                    value={form.customerName}
                    onChange={handleInputChange}
                    placeholder="e.g. S. Ramanathan"
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      background: 'rgba(2, 12, 8, 0.85)',
                      border: '1px solid rgba(212, 175, 55, 0.25)',
                      borderRadius: '6px',
                      color: '#fcf9f2',
                      fontSize: '0.95rem',
                      outline: 'none',
                    }}
                  />
                </div>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '16px',
                  }}
                >
                  <div>
                    <label
                      style={{
                        display: 'block',
                        fontSize: '0.85rem',
                        color: '#b0c4b8',
                        marginBottom: '6px',
                        fontWeight: 500,
                      }}
                    >
                      Email Address *
                    </label>
                    <input
                      type="email"
                      name="email"
                      id="checkout-email"
                      required
                      value={form.email}
                      onChange={handleInputChange}
                      placeholder="name@example.com"
                      style={{
                        width: '100%',
                        padding: '12px 14px',
                        background: 'rgba(2, 12, 8, 0.85)',
                        border: '1px solid rgba(212, 175, 55, 0.25)',
                        borderRadius: '6px',
                        color: '#fcf9f2',
                        fontSize: '0.95rem',
                        outline: 'none',
                      }}
                    />
                  </div>
                  <div>
                    <label
                      style={{
                        display: 'block',
                        fontSize: '0.85rem',
                        color: '#b0c4b8',
                        marginBottom: '6px',
                        fontWeight: 500,
                      }}
                    >
                      Mobile / WhatsApp Number *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      id="checkout-phone"
                      required
                      value={form.phone}
                      onChange={handlePhoneChange}
                      placeholder="98401 23456"
                      style={{
                        width: '100%',
                        padding: '12px 14px',
                        background: 'rgba(2, 12, 8, 0.85)',
                        border: phoneError
                          ? '1px solid #ef4444'
                          : '1px solid rgba(212, 175, 55, 0.25)',
                        borderRadius: '6px',
                        color: '#fcf9f2',
                        fontSize: '0.95rem',
                        outline: 'none',
                      }}
                    />
                    {phoneError ? (
                      <div
                        style={{
                          fontSize: '0.75rem',
                          color: '#f87171',
                          marginTop: '4px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                      >
                        <AlertCircle size={12} />
                        <span>{phoneError}</span>
                      </div>
                    ) : (
                      <div style={{ fontSize: '0.72rem', color: '#8fa59b', marginTop: '4px' }}>
                        10-digit Indian mobile number (e.g. 98401 23456)
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Step 2: Shipping Address */}
            <div
              style={{
                background: 'rgba(4, 20, 13, 0.75)',
                border: '1px solid rgba(212, 175, 55, 0.2)',
                borderRadius: '12px',
                padding: '24px',
                marginBottom: '24px',
                backdropFilter: 'blur(8px)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  marginBottom: '20px',
                  borderBottom: '1px solid rgba(212, 175, 55, 0.12)',
                  paddingBottom: '14px',
                }}
              >
                <span
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    background: 'var(--gold-primary)',
                    color: '#05160f',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                  }}
                >
                  2
                </span>
                <h2 style={{ fontSize: '1.2rem', color: '#fcf9f2', margin: 0 }}>
                  Shipping Address
                </h2>
              </div>

              <div style={{ display: 'grid', gap: '16px' }}>
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '0.85rem',
                      color: '#b0c4b8',
                      marginBottom: '6px',
                      fontWeight: 500,
                    }}
                  >
                    Street Address / Flat / House No. *
                  </label>
                  <input
                    type="text"
                    name="streetAddress"
                    id="checkout-address"
                    required
                    value={form.streetAddress}
                    onChange={handleInputChange}
                    placeholder="e.g. 42 Sannathi Street, Mylapore"
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      background: 'rgba(2, 12, 8, 0.85)',
                      border: '1px solid rgba(212, 175, 55, 0.25)',
                      borderRadius: '6px',
                      color: '#fcf9f2',
                      fontSize: '0.95rem',
                      outline: 'none',
                    }}
                  />
                </div>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                    gap: '16px',
                  }}
                >
                  <div>
                    <label
                      style={{
                        display: 'block',
                        fontSize: '0.85rem',
                        color: '#b0c4b8',
                        marginBottom: '6px',
                        fontWeight: 500,
                      }}
                    >
                      City *
                    </label>
                    <input
                      type="text"
                      name="city"
                      id="checkout-city"
                      required
                      value={form.city}
                      onChange={handleInputChange}
                      placeholder="e.g. Chennai"
                      style={{
                        width: '100%',
                        padding: '12px 14px',
                        background: 'rgba(2, 12, 8, 0.85)',
                        border: '1px solid rgba(212, 175, 55, 0.25)',
                        borderRadius: '6px',
                        color: '#fcf9f2',
                        fontSize: '0.95rem',
                        outline: 'none',
                      }}
                    />
                  </div>

                  <div>
                    <label
                      style={{
                        display: 'block',
                        fontSize: '0.85rem',
                        color: '#b0c4b8',
                        marginBottom: '6px',
                        fontWeight: 500,
                      }}
                    >
                      State *
                    </label>
                    <select
                      name="state"
                      id="checkout-state"
                      value={form.state}
                      onChange={handleInputChange}
                      style={{
                        width: '100%',
                        padding: '12px 14px',
                        background: 'rgba(2, 12, 8, 0.85)',
                        border: '1px solid rgba(212, 175, 55, 0.25)',
                        borderRadius: '6px',
                        color: '#fcf9f2',
                        fontSize: '0.95rem',
                        outline: 'none',
                      }}
                    >
                      {INDIAN_STATES.map((s) => (
                        <option key={s} value={s} style={{ background: '#03140c' }}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label
                      style={{
                        display: 'block',
                        fontSize: '0.85rem',
                        color: '#b0c4b8',
                        marginBottom: '6px',
                        fontWeight: 500,
                      }}
                    >
                      PIN Code *
                    </label>
                    <input
                      type="text"
                      name="pincode"
                      id="checkout-pincode"
                      maxLength={6}
                      required
                      value={form.pincode}
                      onChange={handleInputChange}
                      placeholder="600004"
                      style={{
                        width: '100%',
                        padding: '12px 14px',
                        background: 'rgba(2, 12, 8, 0.85)',
                        border: '1px solid rgba(212, 175, 55, 0.25)',
                        borderRadius: '6px',
                        color: '#fcf9f2',
                        fontSize: '0.95rem',
                        outline: 'none',
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Referral Welcome Code Box */}
            {(!referralSettings || referralSettings.enabled) && (
              <div
                style={{
                  background: 'rgba(4, 20, 13, 0.75)',
                  border: appliedReferral?.valid
                    ? '1px solid rgba(74, 222, 128, 0.4)'
                    : '1px solid rgba(212, 175, 55, 0.2)',
                  borderRadius: '12px',
                  padding: '20px 24px',
                  marginBottom: '24px',
                  backdropFilter: 'blur(8px)',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '14px',
                    flexWrap: 'wrap',
                    gap: '8px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Gift size={20} color="#d4af37" />
                    <span style={{ fontSize: '1.05rem', fontWeight: 600, color: '#fcf9f2' }}>
                      Have a Friend&apos;s Referral Code?
                    </span>
                  </div>
                  <span
                    style={{
                      fontSize: '0.75rem',
                      background: 'rgba(212, 175, 55, 0.15)',
                      color: '#f5d77f',
                      padding: '3px 10px',
                      borderRadius: '20px',
                      fontWeight: 600,
                    }}
                  >
                    ₹{referralSettings?.refereeDiscountRupees || 100} Welcome Blessing
                  </span>
                </div>

                {appliedReferral?.valid ? (
                  <div
                    style={{
                      background: 'rgba(34, 197, 94, 0.12)',
                      border: '1px solid rgba(34, 197, 94, 0.3)',
                      borderRadius: '8px',
                      padding: '12px 16px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '12px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <CheckCircle2 size={18} color="#4ade80" />
                      <div>
                        <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#4ade80' }}>
                          Code {appliedReferral.referrerCode} Applied
                        </div>
                        <div style={{ fontSize: '0.78rem', color: '#b0c4b8' }}>
                          {appliedReferral.message ||
                            `₹${appliedReferral.discount} discount applied to your order!`}
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveReferral}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#9db3a8',
                        cursor: 'pointer',
                        fontSize: '0.8rem',
                        textDecoration: 'underline',
                      }}
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <input
                        type="text"
                        value={referralInput}
                        onChange={(e) => {
                          setReferralInput(e.target.value.toUpperCase());
                          if (referralError) setReferralError(null);
                        }}
                        placeholder="e.g. RAJESH-K7Q2"
                        style={{
                          flex: 1,
                          padding: '12px 14px',
                          background: 'rgba(2, 12, 8, 0.85)',
                          border: referralError
                            ? '1px solid #ef4444'
                            : '1px solid rgba(212, 175, 55, 0.25)',
                          borderRadius: '6px',
                          color: '#fcf9f2',
                          fontSize: '0.95rem',
                          outline: 'none',
                          letterSpacing: '0.05em',
                          textTransform: 'uppercase',
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => handleApplyReferral()}
                        disabled={isValidatingReferral || !referralInput.trim()}
                        style={{
                          padding: '0 22px',
                          background: 'linear-gradient(135deg, #d4af37 0%, #aa8010 100%)',
                          color: '#05160f',
                          border: 'none',
                          borderRadius: '6px',
                          fontWeight: 600,
                          fontSize: '0.9rem',
                          cursor:
                            isValidatingReferral || !referralInput.trim()
                              ? 'not-allowed'
                              : 'pointer',
                          opacity: isValidatingReferral || !referralInput.trim() ? 0.6 : 1,
                        }}
                      >
                        {isValidatingReferral ? 'Checking...' : 'Apply'}
                      </button>
                    </div>
                    {referralError && (
                      <div
                        style={{
                          fontSize: '0.78rem',
                          color: '#f87171',
                          marginTop: '6px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                      >
                        <AlertCircle size={13} />
                        <span>{referralError}</span>
                      </div>
                    )}
                    <div style={{ fontSize: '0.72rem', color: '#8fa59b', marginTop: '6px' }}>
                      Applicable on first order of ₹{referralSettings?.minOrderSubtotal || 500} or more.
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Step 3: Payment Method Selection */}
            <div
              style={{
                background: 'rgba(4, 20, 13, 0.75)',
                border: '1px solid rgba(212, 175, 55, 0.2)',
                borderRadius: '12px',
                padding: '24px',
                marginBottom: '32px',
                backdropFilter: 'blur(8px)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  marginBottom: '20px',
                  borderBottom: '1px solid rgba(212, 175, 55, 0.12)',
                  paddingBottom: '14px',
                }}
              >
                <span
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    background: 'var(--gold-primary)',
                    color: '#05160f',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                  }}
                >
                  3
                </span>
                <h2 style={{ fontSize: '1.2rem', color: '#fcf9f2', margin: 0 }}>
                  Select Payment Method
                </h2>
              </div>

              <div style={{ display: 'grid', gap: '14px' }}>
                {/* Razorpay Option */}
                <label
                  onClick={() => setPaymentMethod('razorpay')}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '14px',
                    padding: '18px',
                    borderRadius: '10px',
                    background:
                      paymentMethod === 'razorpay'
                        ? 'rgba(212, 175, 55, 0.1)'
                        : 'rgba(2, 12, 8, 0.6)',
                    border:
                      paymentMethod === 'razorpay'
                        ? '2px solid #d4af37'
                        : '1px solid rgba(212, 175, 55, 0.2)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    id="radio-razorpay"
                    checked={paymentMethod === 'razorpay'}
                    onChange={() => setPaymentMethod('razorpay')}
                    style={{ marginTop: '4px', accentColor: '#d4af37' }}
                  />
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: '4px',
                      }}
                    >
                      <span style={{ fontWeight: 600, color: '#fcf9f2', fontSize: '1rem' }}>
                        Razorpay Secure Gateway (Recommended)
                      </span>
                      <span
                        style={{
                          fontSize: '0.75rem',
                          background: 'rgba(34, 197, 94, 0.15)',
                          color: '#4ade80',
                          padding: '2px 8px',
                          borderRadius: '4px',
                          fontWeight: 600,
                        }}
                      >
                        Instant UPI &amp; Cards
                      </span>
                    </div>
                    <p style={{ fontSize: '0.82rem', color: '#9db3a8', margin: 0 }}>
                      Pay via Google Pay, PhonePe, Paytm, BHIM UPI, NetBanking, Credit or Debit
                      Cards. 256-Bit SSL Bank Grade Security.
                    </p>
                  </div>
                </label>

                {/* Cash on Delivery Option */}
                <label
                  onClick={() => setPaymentMethod('cod')}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '14px',
                    padding: '18px',
                    borderRadius: '10px',
                    background:
                      paymentMethod === 'cod'
                        ? 'rgba(212, 175, 55, 0.1)'
                        : 'rgba(2, 12, 8, 0.6)',
                    border:
                      paymentMethod === 'cod'
                        ? '2px solid #d4af37'
                        : '1px solid rgba(212, 175, 55, 0.2)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    id="radio-cod"
                    checked={paymentMethod === 'cod'}
                    onChange={() => setPaymentMethod('cod')}
                    style={{ marginTop: '4px', accentColor: '#d4af37' }}
                  />
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: '4px',
                      }}
                    >
                      <span style={{ fontWeight: 600, color: '#fcf9f2', fontSize: '1rem' }}>
                        Cash on Delivery (COD)
                      </span>
                      <span
                        style={{
                          fontSize: '0.75rem',
                          background: 'rgba(212, 175, 55, 0.15)',
                          color: '#f5d77f',
                          padding: '2px 8px',
                          borderRadius: '4px',
                          fontWeight: 600,
                        }}
                      >
                        Pay on Arrival
                      </span>
                    </div>
                    <p style={{ fontSize: '0.82rem', color: '#9db3a8', margin: 0 }}>
                      Pay with cash upon delivery directly at your doorstep.
                    </p>
                  </div>
                </label>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              id="checkout-submit-btn"
              disabled={isProcessing}
              className="btn-gold"
              style={{
                width: '100%',
                padding: '16px',
                fontSize: '1.05rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                cursor: isProcessing ? 'not-allowed' : 'pointer',
                opacity: isProcessing ? 0.75 : 1,
              }}
            >
              <Lock size={18} />
              <span>
                {isProcessing
                  ? 'Connecting to Payment Gateway...'
                  : paymentMethod === 'razorpay'
                  ? `Proceed to Pay ₹${grandTotal.toLocaleString('en-IN')} via Razorpay`
                  : `Place Order (₹${grandTotal.toLocaleString('en-IN')} Cash on Delivery)`}
              </span>
            </button>
          </form>

          {/* Right Column: Order Summary Sidebar */}
          <div
            style={{
              background: 'rgba(4, 20, 13, 0.85)',
              border: '1px solid rgba(212, 175, 55, 0.25)',
              borderRadius: '12px',
              padding: '24px',
              position: 'sticky',
              top: '100px',
              boxShadow: '0 16px 36px rgba(0, 0, 0, 0.5)',
            }}
          >
            <h3
              style={{
                fontSize: '1.15rem',
                color: '#fcf9f2',
                marginBottom: '16px',
                borderBottom: '1px solid rgba(212, 175, 55, 0.15)',
                paddingBottom: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <span>Order Summary</span>
              <span style={{ fontSize: '0.85rem', color: '#d4af37' }}>
                {totalItems} {totalItems === 1 ? 'Item' : 'Items'}
              </span>
            </h3>

            {/* Cart Items Scroll Area */}
            <div
              style={{
                maxHeight: '280px',
                overflowY: 'auto',
                marginBottom: '20px',
                paddingRight: '6px',
              }}
            >
              {cart.map((item) => (
                <div
                  key={item.product.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '14px',
                    padding: '10px 0',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
                  }}
                >
                  <div
                    style={{
                      width: '56px',
                      height: '56px',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      background: '#010905',
                      flexShrink: 0,
                      border: '1px solid rgba(212, 175, 55, 0.2)',
                    }}
                  >
                    <img
                      src={item.product.images?.[0] || '/images/placeholder.jpg'}
                      alt={item.product.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        fontSize: '0.88rem',
                        fontWeight: 600,
                        color: '#fcf9f2',
                        lineHeight: 1.3,
                        marginBottom: '4px',
                      }}
                    >
                      {item.product.name}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#9db3a8' }}>
                      Qty: {item.quantity} × ₹{item.product.price.toLocaleString('en-IN')}
                    </div>
                  </div>
                  <div
                    style={{
                      fontSize: '0.92rem',
                      fontWeight: 700,
                      color: '#d4af37',
                      textAlign: 'right',
                    }}
                  >
                    ₹{(item.product.price * item.quantity).toLocaleString('en-IN')}
                  </div>
                </div>
              ))}
            </div>

            {/* Price Calculations */}
            <div style={{ borderBottom: '1px solid rgba(212, 175, 55, 0.15)', paddingBottom: '16px' }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '0.9rem',
                  color: '#b0c4b8',
                  marginBottom: '10px',
                }}
              >
                <span>Items Subtotal</span>
                <span>₹{subtotal.toLocaleString('en-IN')}</span>
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '0.9rem',
                  color: '#b0c4b8',
                  marginBottom: '10px',
                }}
              >
                <span>Gift Packaging</span>
                <span style={{ color: '#4ade80', fontWeight: 600 }}>FREE</span>
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '0.9rem',
                  color: '#b0c4b8',
                  marginBottom: '10px',
                }}
              >
                <span>Insured Express Shipping</span>
                {shippingFee === 0 ? (
                  <span style={{ color: '#4ade80', fontWeight: 600 }}>FREE (Above ₹999)</span>
                ) : (
                  <span>₹{shippingFee}</span>
                )}
              </div>
              {referralDiscount > 0 && (
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '0.9rem',
                    color: '#4ade80',
                    marginBottom: '10px',
                    fontWeight: 600,
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Tag size={14} />
                    <span>Referral Discount ({appliedReferral?.referrerCode})</span>
                  </span>
                  <span>-₹{referralDiscount.toLocaleString('en-IN')}</span>
                </div>
              )}
            </div>

            {/* Grand Total */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '16px 0',
              }}
            >
              <span style={{ fontSize: '1.05rem', fontWeight: 600, color: '#fcf9f2' }}>
                Total Payable
              </span>
              <span
                style={{
                  fontFamily: "'Cinzel', serif",
                  fontSize: '1.5rem',
                  fontWeight: 700,
                  color: '#d4af37',
                }}
              >
                ₹{grandTotal.toLocaleString('en-IN')}
              </span>
            </div>

            {/* Assurance Badges */}
            <div
              style={{
                background: 'rgba(2, 12, 8, 0.7)',
                borderRadius: '8px',
                padding: '14px',
                display: 'grid',
                gap: '8px',
                marginTop: '8px',
                border: '1px solid rgba(212, 175, 55, 0.12)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '0.78rem',
                  color: '#9db3a8',
                }}
              >
                <ShieldCheck size={16} color="#d4af37" />
                <span>100% Certified Panchaloham (Govt Assay)</span>
              </div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '0.78rem',
                  color: '#9db3a8',
                }}
              >
                <Truck size={16} color="#d4af37" />
                <span>Tamper-Proof Insured All-India Transit</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
