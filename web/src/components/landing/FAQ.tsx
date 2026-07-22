"use client";

import { useState } from "react";

export default function FAQ() {
  const [open, setOpen] = useState<number | null>(0);

  const faqs = [
    {
      q: "How does Zinch make money?",
      a: "We charge a flat 1.5% fee per completed deal, paid by the client on top of the deal amount. Workers receive the full agreed price. No hidden fees, no subscriptions, no token.",
    },
    {
      q: "Is there a $ZINCH token?",
      a: "No. There will never be a Zinch platform token. If you see one trading anywhere, it's a scam. The protocol's value comes from real fee revenue, not speculation.",
    },
    {
      q: "What happens if there's a dispute?",
      a: "Either party can open a dispute, which freezes the escrow. Both parties then propose a resolution — full release, full refund, or a custom split. When both agree, the protocol executes on-chain. There are no central arbitrators.",
    },
    {
      q: "What if the client disappears after I deliver?",
      a: "Every deal has an auto-release timer set at creation (minimum 30 minutes, up to 30 days). If the client doesn't approve, request revision, or open a dispute within that window, anyone can trigger automatic release of funds to the worker — including the worker themselves.",
    },
    {
      q: "Do I need a crypto wallet to use Zinch?",
      a: "No. You can sign in with Google, email, or Telegram. Zinch automatically creates a Solana wallet for you in the background (powered by Privy). Crypto-natives can connect Phantom, Solflare, or Backpack instead.",
    },
    {
      q: "Which tokens are supported?",
      a: "V1 supports SOL. USDC support is coming in V2, along with additional SPL tokens on Solana.",
    },
    {
      q: "Is the smart contract audited?",
      a: "The contract source is publicly available on GitHub for community review. A formal third-party audit is planned before mainnet launch. During the devnet phase, no real funds are at risk.",
    },
    {
      q: "How fast does Zinch settle?",
      a: "Solana settles in under 1 second. From the moment a client approves release, funds typically arrive in the worker's wallet within 2–5 seconds, including all blockchain confirmations.",
    },
    {
      q: "Can I cancel a deal?",
      a: "Yes — before funding, either party can cancel on-chain. After funding but before submission, the worker can refund the client. After submission, resolution requires mutual agreement via the dispute flow.",
    },
    {
      q: "Is Zinch open source?",
      a: "The Anchor smart contract is open source on GitHub. The web app source will be open-sourced gradually as the product matures. Transparency is core to a trust product.",
    },
    {
      q: "What happens to the platform fee during a dispute?",
      a: "The 1.5% fee is always collected regardless of outcome — whether funds are released to the worker, refunded to the client, or split between both. The fee was locked at funding time and goes to the platform when the deal resolves.",
    },
    {
      q: "Can I use Zinch for non-work escrow?",
      a: "Zinch is designed for work agreements — one party delivers, the other pays. You could technically use it for any two-party transaction where one side needs to trust the other, but the UX is optimized for freelance and contract work.",
    },
    {
      q: "What if I lose access to my wallet?",
      a: "If you signed in with Google, email, or Telegram, Privy manages your wallet recovery. If you connected an external wallet like Phantom, recovery depends on whether you backed up your seed phrase. Zinch cannot recover lost external wallets — funds in active deals would remain locked until the auto-release timer fires or a dispute resolves.",
    },
  ];

  return (
    <section
      id="faq"
      className="mx-auto max-w-4xl px-6 py-24 md:px-8 md:py-32"
    >
      <div className="mb-4 text-xs uppercase tracking-widest text-lime">
        // FAQ
      </div>
      <h2 className="mb-5 text-4xl font-bold leading-tight tracking-tight sm:text-5xl md:text-6xl">
        Questions, answered.
      </h2>
      <p className="mb-16 max-w-xl text-base text-text-muted md:text-lg">
        Everything you might want to know before sending or accepting your
        first Zinch deal.
      </p>

      <div className="border-t border-border">
        {faqs.map((faq, i) => (
          <div key={i} className="border-b border-border">
            <button
              onClick={() => setOpen(open === i ? null : i)}
              className="flex w-full items-start justify-between gap-6 py-6 text-left transition-colors hover:text-text"
            >
              <span className="text-base font-medium tracking-tight text-text md:text-lg">
                {faq.q}
              </span>
              <span
                className={`mt-1 flex h-5 w-5 flex-shrink-0 items-center justify-center text-lime transition-transform duration-300 ${
                  open === i ? "rotate-45" : ""
                }`}
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M12 5v14M5 12h14" />
                </svg>
              </span>
            </button>
            {open === i && (
              <div className="pb-6 pr-8">
                <p className="text-sm leading-relaxed text-text-muted md:text-base">
                  {faq.a}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
