import LegalLayout from "@/components/legal/LegalLayout";

export const metadata = {
  title: "Privacy Policy — Zinch",
};

export default function PrivacyPage() {
  return (
    <LegalLayout title="Privacy Policy" updated="July 15, 2026">
      <section>
        <h2 className="mb-3 mt-8 text-xl font-bold text-text">1. Overview</h2>
        <p>
          Zinch is a non-custodial protocol. We store the minimum data needed to
          make the service usable — nothing more. This policy explains what we
          collect, why, and what we do with it.
        </p>
      </section>

      <section>
        <h2 className="mb-3 mt-8 text-xl font-bold text-text">2. What We Collect</h2>

        <p className="font-medium text-text mt-4">Account data (via Privy):</p>
        <ul className="mt-2 list-disc space-y-1 pl-6">
          <li>Email address (from Google, email login, or Telegram)</li>
          <li>Wallet address (embedded or external)</li>
          <li>Telegram username, if you use Telegram login</li>
          <li>An anonymous Privy user ID</li>
        </ul>

        <p className="font-medium text-text mt-4">Deal metadata:</p>
        <ul className="mt-2 list-disc space-y-1 pl-6">
          <li>Deal title, description, amount, currency</li>
          <li>Wallet addresses of both parties</li>
          <li>Deal state and transaction signatures</li>
          <li>Timestamps of state changes</li>
        </ul>

        <p className="font-medium text-text mt-4">What we do NOT collect:</p>
        <ul className="mt-2 list-disc space-y-1 pl-6">
          <li>Government IDs or KYC documents</li>
          <li>Bank account or credit card details</li>
          <li>Wallet private keys (we can never see them)</li>
          <li>Precise location data</li>
          <li>Contact lists, camera, microphone data</li>
        </ul>
      </section>

      <section>
        <h2 className="mb-3 mt-8 text-xl font-bold text-text">3. How We Use It</h2>
        <ul className="mt-2 list-disc space-y-1 pl-6">
          <li>To let you sign in and identify you across sessions.</li>
          <li>To display your deals and history in your dashboard.</li>
          <li>To send you email notifications about deal state changes.</li>
          <li>To improve the product (aggregated, anonymous usage analytics).</li>
        </ul>
      </section>

      <section>
        <h2 className="mb-3 mt-8 text-xl font-bold text-text">4. On-Chain Data Is Public</h2>
        <p>
          Every action taken on Zinch — creating a deal, funding, submitting,
          releasing, disputing — creates a transaction on the Solana blockchain.
          These transactions are permanently public and cannot be deleted. Your
          wallet address, the deal amount, and the transaction outcome are
          visible to anyone. Zinch cannot make blockchain data private.
        </p>
      </section>

      <section>
        <h2 className="mb-3 mt-8 text-xl font-bold text-text">5. Third-Party Services</h2>
        <p>We use these services to run Zinch:</p>
        <ul className="mt-2 list-disc space-y-1 pl-6">
          <li><strong className="text-text">Privy</strong> — authentication and wallet management</li>
          <li><strong className="text-text">Supabase</strong> — off-chain data storage</li>
          <li><strong className="text-text">Solana</strong> — blockchain transactions</li>
          <li><strong className="text-text">Helius</strong> — Solana RPC provider</li>
          <li><strong className="text-text">Resend</strong> — email notifications</li>
          <li><strong className="text-text">Vercel</strong> — application hosting</li>
        </ul>
        <p className="mt-3">
          Each has its own privacy policy. We share only what&apos;s required for
          them to provide the service.
        </p>
      </section>

      <section>
        <h2 className="mb-3 mt-8 text-xl font-bold text-text">6. Data Retention</h2>
        <p>
          We keep your account and deal data as long as your account is active.
          If you want your off-chain data deleted, email us at{" "}
          <a href="mailto:privacy@zinch.app" className="text-lime hover:underline">
            privacy@zinch.app
          </a>. Note that on-chain data is permanent and cannot be deleted.
        </p>
      </section>

      <section>
        <h2 className="mb-3 mt-8 text-xl font-bold text-text">7. Your Rights</h2>
        <p>You can:</p>
        <ul className="mt-2 list-disc space-y-1 pl-6">
          <li>Access your data by logging into your account</li>
          <li>Request deletion of your off-chain data</li>
          <li>Opt out of email notifications from your settings</li>
          <li>Disconnect wallets from your account</li>
        </ul>
      </section>

      <section>
        <h2 className="mb-3 mt-8 text-xl font-bold text-text">8. Security</h2>
        <p>
          We use industry-standard security practices including encrypted
          connections (TLS), encrypted storage, and access controls. Nothing on
          the internet is 100% secure, but we take reasonable steps to protect
          your data.
        </p>
      </section>

      <section>
        <h2 className="mb-3 mt-8 text-xl font-bold text-text">9. Children</h2>
        <p>
          Zinch is not for anyone under 18. We don&apos;t knowingly collect data from
          minors.
        </p>
      </section>

      <section>
        <h2 className="mb-3 mt-8 text-xl font-bold text-text">10. Contact</h2>
        <p>
          Questions about this policy? Email{" "}
          <a href="mailto:privacy@zinch.app" className="text-lime hover:underline">
            privacy@zinch.app
          </a>.
        </p>
      </section>
    </LegalLayout>
  );
}