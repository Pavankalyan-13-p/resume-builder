import React from "react";
import LegalLayout, { LegalSection, LP, LegalList } from "../components/LegalLayout.jsx";

export default function RefundPolicy() {
  return (
    <LegalLayout title="Refund Policy" lastUpdated="May 11, 2026">

      <LP>
        We want you to have a great experience with Foliant. Because our Pro plan delivers digital access
        instantly, our refund policy is designed to be fair while accounting for the nature of digital
        subscriptions. Please read this policy before making a purchase.
      </LP>

      <LegalSection title="1. Digital Subscription Service">
        <LP>
          Foliant Pro is a <strong>digital subscription service</strong>. Upon successful payment verification,
          Pro features — including premium templates, unlimited downloads, AI tools, and job matches — are
          activated immediately on your account.
        </LP>
        <LP>
          Because access to digital content is granted instantly and cannot be "returned", refunds are not
          automatically available for all purchases. However, we review every request individually and always
          aim to be fair.
        </LP>
      </LegalSection>

      <LegalSection title="2. When We Issue Refunds">
        <LP>We will issue a full refund in the following situations:</LP>
        <LegalList items={[
          "Your Pro access was not activated within 30 minutes of a successful payment, and the issue cannot be resolved by our support team.",
          "You were charged more than once for the same subscription period (duplicate payment).",
          "A verified technical error on our side prevented you from using the Service after payment.",
        ]} />
        <LP>
          We review refund requests submitted within <strong>7 days of the original payment date</strong> on a
          case-by-case basis. Requests submitted after 7 days are generally not eligible unless there are
          exceptional circumstances.
        </LP>
      </LegalSection>

      <LegalSection title="3. When Refunds Are Not Available">
        <LP>Refunds will generally not be issued in the following circumstances:</LP>
        <LegalList items={[
          "You changed your mind after purchasing and have already used Pro features (downloaded resumes, generated AI content, etc.).",
          "You forgot to cancel or did not use the subscription during the billing period — Foliant does not auto-renew, so this scenario does not apply.",
          "The request is made more than 7 days after the payment date without a valid technical reason.",
          "Your account was suspended for violation of our Terms and Conditions.",
        ]} />
      </LegalSection>

      <LegalSection title="4. Accidental and Duplicate Payments">
        <LP>
          If you were charged more than once for the same subscription (e.g., you clicked "Pay" multiple
          times or experienced a network issue that resulted in two successful charges), we will refund the
          duplicate amount in full.
        </LP>
        <LP>
          Please contact us <strong>within 48 hours</strong> of the duplicate charge with both Razorpay
          Payment IDs so we can verify and process the refund promptly. You can find your Payment ID in the
          Razorpay payment confirmation email or SMS.
        </LP>
      </LegalSection>

      <LegalSection title="5. Delayed Pro Activation">
        <LP>
          Pro access is normally activated within seconds of payment verification. If your account still shows
          as "Free" after 10 minutes of a successful payment, please:
        </LP>
        <LegalList items={[
          "Refresh the page and sign out, then sign back in.",
          "If the issue persists, contact us at support@foliant.app with your Razorpay Payment ID.",
          "We will manually activate your Pro access within 24 hours of receiving your message.",
        ]} />
        <LP>
          Activation delays are not grounds for a refund if the issue is resolved within a reasonable
          timeframe.
        </LP>
      </LegalSection>

      <LegalSection title="6. How to Request a Refund">
        <LP>To request a refund, email us at:</LP>
        <LP>
          <a href="mailto:support@foliant.app" style={{ color: "#1a2e4a", textDecoration: "underline", fontWeight: 600 }}>
            support@foliant.app
          </a>
        </LP>
        <LP>Please include the following in your email:</LP>
        <LegalList items={[
          "Subject line: \"Refund Request — [your registered email]\"",
          "The email address associated with your Foliant account.",
          "Your Razorpay Order ID or Payment ID (found in the Razorpay confirmation email).",
          "A brief description of the reason for your refund request.",
        ]} />
        <LP>
          We will acknowledge your request within 1 business day and aim to resolve it within 3 business days.
        </LP>
      </LegalSection>

      <LegalSection title="7. Refund Processing Time">
        <LP>
          Approved refunds are processed through Razorpay back to your original payment method. Processing
          time after approval:
        </LP>
        <LegalList items={[
          "Credit/Debit cards: 5–7 business days (depending on your bank).",
          "UPI: 2–3 business days.",
          "Net Banking: 5–7 business days.",
        ]} />
        <LP>
          You will receive a confirmation email from Razorpay once the refund is initiated. If you do not
          receive the refund within 10 business days of approval, contact your bank with the Razorpay refund
          reference ID provided in that email.
        </LP>
      </LegalSection>

      <LegalSection title="8. No Auto-Renewal — No Cancellation Needed">
        <LP>
          Foliant Pro subscriptions are <strong>one-time payments</strong> for a fixed period (monthly or
          yearly). We do not store your payment credentials or set up recurring charges. When your
          subscription expires, your account returns to the free plan automatically — there is nothing to
          cancel and no risk of being charged again without your action.
        </LP>
      </LegalSection>

      <LegalSection title="9. Contact">
        <LP>
          If you have any questions about this Refund Policy, please reach out to us at{" "}
          <a href="mailto:support@foliant.app" style={{ color: "#1a2e4a", textDecoration: "underline" }}>
            support@foliant.app
          </a>
          . We are committed to resolving payment issues quickly and fairly.
        </LP>
      </LegalSection>

    </LegalLayout>
  );
}
