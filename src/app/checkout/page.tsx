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
  Sparkles,
  RefreshCw,
  KeyRound,
  MapPin,
  Check,
  Coins,
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { paymentsService } from '@/services/paymentsService';
import { ordersService } from '@/services/ordersService';
import {
  referralsService,
  PublicReferralSettings,
  ValidateReferralResult,
} from '@/services/referralsService';
import {
  devoteeAuthService,
  DevoteeAddress,
  DevoteeUserProfile,
} from '@/services/devoteeAuthService';

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
  const [paymentMethod, setPaymentMethod] = useState<'cashfree' | 'cod'>('cashfree');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Devotee Session & E-Commerce Address Book
  const [loggedDevotee, setLoggedDevotee] = useState<DevoteeUserProfile | null>(null);
  const [savedAddresses, setSavedAddresses] = useState<DevoteeAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [saveAddressForFuture, setSaveAddressForFuture] = useState(true);

  // Referral Rewards & Wallet Credit State
  const [referralSettings, setReferralSettings] = useState<PublicReferralSettings | null>(null);
  const [referralInput, setReferralInput] = useState('');
  const [appliedReferral, setAppliedReferral] = useState<ValidateReferralResult | null>(null);
  const [referralError, setReferralError] = useState<string | null>(null);
  const [isValidatingReferral, setIsValidatingReferral] = useState(false);
  const [useWalletBalance, setUseWalletBalance] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // Auto-detect devotee session; redirect to dedicated /login if not authenticated
  useEffect(() => {
    const session = devoteeAuthService.getStoredSession();
    if (!session) {
      router.replace('/login?redirect=/checkout');
      return;
    }
    setIsCheckingAuth(false);
    setLoggedDevotee(session.user);
    if (session.user.email) {
        referralsService
          .getUserReferrals(session.user.email)
          .then((summary) => {
            if (summary) {
              setLoggedDevotee((prev) =>
                prev
                  ? {
                      ...prev,
                      walletBalance: summary.walletBalance ?? prev.walletBalance ?? 0,
                      referralCode: summary.referralCode || prev.referralCode,
                    }
                  : prev,
              );
            }
          })
          .catch(() => {});
      }
      devoteeAuthService.getAddresses(session.user.email || session.user.id).then((addrs) => {
        setSavedAddresses(addrs);
        const defaultAddr = addrs.find((a) => a.isDefault) || addrs[0];
        if (defaultAddr) {
          setSelectedAddressId(defaultAddr.id);
          setForm((prev) => ({
            ...prev,
            customerName: defaultAddr.recipientName || session.user.name,
            email: session.user.email,
            phone: defaultAddr.phone || session.user.phone || prev.phone,
            streetAddress: defaultAddr.streetAddress,
            city: defaultAddr.city,
            state: defaultAddr.state || 'Tamil Nadu',
            pincode: defaultAddr.pincode,
          }));
        } else {
          setForm((prev) => ({
            ...prev,
            customerName: session.user.name || prev.customerName,
            email: session.user.email || prev.email,
            phone: session.user.phone || prev.phone,
          }));
        }
      });
  }, []);

  const handleSelectSavedAddress = (addr: DevoteeAddress) => {
    setSelectedAddressId(addr.id);
    setForm((prev) => ({
      ...prev,
      customerName: addr.recipientName || prev.customerName,
      phone: addr.phone || prev.phone,
      streetAddress: addr.streetAddress,
      city: addr.city,
      state: addr.state || 'Tamil Nadu',
      pincode: addr.pincode,
    }));
  };

  const handleSwitchDevotee = () => {
    devoteeAuthService.clearSession();
    setLoggedDevotee(null);
    router.push('/login?redirect=/checkout');
  };

  // Fetch referral settings and check for ?ref= URL param on load
  useEffect(() => {
    referralsService.getPublicSettings().then(setReferralSettings).catch(() => {});

    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      let refParam = params.get('ref');
      if (refParam) {
        refParam = refParam.trim().toUpperCase();
        try {
          localStorage.setItem('aamadappetti_referral_code', refParam);
        } catch {}
      } else {
        try {
          refParam = localStorage.getItem('aamadappetti_referral_code');
        } catch {}
      }

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
    try {
      localStorage.removeItem('aamadappetti_referral_code');
    } catch {}
  };

  // Delivery & Referral & Sanctum Wallet Credit calculations
  const shippingFee = subtotal >= 999 ? 0 : 99;
  const referralDiscount = appliedReferral?.valid ? appliedReferral.discount : 0;
  const amountBeforeWallet = Math.max(0, subtotal + shippingFee - referralDiscount);
  const availableWallet = Math.max(0, loggedDevotee?.walletBalance || 0);
  const maxWalletApplicable = Math.min(availableWallet, amountBeforeWallet);
  const walletDiscount = useWalletBalance ? maxWalletApplicable : 0;
  const grandTotal = Math.max(0, amountBeforeWallet - walletDiscount);

  // Load Cashfree checkout script v3
  const loadCashfreeScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (typeof window === 'undefined') return resolve(false);
      if ((window as any).Cashfree) return resolve(true);

      const script = document.createElement('script');
      script.src = 'https://sdk.cashfree.com/js/v3/cashfree.js';
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
    if (!loggedDevotee) {
      router.push('/login?redirect=/checkout');
      return false;
    }
    if (!form.customerName.trim()) {
      setErrorMessage('Please enter recipient full name.');
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
      setErrorMessage('Please enter your complete street address.');
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
    if (!loggedDevotee) {
      router.push('/login?redirect=/checkout');
      return;
    }
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

    const maybeSaveAddress = async () => {
      if (loggedDevotee && saveAddressForFuture) {
        try {
          await devoteeAuthService.addAddress(loggedDevotee.id, {
            label: 'Puja Delivery',
            recipientName: form.customerName.trim(),
            phone: normalizedPhone,
            streetAddress: form.streetAddress.trim(),
            city: form.city.trim(),
            state: form.state,
            pincode: form.pincode.trim(),
            isDefault: savedAddresses.length === 0,
          });
        } catch {}
      }
    };

    try {
      const buyerEmail = (loggedDevotee?.email || form.email).trim().toLowerCase();
      const devoteeName = form.customerName.trim() || loggedDevotee?.name || 'Devotee';

      // Cashfree Online Payment Flow
      const notes = {
        customerName: devoteeName,
        email: buyerEmail,
        phone: normalizedPhone,
        city: form.city.trim(),
        referralCode: referralCodeToSend || '',
      };

      const cashfreeOrder = await paymentsService.createOrder(grandTotal, notes);
      const isScriptLoaded = await loadCashfreeScript();

      const preparedOrderPayload = {
        devoteeName,
        email: buyerEmail,
        phone: normalizedPhone,
        shippingAddress: fullShippingAddress,
        items: orderItems,
        subtotal,
        shippingFee,
        referralCodeUsed: referralCodeToSend,
        referralDiscount: referralDiscount > 0 ? referralDiscount : 0,
        walletDiscount: walletDiscount > 0 ? walletDiscount : 0,
        totalAmount: grandTotal,
        paymentMethod: 'Cashfree UPI/Cards (Online)',
      };

      if (isScriptLoaded && (window as any).Cashfree && cashfreeOrder.paymentSessionId) {
        const cashfree = (window as any).Cashfree({
          mode: cashfreeOrder.environment === 'production' ? 'production' : 'sandbox',
        });

        cashfree
          .checkout({
            paymentSessionId: cashfreeOrder.paymentSessionId,
            redirectTarget: '_modal',
          })
          .then(async (result: any) => {
            if (result?.error) {
              setErrorMessage(`Payment notice: ${result.error.message || 'Payment window closed'}`);
              setIsProcessing(false);
              return;
            }

            try {
              const verifyRes = await paymentsService.verifyPayment({
                orderId: cashfreeOrder.orderId,
                paymentSessionId: cashfreeOrder.paymentSessionId,
                orderData: preparedOrderPayload,
              });

              await maybeSaveAddress();
              clearCart();
              router.push(`/order-success?orderId=${verifyRes.orderId}&method=cashfree`);
            } catch (err: any) {
              setErrorMessage(`Payment verification error: ${err.message || 'Please contact support'}`);
              setIsProcessing(false);
            }
          })
          .catch((err: any) => {
            setErrorMessage(`Payment gateway error: ${err.message || 'Transaction could not be completed'}`);
            setIsProcessing(false);
          });
      } else {
        // Fallback for simulated/test environments
        const verifyRes = await paymentsService.verifyPayment({
          orderId: cashfreeOrder.orderId,
          paymentSessionId: cashfreeOrder.paymentSessionId,
          cfPaymentId: `cf_pay_sim_${Date.now()}`,
          orderData: preparedOrderPayload,
        });

        await maybeSaveAddress();
        clearCart();
        router.push(`/order-success?orderId=${verifyRes.orderId}&method=cashfree`);
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

  // Devotee Authentication Gate: If unauthenticated, redirect to dedicated Sanctum Login
  if (isCheckingAuth || !loggedDevotee) {
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
            maxWidth: '480px',
            width: '100%',
            textAlign: 'center',
            background: 'rgba(5, 22, 15, 0.92)',
            border: '1px solid rgba(212, 175, 55, 0.35)',
            borderRadius: '16px',
            padding: '44px 32px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.6)',
          }}
        >
          <div
            style={{
              width: '72px',
              height: '72px',
              borderRadius: '50%',
              background: 'rgba(212, 175, 55, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px',
              border: '1px solid rgba(212, 175, 55, 0.3)',
            }}
          >
            <KeyRound size={36} color="#d4af37" />
          </div>
          <h2 style={{ fontSize: '1.5rem', color: '#fcf9f2', marginBottom: '10px', fontFamily: "'Cinzel', serif" }}>
            Devotee Sign-in Required
          </h2>
          <p style={{ color: '#9db3a8', fontSize: '0.92rem', lineHeight: 1.6, marginBottom: '24px' }}>
            To place your consecrated jewellery order and keep your sanctum rewards secure, please sign in with your email OTP. Redirecting to Sanctum Portal...
          </p>
          <Link
            href="/login?redirect=/checkout"
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
            <span>Continue to Sign In</span>
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
            {/* Devotee Identity Banner */}
            <div
              style={{
                background: 'radial-gradient(ellipse at top, #142018 0%, #06110a 100%)',
                border: '1.5px solid rgba(74, 222, 128, 0.4)',
                borderRadius: '16px',
                padding: '20px 24px',
                marginBottom: '24px',
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '14px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div
                    style={{
                      width: '46px',
                      height: '46px',
                      borderRadius: '50%',
                      background: 'var(--gold-gradient)',
                      color: '#05160f',
                      fontFamily: "'Cinzel', serif",
                      fontWeight: 800,
                      fontSize: '1.2rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    {(loggedDevotee.name || form.customerName || 'D').charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '1.05rem', fontWeight: 700, color: '#fcf9f2' }}>
                        Namaste, {loggedDevotee.name || form.customerName || 'Devotee'}
                      </span>
                      <span
                        style={{
                          background: 'rgba(74, 222, 128, 0.15)',
                          color: '#4ade80',
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          padding: '2px 8px',
                          borderRadius: '12px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                      >
                        <CheckCircle2 size={12} />
                        <span>Verified Devotee</span>
                      </span>
                    </div>
                    <div style={{ fontSize: '0.82rem', color: '#9db3a8', marginTop: '2px' }}>
                      <span>{loggedDevotee.email}</span>
                      {(loggedDevotee.phone || form.phone) && (
                        <>
                          <span style={{ margin: '0 6px', color: 'rgba(212,175,55,0.4)' }}>•</span>
                          <span>{loggedDevotee.phone || form.phone}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  {availableWallet > 0 && (
                    <div
                      style={{
                        background: 'rgba(212, 175, 55, 0.12)',
                        border: '1px solid rgba(212, 175, 55, 0.4)',
                        borderRadius: '8px',
                        padding: '6px 12px',
                        textAlign: 'right',
                      }}
                    >
                      <div style={{ fontSize: '0.68rem', color: '#d4af37', textTransform: 'uppercase', fontWeight: 700 }}>
                        Sanctum Wallet
                      </div>
                      <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#f5d77f' }}>
                        ₹{availableWallet.toLocaleString('en-IN')}
                      </div>
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={handleSwitchDevotee}
                    style={{
                      background: 'none',
                      border: '1px solid rgba(255,255,255,0.2)',
                      color: '#b0a391',
                      borderRadius: '6px',
                      padding: '6px 12px',
                      fontSize: '0.78rem',
                      cursor: 'pointer',
                    }}
                  >
                    Switch Account
                  </button>
                </div>
              </div>
            </div>

            {/* Step 1: Puja Shipping Address */}
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
                  Puja Shipping Address
                </h2>
              </div>

                  <div style={{ display: 'grid', gap: '16px' }}>
                  {/* Saved Address Selector */}
                  {savedAddresses.length > 0 && (
                    <div
                      style={{
                        background: 'rgba(2, 12, 8, 0.75)',
                        border: '1px solid rgba(212, 175, 55, 0.25)',
                        borderRadius: '10px',
                        padding: '16px',
                        marginBottom: '8px',
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          marginBottom: '12px',
                          color: '#d4af37',
                          fontSize: '0.9rem',
                          fontWeight: 600,
                        }}
                      >
                        <MapPin size={16} />
                        <span>Select Delivery Address</span>
                      </div>

                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                          gap: '10px',
                        }}
                      >
                        {savedAddresses.map((addr) => {
                          const isSelected = selectedAddressId === addr.id;
                          return (
                            <div
                              key={addr.id}
                              onClick={() => handleSelectSavedAddress(addr)}
                              style={{
                                padding: '12px 14px',
                                borderRadius: '8px',
                                border: isSelected
                                  ? '1.5px solid #d4af37'
                                  : '1px solid rgba(212, 175, 55, 0.2)',
                                background: isSelected
                                  ? 'rgba(212, 175, 55, 0.15)'
                                  : 'rgba(4, 20, 13, 0.6)',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                              }}
                            >
                              <div
                                style={{
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  alignItems: 'center',
                                  marginBottom: '4px',
                                }}
                              >
                                <span
                                  style={{
                                    fontSize: '0.75rem',
                                    fontWeight: 700,
                                    color: isSelected ? '#d4af37' : '#9db3a8',
                                    textTransform: 'uppercase',
                                  }}
                                >
                                  {addr.isDefault ? '★ Primary' : addr.label}
                                </span>
                                <input
                                  type="radio"
                                  name="selectedSavedAddr"
                                  checked={isSelected}
                                  readOnly
                                  style={{ accentColor: '#d4af37', cursor: 'pointer' }}
                                />
                              </div>
                              <div style={{ fontWeight: 600, color: '#fcf9f2', fontSize: '0.9rem' }}>
                                {addr.recipientName}
                              </div>
                              {addr.phone && (
                                <div style={{ fontSize: '0.78rem', color: '#d4af37', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                  <span>📱 {addr.phone}</span>
                                </div>
                              )}
                              <div
                                style={{
                                  fontSize: '0.78rem',
                                  color: '#b0c4b8',
                                  marginTop: '4px',
                                  lineHeight: 1.4,
                                }}
                              >
                                {addr.streetAddress}, {addr.city} — {addr.pincode}
                              </div>
                            </div>
                          );
                        })}

                        <div
                          onClick={() => {
                            setSelectedAddressId('new');
                            setForm((prev) => ({
                              ...prev,
                              streetAddress: '',
                              city: '',
                              state: 'Tamil Nadu',
                              pincode: '',
                            }));
                          }}
                          style={{
                            padding: '12px 14px',
                            borderRadius: '8px',
                            border:
                              selectedAddressId === 'new'
                                ? '1.5px solid #d4af37'
                                : '1px dashed rgba(212, 175, 55, 0.3)',
                            background:
                              selectedAddressId === 'new'
                                ? 'rgba(212, 175, 55, 0.15)'
                                : 'transparent',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#d4af37',
                            fontSize: '0.85rem',
                            fontWeight: 600,
                          }}
                        >
                          + Deliver to Different Address
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Recipient Name and Phone */}
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
                        Recipient Name *
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
                          10-digit Indian mobile number for shipment tracking &amp; delivery updates
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Physical Address Fields */}
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

                  {/* Save to Profile Checkbox */}
                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      marginTop: '4px',
                      cursor: 'pointer',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={saveAddressForFuture}
                      onChange={(e) => setSaveAddressForFuture(e.target.checked)}
                      style={{ accentColor: '#d4af37', width: '16px', height: '16px', cursor: 'pointer' }}
                    />
                    <span style={{ fontSize: '0.88rem', color: '#ded4c3' }}>
                      Save this shipping address to my devotee account for future orders
                    </span>
                  </label>
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
                  marginBottom: '20px',
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
                    ₹{referralSettings?.refereeDiscountRupees || 50} First Order Blessing
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
                          Referral Code {appliedReferral.referrerCode} Applied
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
                        placeholder="e.g. DIVINE123"
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
                      Applicable on first order of ₹{referralSettings?.minOrderSubtotal || 500} or more. Referral locked to first referrer.
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Sanctum Wallet Credit Card */}
            {availableWallet > 0 && (
              <div
                style={{
                  background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.12) 0%, rgba(4, 20, 13, 0.85) 100%)',
                  border: useWalletBalance
                    ? '1px solid rgba(212, 175, 55, 0.6)'
                    : '1px solid rgba(212, 175, 55, 0.25)',
                  borderRadius: '12px',
                  padding: '18px 22px',
                  marginBottom: '24px',
                  backdropFilter: 'blur(8px)',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '10px',
                    flexWrap: 'wrap',
                    gap: '8px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Coins size={20} color="#d4af37" />
                    <div>
                      <span style={{ fontSize: '1rem', fontWeight: 600, color: '#fcf9f2' }}>
                        Sanctum Wallet Credit
                      </span>
                      <span
                        style={{
                          marginLeft: '10px',
                          fontSize: '0.85rem',
                          color: '#f5d77f',
                          fontWeight: 700,
                        }}
                      >
                        ₹{availableWallet.toLocaleString('en-IN')} Available
                      </span>
                    </div>
                  </div>
                  <span
                    style={{
                      fontSize: '0.72rem',
                      background: 'rgba(34, 197, 94, 0.15)',
                      color: '#4ade80',
                      padding: '2px 8px',
                      borderRadius: '12px',
                      fontWeight: 600,
                    }}
                  >
                    Store Credit
                  </span>
                </div>

                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    cursor: 'pointer',
                    userSelect: 'none',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={useWalletBalance}
                    onChange={(e) => setUseWalletBalance(e.target.checked)}
                    style={{
                      width: '18px',
                      height: '18px',
                      accentColor: '#d4af37',
                      cursor: 'pointer',
                    }}
                  />
                  <span style={{ fontSize: '0.88rem', color: '#e8f0ec' }}>
                    Apply <strong>₹{maxWalletApplicable.toLocaleString('en-IN')}</strong> from your wallet to this order
                  </span>
                </label>

                {useWalletBalance && (
                  <div
                    style={{
                      fontSize: '0.75rem',
                      color: '#4ade80',
                      marginTop: '6px',
                      marginLeft: '28px',
                    }}
                  >
                    ✓ ₹{walletDiscount.toLocaleString('en-IN')} will be deducted from your Sanctum Wallet upon checkout.
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
                  2
                </span>
                <h2 style={{ fontSize: '1.2rem', color: '#fcf9f2', margin: 0 }}>
                  Select Payment Method
                </h2>
              </div>

              <div style={{ display: 'grid', gap: '14px' }}>
                {/* Cashfree Option */}
                <label
                  onClick={() => setPaymentMethod('cashfree')}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '14px',
                    padding: '18px',
                    borderRadius: '10px',
                    background:
                      paymentMethod === 'cashfree'
                        ? 'rgba(212, 175, 55, 0.1)'
                        : 'rgba(2, 12, 8, 0.6)',
                    border:
                      paymentMethod === 'cashfree'
                        ? '2px solid #d4af37'
                        : '1px solid rgba(212, 175, 55, 0.2)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    id="radio-cashfree"
                    checked={paymentMethod === 'cashfree'}
                    onChange={() => setPaymentMethod('cashfree')}
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
                        Cashfree Secure Gateway (Recommended)
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
                  : `Proceed to Pay ₹${grandTotal.toLocaleString('en-IN')} via Cashfree`}
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
              {walletDiscount > 0 && (
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '0.9rem',
                    color: '#f5d77f',
                    marginBottom: '10px',
                    fontWeight: 600,
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Coins size={14} />
                    <span>Sanctum Wallet Credit</span>
                  </span>
                  <span>-₹{walletDiscount.toLocaleString('en-IN')}</span>
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

            {/* Proceed to Pay Action Button */}
            <button
              type="button"
              onClick={() => {
                const submitBtn = document.getElementById('checkout-submit-btn');
                if (submitBtn) submitBtn.click();
              }}
              disabled={isProcessing}
              className="btn-gold"
              style={{
                width: '100%',
                padding: '14px',
                fontSize: '0.98rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                marginBottom: '16px',
                cursor: isProcessing ? 'not-allowed' : 'pointer',
                opacity: isProcessing ? 0.75 : 1,
              }}
            >
              <Lock size={16} />
              <span>{isProcessing ? 'Connecting...' : `Proceed to Pay ₹${grandTotal.toLocaleString('en-IN')}`}</span>
            </button>

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
