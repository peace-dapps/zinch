import LegalLayout from "@/components/legal/LegalLayout";

export const metadata = {
  title: "Docs — Zinch",
};

export default function DocsPage() {
  return (
    <LegalLayout title="Protocol Docs" updated="July 15, 2026">
      <section>
        <h2 className="mb-3 mt-8 text-xl font-bold text-text">What Zinch Is</h2>
        <p>
          Zinch is an on-chain escrow protocol for crypto work agreements. Two
          parties — a worker and a client — lock SOL in a smart contract until
          the work is delivered. If the client approves, funds go to the worker
          minus a 1.5% platform fee. If the client ghosts, an auto-release
          timer pays the worker automatically. If they disagree, an on-chain
          dispute mechanism lets them negotiate a split.
        </p>
      </section>

      <section>
        <h2 className="mb-3 mt-8 text-xl font-bold text-text">Deal Lifecycle</h2>
        <p>Every Zinch deal moves through these states:</p>
        <ul className="mt-2 list-disc space-y-1 pl-6">
          <li><strong className="text-text">Created</strong> — the deal was proposed but not accepted yet</li>
          <li><strong className="text-text">Accepted</strong> — the counterparty accepted the terms</li>
          <li><strong className="text-text">Funded</strong> — the client locked SOL in the escrow PDA</li>
          <li><strong className="text-text">Submitted</strong> — the worker marked work as delivered; auto-release timer starts</li>
          <li><strong className="text-text">Completed</strong> — funds released to the worker, fee to platform</li>
          <li><strong className="text-text">Disputed</strong> — either party froze the deal; parties can propose splits</li>
          <li><strong className="text-text">Refunded</strong> — the worker returned funds to the client</li>
          <li><strong className="text-text">Cancelled</strong> — deal cancelled before funding</li>
        </ul>
      </section>

      <section>
        <h2 className="mb-3 mt-8 text-xl font-bold text-text">Smart Contract</h2>
        <p>
          Zinch&apos;s program is deployed on Solana devnet at:
        </p>
        <div className="mt-3 rounded border border-border bg-surface p-3 font-mono text-xs">
          3gm7tTj5meZP1tYjvE49zSzpjMmyywD5wqZ7jxPS7uDP
        </div>
        <p className="mt-4">
          Each deal is stored in a program-derived account (PDA) seeded with
          {" "}<code className="rounded bg-surface px-1.5 py-0.5 text-xs">[b&quot;deal&quot;, deal_id]</code>.
          The deal ID is a random 16-byte value generated on deal creation.
        </p>
      </section>

      <section>
        <h2 className="mb-3 mt-8 text-xl font-bold text-text">Instructions</h2>
        <ul className="mt-2 list-disc space-y-2 pl-6">
          <li><strong className="text-text">create_deal</strong> — creator (worker or client) creates the deal PDA on-chain</li>
          <li><strong className="text-text">accept_deal</strong> — counterparty accepts the deal</li>
          <li><strong className="text-text">fund_deal</strong> — client transfers SOL (amount + fee) into the deal PDA</li>
          <li><strong className="text-text">submit_work</strong> — worker marks the work as delivered</li>
          <li><strong className="text-text">approve_and_release</strong> — client releases funds to the worker</li>
          <li><strong className="text-text">auto_release</strong> — permissionless; releases funds to worker after timer expires</li>
          <li><strong className="text-text">refund_deal</strong> — worker returns funds to the client</li>
          <li><strong className="text-text">open_dispute</strong> — either party freezes the deal</li>
          <li><strong className="text-text">propose_resolution</strong> — either party proposes a split (worker_amount + client_amount = deal amount)</li>
          <li><strong className="text-text">accept_resolution</strong> — the other party accepts the split; funds split accordingly</li>
          <li><strong className="text-text">cancel_deal</strong> — cancels a deal before funding</li>
        </ul>
      </section>

      <section>
        <h2 className="mb-3 mt-8 text-xl font-bold text-text">Fees</h2>
        <p>
          Zinch charges 1.5% (150 basis points) on every deal. The fee is added
          to the amount at funding time (client pays it) and goes to the platform
          when funds are released, whether via approval, auto-release, refund,
          or dispute resolution.
        </p>
      </section>

      <section>
        <h2 className="mb-3 mt-8 text-xl font-bold text-text">Auto-Release Timer</h2>
        <p>
          Every deal has an auto-release window (minimum 30 minutes, maximum 30
          days), set by the creator. When the worker submits work, the timer
          starts. If the client hasn&apos;t approved, refunded, or disputed by the
          time it expires, anyone can call auto_release to pay the worker.
        </p>
      </section>

      <section>
        <h2 className="mb-3 mt-8 text-xl font-bold text-text">Disputes</h2>
        <p>
          Either party can call open_dispute during Funded or Submitted state.
          This freezes the deal — auto-release stops, no one can release or
          refund. Either party can then call propose_resolution with a split
          like 70% worker / 30% client. The other party either accepts (via
          accept_resolution, which executes the split) or proposes their own
          counter-split. There&apos;s no arbitrator; both parties must reach
          agreement or funds stay locked.
        </p>
      </section>

      <section>
        <h2 className="mb-3 mt-8 text-xl font-bold text-text">Custody</h2>
        <p>
          Funds in Zinch are held in on-chain PDAs, not in a custodial wallet.
          No admin can drain funds, freeze a deal, or override the smart contract
          logic. The rules encoded in the program are the only rules.
        </p>
      </section>

      <section>
        <h2 className="mb-3 mt-8 text-xl font-bold text-text">Source</h2>
        <p>
          Zinch&apos;s smart contract source code is publicly available for review
          at{" "}
          
          <a  href="https://github.com/peace-dapps/zinch"
            target="_blank"
            rel="noopener noreferrer"
            className="text-lime hover:underline"
          >
            github.com/peace-dapps/zinch
          </a>.
        </p>
      </section>
    </LegalLayout>
  );
}