import type { Metadata } from "next";
import { LegalPage, LegalSection } from "@/components/legal";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How Relay collects, uses, and protects your information.",
};

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy Policy" updated="July 23, 2026">
      <p>
        This Privacy Policy explains what information Relay collects, how we use it, and the
        choices you have. We keep it short on purpose — if anything is unclear, ask us.
      </p>

      <LegalSection title="1. What we collect">
        <ul>
          <li>
            <strong>Account information</strong> — your name, email address, and workspace
            details.
          </li>
          <li>
            <strong>Repository metadata</strong> — commit messages, authors, branch names, and
            similar metadata from repositories you connect. We do not need, and do not store,
            your full source code.
          </li>
          <li>
            <strong>Generated and published content</strong> — release notes, announcements,
            and images created in your workspace, including your edits.
          </li>
          <li>
            <strong>Subscriber emails</strong> — addresses of people who subscribe to your
            public changelog, held on your behalf.
          </li>
          <li>
            <strong>Usage data</strong> — basic logs and diagnostics that help us keep the
            Service reliable.
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="2. How we use it">
        <p>
          We use this information to operate the Service: detecting releases, generating
          drafts, hosting your public changelog, sending the emails you ask us to send, and
          improving reliability. We do not sell your personal information.
        </p>
      </LegalSection>

      <LegalSection title="3. AI processing">
        <p>
          To generate content, commit metadata and workspace context may be processed by
          third-party AI model providers acting on our behalf. We send only what is needed to
          produce your drafts, and we do not permit providers to use your data to train their
          models where the provider offers that control.
        </p>
      </LegalSection>

      <LegalSection title="4. Sharing">
        <p>
          We share information only with service providers that help us run Relay (hosting,
          databases, email delivery, AI generation), under agreements that limit their use of
          it; when required by law; or when you publish content — your public changelog is, by
          design, public.
        </p>
      </LegalSection>

      <LegalSection title="5. Retention and deletion">
        <p>
          We keep workspace data while your account is active. If you delete a release,
          repository, or your workspace, associated data is removed from production systems
          within a reasonable period, subject to routine backups.
        </p>
      </LegalSection>

      <LegalSection title="6. Security">
        <p>
          We use industry-standard measures — encryption in transit, scoped credentials, and
          least-privilege access — to protect your data. No system is perfectly secure; please
          use strong, unique credentials.
        </p>
      </LegalSection>

      <LegalSection title="7. Your rights">
        <p>
          You may access, correct, export, or delete your personal information at any time by
          contacting us. Depending on where you live, you may have additional rights under
          local law.
        </p>
      </LegalSection>

      <LegalSection title="8. Contact">
        <p>
          Privacy questions? Email <a href="mailto:hello@tryrelay.run">hello@tryrelay.run</a>.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
