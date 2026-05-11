import React from "react";
import LegalLayout, { LegalSection, LP, LegalList } from "../components/LegalLayout.jsx";

export default function TermsAndConditions() {
  return (
    <LegalLayout title="Terms &amp; Conditions" lastUpdated="May 11, 2026">

      <LP>
        Please read these Terms and Conditions carefully before using Foliant (the "Service"). By creating an
        account or using any part of the Service, you agree to be bound by these terms. If you do not agree,
        please do not use Foliant.
      </LP>

      <LegalSection title="1. Acceptance of Terms">
        <LP>
          These Terms constitute a legally binding agreement between you and Foliant ("we", "us", "our").
          They govern your access to and use of the Foliant AI Resume Builder, including all features,
          content, and functionality available through the website.
        </LP>
      </LegalSection>

      <LegalSection title="2. Description of Service">
        <LP>
          Foliant is an AI-assisted resume-building tool that allows users to create, edit, preview, and
          export professional resumes in PDF and Word formats. The Service includes:
        </LP>
        <LegalList items={[
          "Resume editor with multiple professional templates.",
          "PDF and Word document export.",
          "AI-powered professional summary generation (Pro).",
          "AI Interview Simulator with role-specific questions (Pro).",
          "Personalised job match suggestions (Pro).",
          "Cover letter generator (Pro).",
          "Cloud resume storage and multi-resume management.",
        ]} />
      </LegalSection>

      <LegalSection title="3. Account Registration and Security">
        <LP>
          You may sign up using Google Sign-In or email and password, both powered by Firebase
          Authentication. You are responsible for maintaining the confidentiality of your account credentials
          and for all activity that occurs under your account.
        </LP>
        <LP>
          You must provide accurate information during registration. One account per person is permitted.
          Creating multiple accounts to circumvent free-tier limits is a violation of these Terms.
        </LP>
        <LP>
          Notify us immediately at{" "}
          <a href="mailto:support@foliant.app" style={{ color: "#1a2e4a", textDecoration: "underline" }}>
            support@foliant.app
          </a>{" "}
          if you suspect unauthorised access to your account.
        </LP>
      </LegalSection>

      <LegalSection title="4. Acceptable Use">
        <LP>You agree not to use the Service to:</LP>
        <LegalList items={[
          "Submit, upload, or generate content that is unlawful, defamatory, harassing, or fraudulent.",
          "Impersonate any person or organisation or submit false personal information.",
          "Scrape, crawl, or automate requests to the Service beyond normal interactive use.",
          "Attempt to reverse-engineer, decompile, or extract the source code of Foliant.",
          "Circumvent download limits, subscription checks, or other usage restrictions.",
          "Use the Service in any way that could damage, disable, or impair our infrastructure.",
        ]} />
        <LP>
          We reserve the right to suspend or terminate accounts that violate these terms without prior notice.
        </LP>
      </LegalSection>

      <LegalSection title="5. Free Plan Limitations">
        <LP>
          Users on the free plan may download up to <strong>5 PDF or Word documents per day</strong>. This
          limit resets at midnight (UTC). Free plan users have access to 5 basic resume templates and core
          editing features.
        </LP>
        <LP>
          AI-powered features (summary generation, interview simulator, job matches, cover letter) are
          available exclusively to Pro subscribers.
        </LP>
      </LegalSection>

      <LegalSection title="6. Pro Subscription">
        <LP>
          The Pro plan unlocks all premium features and is available as a monthly (Rs. 99) or yearly
          (Rs. 1,499) subscription. Pricing is subject to change with reasonable advance notice.
        </LP>
        <LP>
          <strong>Activation.</strong> Pro access is activated immediately after payment is verified on our
          servers. If you experience a delay exceeding 10 minutes, contact support with your Razorpay payment
          ID.
        </LP>
        <LP>
          <strong>No auto-renewal.</strong> Foliant subscriptions are one-time payments for a fixed period
          (monthly or yearly). Your Pro access remains active until the subscription period ends. We will not
          automatically charge you again — renewal requires a new manual payment.
        </LP>
        <LP>
          <strong>Upgrade and Downgrade.</strong> Upgrading from monthly to yearly is available at any time.
          Upon the yearly subscription's expiry, your account reverts to the free plan and previously
          generated Pro content remains viewable but new Pro features are gated.
        </LP>
      </LegalSection>

      <LegalSection title="7. AI-Generated Content Disclaimer">
        <LP>
          Foliant uses Google Gemini AI to generate resume summaries, interview questions, and sample answers.
          This content is provided as a starting point and writing aid only.
        </LP>
        <LegalList items={[
          "AI-generated content may be generic, inaccurate, or unsuitable for your specific context.",
          "You are responsible for reviewing, editing, and verifying all AI-generated content before using it in job applications.",
          "Foliant makes no warranty that AI content will improve your chances of employment.",
          "We are not liable for any outcome — positive or negative — resulting from use of AI-generated resume content.",
        ]} />
      </LegalSection>

      <LegalSection title="8. Intellectual Property">
        <LP>
          <strong>Your content.</strong> The resume content you create — your name, work history, skills, and
          all text you write — belongs to you. By using Foliant, you grant us a limited licence to store and
          process your content solely to deliver the Service.
        </LP>
        <LP>
          <strong>Our content.</strong> The Foliant brand, logo, template designs, user interface, and
          underlying software are owned by us and protected by copyright and intellectual property laws. You
          may not copy, modify, or distribute them without our written permission.
        </LP>
      </LegalSection>

      <LegalSection title="9. Service Availability">
        <LP>
          We aim for high availability but do not guarantee uninterrupted access to the Service. The Service
          may be temporarily unavailable due to maintenance, server updates, or factors beyond our control
          (including third-party services such as Firebase, Google Cloud, or Razorpay).
        </LP>
        <LP>
          We reserve the right to modify, suspend, or discontinue any feature of the Service at any time.
          For material changes affecting paid subscribers, we will provide reasonable notice.
        </LP>
        <LP>
          PDF generation relies on our server infrastructure and may take longer during periods of high load
          or after server cold starts (particularly on the first generation of the day). This is an inherent
          characteristic of the hosting environment, not a Service failure.
        </LP>
      </LegalSection>

      <LegalSection title="10. Limitation of Liability">
        <LP>
          To the maximum extent permitted by applicable law, Foliant and its operators shall not be liable
          for any indirect, incidental, consequential, or punitive damages arising out of your use of, or
          inability to use, the Service — including loss of data, lost employment opportunities, or revenue
          loss — even if we have been advised of the possibility of such damages.
        </LP>
        <LP>
          Our total liability for any claim arising from the Service shall not exceed the amount you paid us
          in the 3 months preceding the claim.
        </LP>
      </LegalSection>

      <LegalSection title="11. Governing Law">
        <LP>
          These Terms are governed by the laws of India. Any disputes arising under these Terms shall be
          subject to the exclusive jurisdiction of the courts located in India. If you are accessing the
          Service from outside India, you do so voluntarily and are responsible for compliance with local laws.
        </LP>
      </LegalSection>

      <LegalSection title="12. Changes to These Terms">
        <LP>
          We may update these Terms from time to time. Changes will be posted on this page with an updated
          "Last updated" date. Continued use of the Service after changes are posted constitutes your
          acceptance of the new Terms.
        </LP>
      </LegalSection>

      <LegalSection title="13. Contact Us">
        <LP>
          For questions about these Terms, contact us at:{" "}
          <a href="mailto:support@foliant.app" style={{ color: "#1a2e4a", textDecoration: "underline" }}>
            support@foliant.app
          </a>
        </LP>
      </LegalSection>

    </LegalLayout>
  );
}
