import LegalLayout from "@/components/legal/LegalLayout";

export const metadata = {
  title: "Terms of Service — Zinch",
};

export default function TermsPage() {
  return (
    <LegalLayout title="Terms of Service" updated="July 15, 2026">
      <section>
        <h2 className="mb-3 mt-8 text-xl font-bold text-text">1. Acceptance of Terms</h2>
        <p>
          By using Zinch (&quot;the Service&quot;), you agree to these Terms of Service.
          If you don&apos;t agree, please don&apos;t use the Service. These terms may
          change; continued use after changes means you accept the new terms.
        </p>
      </section>

      <section>
        <h2 className="mb-3 mt-8 text-xl font-bold text-text">2. What Zinch Is</h2>
        <p>
          Zinch is a non-custodial escrow protocol on the Solana blockchain. It
          lets two parties (a &quot;worker&quot; and &quot;client&quot;) lock crypto in a smart
          contract until a work agreement is completed. Zinch does not custody
          your funds — they sit in an on-chain program-derived account.
        </p>
      </section>

      <section>
        <h2 className="mb-3 mt-8 text-xl font-bold text-text">3. Fees</h2>
        <p>
          Zinch charges a flat 1.5% platform fee on the deal amount. The fee is
          paid by the client at funding time and goes to Zinch when funds are
          released to the worker, refunded, or split via dispute resolution.
        </p>
      </section>

      <section>
        <h2 className="mb-3 mt-8 text-xl font-bold text-text">4. Your Responsibilities</h2>
        <p>You agree to:</p>
        <ul className="mt-2 list-disc space-y-1 pl-6">
          <li>Only use Zinch for lawful purposes and legal work agreements.</li>
          <li>Not use Zinch for money laundering, fraud, illegal services, or any prohibited activity.</li>
          <li>Verify the identity and intentions of the party you&apos;re transacting with — Zinch does not vet users.</li>
          <li>Understand that blockchain transactions are irreversible.</li>
          <li>Keep your wallet credentials secure. Zinch cannot recover lost keys.</li>
        </ul>
      </section>

      <section>
        <h2 className="mb-3 mt-8 text-xl font-bold text-text">5. Disputes</h2>
        <p>
          Zinch provides an on-chain dispute mechanism where both parties can
          propose a split of escrowed funds. Zinch does not act as arbitrator or
          judge. If both parties can&apos;t agree, funds may remain locked in escrow
          indefinitely unless the auto-release timer fires. Zinch cannot force a
          resolution.
        </p>
      </section>

      <section>
        <h2 className="mb-3 mt-8 text-xl font-bold text-text">6. Auto-Release</h2>
        <p>
          When a worker submits work, an auto-release timer starts (typically 30
          minutes to 30 days, set at deal creation). If the client doesn&apos;t
          approve or dispute within the timer, funds automatically release to
          the worker. This is a permissionless smart contract feature — anyone
          can trigger the release after the timer expires.
        </p>
      </section>

      <section>
        <h2 className="mb-3 mt-8 text-xl font-bold text-text">7. No Warranty</h2>
        <p>
          Zinch is provided &quot;as is&quot; and &quot;as available&quot; without warranty of any
          kind. The protocol is experimental software running on a public
          blockchain. Bugs, exploits, or network conditions may result in loss
          of funds. Use at your own risk.
        </p>
      </section>

      <section>
        <h2 className="mb-3 mt-8 text-xl font-bold text-text">8. Limitation of Liability</h2>
        <p>
          To the maximum extent permitted by law, Zinch and its creator(s) are
          not liable for any indirect, incidental, special, consequential, or
          punitive damages, or any loss of profits, funds, data, or other
          intangible losses resulting from your use of the Service.
        </p>
      </section>

      <section>
        <h2 className="mb-3 mt-8 text-xl font-bold text-text">9. Prohibited Uses</h2>
        <p>You may not use Zinch to:</p>
        <ul className="mt-2 list-disc space-y-1 pl-6">
          <li>Launder money or evade sanctions.</li>
          <li>Facilitate illegal goods, services, or activity of any kind.</li>
          <li>Circumvent applicable laws in your jurisdiction.</li>
          <li>Impersonate others or misrepresent your identity in a deal.</li>
        </ul>
      </section>

      <section>
        <h2 className="mb-3 mt-8 text-xl font-bold text-text">10. Changes</h2>
        <p>
          We may update these terms. When we do, we&apos;ll change the &quot;Last
          updated&quot; date at the top. Continued use of Zinch after changes means
          you accept them.
        </p>
      </section>

      <section>
        <h2 className="mb-3 mt-8 text-xl font-bold text-text">11. Governing Law</h2>
        <p>
          These terms are governed by the laws of the Federal Republic of
          Nigeria, without regard to conflict of law principles. Disputes will
          be resolved in the courts of Lagos, Nigeria.
        </p>
      </section>
    </LegalLayout>
  );
}