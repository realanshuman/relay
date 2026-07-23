import type { Metadata } from "next";
import { LegalPage, LegalSection } from "@/components/legal";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "The terms that govern your use of Relay.",
};

export default function TermsPage() {
  return (
    <LegalPage title="Terms of Service" updated="July 23, 2026">
      <p>
        Welcome to Relay. These Terms of Service (&ldquo;Terms&rdquo;) govern your access to and
        use of the Relay application, website, and related services (together, the
        &ldquo;Service&rdquo;). By using the Service, you agree to these Terms. If you do not
        agree, please do not use the Service.
      </p>

      <LegalSection title="1. The Service">
        <p>
          Relay connects to code repositories you authorize, detects releases, and uses
          automated systems — including artificial intelligence — to draft release notes,
          changelogs, announcements, images, and related content (&ldquo;Generated
          Content&rdquo;) for your review and publication.
        </p>
      </LegalSection>

      <LegalSection title="2. Your account and workspace">
        <p>
          You are responsible for the activity that happens in your workspace, for maintaining
          the security of your credentials and API keys, and for ensuring that people you invite
          are authorized to access your repositories&apos; information.
        </p>
      </LegalSection>

      <LegalSection title="3. Your content">
        <p>
          You retain all rights to the code metadata, text, images, and other material you
          submit to the Service, and to the Generated Content you publish. You grant Relay a
          limited license to process this material solely to operate and improve the Service —
          for example, to analyze commits, generate drafts, and host your public changelog.
        </p>
      </LegalSection>

      <LegalSection title="4. Generated Content">
        <p>
          Generated Content is produced by automated systems and may be inaccurate or
          incomplete. <strong>You are responsible for reviewing Generated Content before
          publishing it.</strong> Relay does not guarantee that Generated Content is free of
          errors, suitable for your purpose, or non-infringing.
        </p>
      </LegalSection>

      <LegalSection title="5. Acceptable use">
        <p>You agree not to use the Service to:</p>
        <ul>
          <li>publish content that is unlawful, deceptive, or infringes others&apos; rights;</li>
          <li>attempt to access repositories, workspaces, or data you are not authorized to access;</li>
          <li>interfere with or disrupt the integrity or performance of the Service; or</li>
          <li>resell or provide the Service to third parties without our permission.</li>
        </ul>
      </LegalSection>

      <LegalSection title="6. Subscriptions and credits">
        <p>
          Some features consume AI credits or require a paid plan. Fees, plans, and credit
          allowances are described in the product at the time of purchase and may change with
          reasonable notice.
        </p>
      </LegalSection>

      <LegalSection title="7. Termination">
        <p>
          You may stop using the Service and delete your workspace at any time. We may suspend
          or terminate access if you materially breach these Terms, with notice where
          practicable.
        </p>
      </LegalSection>

      <LegalSection title="8. Disclaimers and limitation of liability">
        <p>
          The Service is provided &ldquo;as is&rdquo; without warranties of any kind, express or
          implied. To the maximum extent permitted by law, Relay will not be liable for
          indirect, incidental, special, consequential, or punitive damages, or any loss of
          profits, data, or goodwill, arising from your use of the Service.
        </p>
      </LegalSection>

      <LegalSection title="9. Changes to these Terms">
        <p>
          We may update these Terms from time to time. If a change is material, we will give
          reasonable notice — for example, in the product or by email. Continued use of the
          Service after changes take effect constitutes acceptance of the new Terms.
        </p>
      </LegalSection>

      <LegalSection title="10. Contact">
        <p>
          Questions about these Terms? Contact us at{" "}
          <a href="mailto:hello@tryrelay.run">hello@tryrelay.run</a>.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
