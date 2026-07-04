"use client";

import { useState } from "react";

export default function FAQ() {
  const [open, setOpen] = useState<number | null>(0);

  const faqs = [
    {
      q: "How does Zinch make money?",
      a: "We charge a flat 1.5% fee per completed deal, paid by the client on top of the deal amount. Workers receive the full agreed price. 20% of every fee funds a public insurance pool. No other revenue streams, ever.",
    },
    {
      q: "Is there a $ZINCH token?",
      a: "No. There will never be a Zinch platform token. If you see one trading anywhere, it's a scam. The protocol's value comes from real fee revenue, not speculation.",
    },
    {
      q: "What happens if there's a dispute?",
      a: "Either party can open a dispute, which freezes the escrow. Both parties then propose a resolution (release, refund, or split). When both agree, the protocol executes. There are no central arbitrators.",
    },
    {
      q: "What if the client disappears after I deliver?",
      a: "Every deal has an auto-release timer (default 72 hours). If the client doesn't approve, request revision, or open a dispute within that window, anyone can trigger automatic release of funds to the worker — including the worker themselves.",
    },
    {
      q: "Do I need a crypto wallet to use Zinch?",
      a: "No. You can sign in with Google, email, or Telegram. Zinch automatically creates a Solana wallet for you in the background (powered by Privy). Crypto-natives can connect Phantom, Solflare, or Backpack instead.",
    },
    {
      q: "Which tokens are supported?",
      a: "V1 supports USDC and SOL. V1.5 will add support for any SPL token on Solana — BONK, JUP, PYTH, and project-specific tokens.",
    },
    {
      q: "Is the smart contract audited?",
      a: "Pre-launch, the contract goes through informal community audit via Superteam. A formal third-party audit is planned for V2. Until then, deal amounts are capped at $500 during the soft launch period.",
    },
    {
      q: "How fast does Zinch settle?",
      a: "Solana settles in under 1 second. From the moment a client approves release, funds typically arrive in the worker's wallet within 2–5 seconds, including all blockchain confirmations.",
    },
    {
      q: "Can I cancel a deal?",
      a: "Yes — before funding, either party can cancel freely. After funding but before submission, the worker can request a refund. After submission, cancellation requires mutual agreement via the dispute flow.",
    },
    {
      q: "Is Zinch open source?",
      a: "The Anchor smart contract will be open source from V1. The web app source will be open-sourced gradually as the product matures. Transparency is core to a trust product.",
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
