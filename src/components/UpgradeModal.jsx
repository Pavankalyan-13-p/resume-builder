import React, { useState, useRef } from "react";
import { X, Crown, Check, Zap, ArrowRight, Loader2 } from "lucide-react";
import { addDoc, updateDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/config';

// ── Backend URL (same server as AI routes) ────────────────────────────────────
// Empty string = relative URL so production calls hit the same Express origin.
// In dev, VITE_AI_SERVER_URL=http://localhost:3001 (set in .env) overrides this.
const SERVER = import.meta.env.VITE_AI_SERVER_URL
  || import.meta.env.VITE_PDF_SERVER_URL
  || '';

// ── Plan config (amounts in paise = INR × 100) ───────────────────────────────
const PLAN_CFG = {
  monthly: { amount: 9900,   display: 'Rs.99'    },
  yearly:  { amount: 149900, display: 'Rs.1,499' },
};

// Dynamically loads the Razorpay checkout script once and caches it
function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (window.Razorpay) { resolve(true); return; }
    const s = document.createElement('script');
    s.src = 'https://checkout.razorpay.com/v1/checkout.js';
    s.onload  = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });
}

const UPGRADE_MODAL_CSS = `
  .um-backdrop { position:fixed; inset:0; z-index:50; display:flex; align-items:center; justify-content:center;
    background:rgba(26,46,74,0.72); padding:20px; }
  .um-sheet { background:#fff; width:100%; max-width:400px; max-height:88vh;
    overflow-y:auto; border-radius:4px; box-shadow:0 20px 60px rgba(0,0,0,0.3);
    display:flex; flex-direction:column; }
  .um-header { background:#1a2e4a; padding:1.25rem 1.25rem 1.1rem; position:relative; flex-shrink:0; }
  .um-close { position:absolute; top:10px; right:10px; background:rgba(255,255,255,0.1);
    border:none; cursor:pointer; color:#94a3b8; border-radius:3px; padding:5px;
    display:flex; align-items:center; justify-content:center; transition:background 0.15s; }
  .um-close:hover { background:rgba(255,255,255,0.2); color:#fff; }
  .um-body { padding:1.1rem 1.25rem 1.25rem; flex:1; overflow-y:auto; }
  .um-price { font-family:'Source Serif Pro',Georgia,serif; font-size:2.25rem; font-weight:700; color:#1a2e4a; line-height:1; }
  .um-strike { font-family:'Source Serif Pro',Georgia,serif; font-size:1.1rem; color:#ccc; text-decoration:line-through; }
  .um-features { list-style:none; padding:0; margin:0 0 1rem 0; display:flex; flex-direction:column; gap:7px; }
  .um-cta { width:100%; padding:0.8rem; border:none; cursor:pointer; font-weight:700;
    font-size:0.88rem; letter-spacing:0.02em; font-family:inherit; transition:opacity 0.15s;
    display:flex; align-items:center; justify-content:center; gap:7px; }
  .um-cta:hover:not(:disabled) { opacity:0.9; }
  .um-cta:disabled { opacity:0.65; cursor:not-allowed; }
  @media (max-width: 480px) {
    .um-backdrop { padding:12px; align-items:flex-end; }
    .um-sheet { max-width:100%; max-height:82vh; border-radius:4px 4px 0 0; }
    .um-header { padding:1rem 1rem 0.9rem; }
    .um-body { padding:0.9rem 1rem 1.1rem; }
    .um-price { font-size:1.9rem; }
    .um-features { gap:6px; }
  }
`;

export default function UpgradeModal({ onClose, onUpgrade, user, plan }) {
  const isYearly = plan === 'yearly';
  const accent   = isYearly ? "#15803d" : "#b84a2e";
  const ctaBg    = isYearly ? "#1a2e4a" : "#b84a2e";

  // pay states: 'idle' | 'loading' | 'success' | 'error'
  const [payState, setPayState] = useState('idle');
  const [payError, setPayError] = useState(null);

  // refs to track the Firestore payment doc across async callbacks
  const paymentDocRef   = useRef(null);
  const rzpHandlerFired = useRef(false);

  const planKey  = isYearly ? 'yearly' : 'monthly';
  const planData = PLAN_CFG[planKey];

  const handlePay = async () => {
    // Not signed in → hand off to auth flow (existing behaviour)
    if (!user) {
      onUpgrade();
      return;
    }

    setPayState('loading');
    setPayError(null);

    // 1. Load Razorpay checkout script
    const scriptLoaded = await loadRazorpayScript();
    if (!scriptLoaded) {
      setPayState('error');
      setPayError('Could not load payment gateway. Check your internet connection and try again.');
      return;
    }

    // 2. Create order on backend
    let orderData;
    try {
      const res  = await fetch(`${SERVER}/api/create-order`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ plan: planKey }),
      });
      orderData = await res.json();
      if (!res.ok) throw new Error(orderData.error || 'Order creation failed');
    } catch (err) {
      setPayState('error');
      setPayError(err.message || 'Could not initiate payment. Please try again.');
      return;
    }

    // 2b. Log pending payment to Firestore so admin panel sees it immediately
    rzpHandlerFired.current = false;
    paymentDocRef.current   = null;
    try {
      paymentDocRef.current = await addDoc(collection(db, 'payments'), {
        email:         user.email || '',
        amount:        planData.amount / 100,
        currency:      'INR',
        status:        'pending',
        transactionId: orderData.orderId,
        orderId:       orderData.orderId,
        paymentId:     null,
        plan:          planKey,
        note:          orderData.label,
        failureReason: null,
        createdAt:     serverTimestamp(),
        updatedAt:     serverTimestamp(),
      });
    } catch (_) {
      // Non-critical — proceed with payment even if Firestore write fails
    }

    // 3. Open Razorpay checkout
    //
    // TEST MODE — use these test credentials:
    //   Card:  4111 1111 1111 1111  |  Exp: any future date  |  CVV: any 3 digits
    //   UPI:   success@razorpay
    //   Net Banking: any bank, use test credentials
    //   Docs: https://razorpay.com/docs/payments/payments/test-card-upi-details/
    setPayState('idle'); // let Razorpay modal take over the screen

    const rzp = new window.Razorpay({
      key:         orderData.keyId,
      amount:      orderData.amount,
      currency:    orderData.currency,
      order_id:    orderData.orderId,
      name:        'Resume Builder Pro',
      description: orderData.label,
      theme:       { color: '#b84a2e' },
      prefill: {
        name:  user.name  || '',
        email: user.email || '',
      },
      // 4. Payment success — verify signature on backend before granting Pro
      handler: async (response) => {
        rzpHandlerFired.current = true;
        setPayState('loading');
        try {
          const vRes = await fetch(`${SERVER}/api/verify-payment`, {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify({
              razorpay_order_id:   response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature:  response.razorpay_signature,
            }),
          });
          const vData = await vRes.json();
          if (vData.verified) {
            // Update Firestore payment doc to completed
            if (paymentDocRef.current) {
              try {
                await updateDoc(paymentDocRef.current, {
                  status:        'completed',
                  transactionId: vData.paymentId,
                  paymentId:     vData.paymentId,
                  updatedAt:     serverTimestamp(),
                });
              } catch (_) {}
            }
            setPayState('success');
            // Activate Pro — App.jsx stores paymentId in Firestore
            await onUpgrade(vData.paymentId, planKey);
          } else {
            // Update Firestore payment doc to failed
            if (paymentDocRef.current) {
              try {
                await updateDoc(paymentDocRef.current, {
                  status:        'failed',
                  failureReason: vData.error || 'Signature verification failed',
                  updatedAt:     serverTimestamp(),
                });
              } catch (_) {}
            }
            setPayState('error');
            setPayError(vData.error || 'Payment verification failed. Contact support if your amount was deducted.');
          }
        } catch {
          setPayState('error');
          setPayError('Could not verify payment. Contact support with your payment ID.');
        }
      },
      modal: {
        ondismiss: () => {
          // User closed the checkout without completing payment
          if (!rzpHandlerFired.current && paymentDocRef.current) {
            updateDoc(paymentDocRef.current, {
              status:        'failed',
              failureReason: 'User dismissed checkout',
              updatedAt:     serverTimestamp(),
            }).catch(() => {});
          }
          setPayState('idle');
        },
      },
    });

    rzp.open();
  };

  return (
    <>
      <style>{UPGRADE_MODAL_CSS}</style>
      <div className="um-backdrop" onClick={onClose}>
        <div className="um-sheet" onClick={e => e.stopPropagation()}>

          {/* Header */}
          <div className="um-header">
            <button className="um-close" onClick={onClose} aria-label="Close">
              <X style={{ width: 15, height: 15 }} />
            </button>
            <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 6 }}>
              <Crown style={{ width: 15, height: 15, color: "#fbbf24" }} />
              <span style={{ fontSize: "0.6rem", textTransform: "uppercase", letterSpacing: "0.15em", color: "#94a3b8", fontWeight: 700 }}>
                {isYearly ? "Pro Yearly · Best Value" : "Pro Monthly · Launch Offer"}
              </span>
            </div>
            <div style={{ fontFamily: "'Source Serif Pro', Georgia, serif", fontSize: "1.2rem", fontWeight: 700, color: "#fff", lineHeight: 1.25 }}>
              Get Hired Faster with Pro
            </div>
            <div style={{ fontSize: "0.75rem", color: "#94a3b8", marginTop: 4 }}>
              {isYearly ? "Pay once, use all year — best value for job seekers." : "Premium templates, job access & priority support."}
            </div>
          </div>

          {/* Body */}
          <div className="um-body">

            {/* Offer pill */}
            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: isYearly ? "#f0fdf4" : "#fff8f6",
              border: `1.5px solid ${accent}`, borderRadius: 3, padding: "6px 12px", marginBottom: "0.9rem" }}>
              <Zap style={{ width: 14, height: 14, color: accent }} />
              <span style={{ fontSize: "0.75rem", fontWeight: 700, color: accent }}>
                {isYearly ? "Save 40% — Best Value" : "Launch Offer — Rs.99 for First 100 Users"}
              </span>
            </div>

            {/* Price row */}
            <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 2 }}>
              <span className="um-price">{isYearly ? "Rs.1,499" : "Rs.99"}</span>
              <span className="um-strike">{isYearly ? "Rs.3,588" : "Rs.299"}</span>
              <span style={{ fontSize: "0.82rem", color: "#888" }}>{isYearly ? "/year" : "/month"}</span>
            </div>
            <div style={{ fontSize: "0.72rem", color: "#888", marginBottom: "0.9rem" }}>
              {isYearly
                ? <span><span style={{ color: "#15803d", fontWeight: 600 }}>Rs.125/month effective</span> · Save Rs.2,089 vs regular Rs.299/mo</span>
                : <span>Regular price Rs.299/month · <span style={{ color: "#b84a2e", fontWeight: 600 }}>First 100 users only</span> · Or Rs.1,499/year</span>}
            </div>

            <div style={{ height: 1, background: "#ebebeb", marginBottom: "0.9rem" }} />

            {/* Features */}
            <ul className="um-features">
              {(isYearly ? [
                "Everything in Pro Monthly",
                "All 10 premium templates (15 total)",
                "Personalized Job Matches",
                "Cover Letter Generator (PDF download)",
                "Unlimited PDF & Word exports",
                "All future features + Priority Support",
              ] : [
                "All 10 premium templates (15 total)",
                "Personalized Job Matches",
                "Cover Letter Generator (PDF download)",
                "Unlimited PDF & Word exports",
                "Priority Support + all future features",
              ]).map(f => (
                <li key={f} style={{ display: "flex", alignItems: "flex-start", gap: 8, fontSize: "0.83rem", color: "#333" }}>
                  <Check style={{ width: 13, height: 13, color: accent, flexShrink: 0, marginTop: 2 }} /> {f}
                </li>
              ))}
            </ul>

            {/* Error message */}
            {payState === 'error' && payError && (
              <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 4, padding: "10px 12px", marginBottom: "0.75rem", fontSize: "0.78rem", color: "#b91c1c", lineHeight: 1.5 }}>
                {payError}
              </div>
            )}

            {/* Success message (brief — modal closes via onUpgrade) */}
            {payState === 'success' && (
              <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 4, padding: "10px 12px", marginBottom: "0.75rem", fontSize: "0.82rem", color: "#15803d", fontWeight: 600, textAlign: "center" }}>
                ✓ Payment verified! Activating Pro…
              </div>
            )}

            {/* CTA */}
            <button
              className="um-cta"
              onClick={handlePay}
              disabled={payState === 'loading' || payState === 'success'}
              style={{ background: ctaBg, color: "#fff", marginBottom: 6 }}>
              {payState === 'loading' ? (
                <><Loader2 style={{ width: 14, height: 14, animation: "spin 1s linear infinite" }} /> Processing…</>
              ) : payState === 'success' ? (
                <>✓ Activating Pro…</>
              ) : user ? (
                isYearly
                  ? <>Pay {planData.display} &amp; Unlock Pro <ArrowRight style={{ width: 14, height: 14 }} /></>
                  : <>Pay {planData.display} &amp; Unlock Pro <ArrowRight style={{ width: 14, height: 14 }} /></>
              ) : (
                <>Sign up &amp; Get Hired Faster <ArrowRight style={{ width: 14, height: 14 }} /></>
              )}
            </button>

            {!isYearly && (
              <div style={{ textAlign: "center", fontSize: "0.72rem", color: "#64748b", marginBottom: 6 }}>
                Or get <strong style={{ color: "#15803d" }}>Yearly — Rs.1,499/year</strong> and save 58%
              </div>
            )}
            <p style={{ fontSize: "0.67rem", textAlign: "center", color: "#bbb", margin: 0 }}>
              Secured by Razorpay · No hidden fees · Instant access after payment
            </p>
          </div>
        </div>
      </div>
      {/* Spinner keyframe */}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </>
  );
}
