import React from "react";
import LegalLayout, { LegalSection, LP, LegalList } from "../components/LegalLayout.jsx";

export default function PrivacyPolicy() {
  return (
    <LegalLayout title="Privacy Policy" lastUpdated="May 11, 2026">

      <LP>
        Foliant ("we", "our", or "us") operates the AI Resume Builder service available at this website. This
        Privacy Policy explains what information we collect, why we collect it, and how we handle it. By using
        Foliant, you agree to the practices described below.
      </LP>

      <LegalSection title="1. Information We Collect">
        <LP><strong>Account information.</strong> When you sign up with Google or email, we collect your name
        and email address through Firebase Authentication. Google Sign-In only grants us your public profile
        name and email — we do not access your Google contacts, Drive, or any other Google services.</LP>

        <LP><strong>Resume content.</strong> Everything you type into the resume editor — personal details,
        work history, education, skills, projects, and certifications — is stored in your account so your work
        is available across devices. This data belongs to you and is used solely to deliver the service.</LP>

        <LP><strong>Payment information.</strong> Pro subscription payments are processed entirely by
        Razorpay, a PCI-DSS-compliant payment gateway. We never see or store your card number, CVV, bank
        account details, or UPI credentials. After payment completes, Razorpay sends us only a payment
        confirmation ID, which we record to activate your Pro access.</LP>

        <LP><strong>Usage data.</strong> We may log basic, non-identifying usage signals (such as which
        template was selected or whether a PDF was downloaded) to understand how the product is used and
        improve it. This data is not linked to your identity and is not shared with third-party advertisers.</LP>
      </LegalSection>

      <LegalSection title="2. How We Use Your Information">
        <LegalList items={[
          "Provide, operate, and improve the resume-building service.",
          "Sync your resumes and preferences across sessions and devices.",
          "Generate AI-assisted resume summaries and interview questions using Google Gemini AI (see Section 4).",
          "Activate and manage your Pro subscription.",
          "Respond to support requests submitted through the Contact Support form.",
          "Send important service announcements (no marketing emails without your consent).",
        ]} />
      </LegalSection>

      <LegalSection title="3. Data Storage and Security">
        <LP>
          Your account data and resume content are stored in Google Cloud Firestore, which encrypts data at
          rest and in transit. Foliant's servers and database infrastructure run on Google Cloud Platform within
          data centres that meet ISO 27001 and SOC 2 compliance requirements.
        </LP>
        <LP>
          All communication between your browser and our servers uses HTTPS (TLS 1.2 or higher). Access to
          your Firestore data is protected by Firebase security rules — only you can read or write your own
          documents when authenticated.
        </LP>
      </LegalSection>

      <LegalSection title="4. AI-Generated Content">
        <LP>
          Certain Pro features — the AI Summary Generator and AI Interview Simulator — send portions of your
          resume content (role, skills, experience titles) to the Google Gemini API to generate suggestions.
          This data is transmitted securely over HTTPS and used solely to produce the requested AI output for
          that session.
        </LP>
        <LP>
          Under Google's current API usage policies for the Gemini API, data submitted through the API is
          not used to train Google's AI models by default. We encourage you to review{" "}
          <a href="https://ai.google.dev/terms" target="_blank" rel="noopener noreferrer"
            style={{ color: "#1a2e4a", textDecoration: "underline" }}>
            Google's Gemini API terms
          </a>{" "}
          for the most up-to-date information.
        </LP>
      </LegalSection>

      <LegalSection title="5. Payment Processing (Razorpay)">
        <LP>
          Subscription payments are processed by Razorpay Software Private Limited, an RBI-authorised payment
          aggregator. When you click "Pay", the Razorpay checkout modal opens and your payment credentials are
          submitted directly to Razorpay's servers — they never pass through Foliant's servers.
        </LP>
        <LP>
          After a successful payment, Razorpay returns a cryptographically signed confirmation that we verify
          server-side. We store only the Razorpay Order ID and Payment ID in your account record to activate
          Pro access and maintain payment history. No card numbers, CVV codes, or bank credentials are ever
          stored by us.
        </LP>
        <LP>
          Razorpay's privacy practices are governed by the{" "}
          <a href="https://razorpay.com/privacy/" target="_blank" rel="noopener noreferrer"
            style={{ color: "#1a2e4a", textDecoration: "underline" }}>
            Razorpay Privacy Policy
          </a>.
        </LP>
      </LegalSection>

      <LegalSection title="6. Data Sharing and Third-Party Services">
        <LP>
          <strong>We do not sell, rent, or trade your personal data to any third party.</strong> We share
          data only with the following service providers, strictly to operate the service:
        </LP>
        <LegalList items={[
          "Google Firebase / Firestore — authentication and data storage.",
          "Google Gemini API — AI-powered content generation (Pro features only).",
          "Razorpay — payment processing for Pro subscriptions.",
        ]} />
        <LP>
          We may also disclose information if required by law, a court order, or to protect the rights and
          safety of our users or the public.
        </LP>
      </LegalSection>

      <LegalSection title="7. Cookies and Local Storage">
        <LP>
          Foliant uses browser <strong>localStorage</strong> to save your resume draft and template
          preferences locally on your device, so your work is preserved between sessions even without signing
          in. This data stays on your device and is not transmitted to our servers unless you are signed in.
        </LP>
        <LP>
          We do not use third-party tracking cookies or advertising cookies. Firebase Authentication sets a
          session token cookie that is used only to keep you signed in securely.
        </LP>
      </LegalSection>

      <LegalSection title="8. Data Retention and Deletion">
        <LP>
          Your account and resume data are retained for as long as your account is active. If you delete your
          account (available in Profile → Delete Account), all your Firestore data, including resumes and
          payment records, is permanently deleted within 30 days.
        </LP>
        <LP>
          Anonymised usage logs (not linked to your identity) may be retained for up to 12 months for
          product analytics.
        </LP>
      </LegalSection>

      <LegalSection title="9. Children's Privacy">
        <LP>
          Foliant is not directed at children under the age of 13. We do not knowingly collect personal
          information from children. If you believe a child has provided us with their data, please contact us
          and we will delete it promptly.
        </LP>
      </LegalSection>

      <LegalSection title="10. Your Rights">
        <LP>You have the right to:</LP>
        <LegalList items={[
          "Access and download the resume content stored in your account at any time.",
          "Correct inaccurate personal information via the Profile settings.",
          "Delete your account and all associated data through Profile → Delete Account.",
          "Contact us for any other data-related request.",
        ]} />
      </LegalSection>

      <LegalSection title="11. Changes to This Policy">
        <LP>
          We may update this Privacy Policy from time to time. When we make material changes, we will update
          the "Last updated" date at the top of this page. Continued use of Foliant after changes are posted
          constitutes acceptance of the revised policy.
        </LP>
      </LegalSection>

      <LegalSection title="12. Contact Us">
        <LP>
          If you have any questions or concerns about this Privacy Policy or how your data is handled, please
          contact us at:{" "}
          <a href="mailto:foliantai@gmail.com" style={{ color: "#1a2e4a", textDecoration: "underline" }}>
            foliantai@gmail.com
          </a>
        </LP>
      </LegalSection>

    </LegalLayout>
  );
}
