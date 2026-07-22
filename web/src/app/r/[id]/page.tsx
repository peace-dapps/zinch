"use client";

import { useEffect, useState } from "react";
import { use } from "react";
import Link from "next/link";
import Nav from "@/components/landing/Nav";
import { PageLoader } from "@/components/ui/Spinner";

type Deal = {
  deal_id: string;
  title: string;
  description: string | null;
  amount_lamports: number;
  currency: string;
  kind: string;
  worker_wallet: string;
  client_wallet: string;
  state: string;
  created_at: string;
  completed_at: string | null;
  release_tx_signature: string | null;
  resolution_tx_signature: string | null;
  fund_tx_signature: string | null;
  create_tx_signature: string | null;
};

export default function ReceiptPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [deal, setDeal] = useState<Deal | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`/api/deal/${id}`);
        if (!res.ok) {
          setLoading(false);
          return;
        }
        const data = await res.json();
        setDeal(data.deal);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) {
    return (
      <main className="relative min-h-screen">
        <Nav />
        <div className="mx-auto max-w-2xl px-6 pb-24 pt-32 md:px-8 md:pt-40">
          <PageLoader label="Loading receipt" />
        </div>
      </main>
    );
  }

  if (!deal) {
    return (
      <main className="relative min-h-screen">
        <Nav />
        <div className="mx-auto max-w-2xl px-6 py-32 text-center md:px-8">
          <div className="mb-4 text-xs uppercase tracking-widest text-red-400">
            // NOT FOUND
          </div>
          <h1 className="mb-4 text-4xl font-bold tracking-tight">
            Receipt not found.
          </h1>
          <p className="mb-6 text-text-muted">
            This deal may not exist or may still be in progress.
          </p>
          <Link href="/" className="text-sm text-lime hover:underline">
            ← Back to Zinch
          </Link>
        </div>
      </main>
    );
  }

  // Receipt only valid for closed states
  const CLOSED_STATES = ["completed", "refunded", "cancelled"];
  if (!CLOSED_STATES.includes(deal.state)) {
    return (
      <main className="relative min-h-screen">
        <Nav />
        <div className="mx-auto max-w-2xl px-6 py-32 text-center md:px-8">
          <div className="mb-4 text-xs uppercase tracking-widest text-lime">
            // IN PROGRESS
          </div>
          <h1 className="mb-4 text-4xl font-bold tracking-tight">
            This deal is still in progress.
          </h1>
          <p className="mb-6 text-text-muted">
            A receipt is generated once the deal completes, refunds, or
            cancels.
          </p>
          <Link
            href={`/d/${deal.deal_id}`}
            className="text-sm text-lime hover:underline"
          >
            View live deal →
          </Link>
        </div>
      </main>
    );
  }

  const outcomeLabels: Record<string, { prefix: string; label: string; description: string; color: string }> = {
    completed: {
      prefix: "[✓]",
      label: "COMPLETED",
      description: "Funds released to worker",
      color: "text-lime",
    },
    refunded: {
      prefix: "[↩]",
      label: "REFUNDED",
      description: "Funds returned to client",
      color: "text-text-muted",
    },
    cancelled: {
      prefix: "[×]",
      label: "CANCELLED",
      description: "Deal cancelled before funding",
      color: "text-text-muted",
    },
  };

  const outcome = outcomeLabels[deal.state];
  const finalTx =
    deal.resolution_tx_signature ||
    deal.release_tx_signature ||
    deal.fund_tx_signature ||
    deal.create_tx_signature;

  const completedDate = deal.completed_at || deal.created_at;

  return (
    <main className="relative min-h-screen">
      <Nav />

      <div className="mx-auto max-w-2xl px-6 pb-24 pt-32 md:px-8 md:pt-40">
        {/* Header */}
        <div className="mb-10 text-center">
          <div className="mb-4 text-xs uppercase tracking-widest text-text-faded">
            // ZINCH RECEIPT
          </div>
          <div className={`mb-3 flex items-baseline justify-center gap-2 font-mono text-xs uppercase tracking-widest ${outcome.color}`}>
            <span>{outcome.prefix}</span>
            <span>{outcome.label}</span>
          </div>
          <h1 className="mb-2 text-3xl font-bold tracking-tight md:text-4xl">
            {deal.title}
          </h1>
          <p className="text-sm text-text-muted">{outcome.description}</p>
        </div>

        {/* Amount */}
        <div className="mb-8 border border-border bg-surface p-8 text-center">
          <div className="mb-2 text-xs uppercase tracking-widest text-text-faded">
            Deal amount
          </div>
          <div className="flex items-baseline justify-center gap-3">
            <div className="text-6xl font-bold tracking-tight tabular-nums text-lime md:text-7xl">
              {(deal.amount_lamports / 1e9).toFixed(4)}
            </div>
            <div className="text-sm tracking-wide text-text-muted">
              {deal.currency}
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="mb-8 border border-border bg-surface p-6 md:p-8">
          <div className="mb-6 text-xs uppercase tracking-widest text-text-faded">
            Timeline
          </div>
          <div className="space-y-4">
            <TimelineItem
              label="Deal created"
              date={deal.created_at}
              tx={deal.create_tx_signature}
            />
            {deal.fund_tx_signature && (
              <TimelineItem
                label="Escrow funded"
                tx={deal.fund_tx_signature}
              />
            )}
            {deal.release_tx_signature && (
              <TimelineItem
                label="Funds released to worker"
                date={deal.completed_at}
                tx={deal.release_tx_signature}
              />
            )}
            {deal.resolution_tx_signature && (
              <TimelineItem
                label="Dispute resolved"
                date={deal.completed_at}
                tx={deal.resolution_tx_signature}
              />
            )}
          </div>
        </div>

        {/* Parties */}
        <div className="mb-8 border border-border bg-surface p-6 md:p-8">
          <div className="mb-6 text-xs uppercase tracking-widest text-text-faded">
            Parties
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <div className="mb-1 text-xs text-text-faded">Worker</div>
              <div className="break-all font-mono text-xs text-text">
                {deal.worker_wallet}
              </div>
            </div>
            <div>
              <div className="mb-1 text-xs text-text-faded">Client</div>
              <div className="break-all font-mono text-xs text-text">
                {deal.client_wallet}
              </div>
            </div>
          </div>
        </div>

        {/* Verification */}
        <div className="mb-10 border border-border bg-surface p-6 md:p-8">
          <div className="mb-4 text-xs uppercase tracking-widest text-text-faded">
            Verify on-chain
          </div>
          <p className="mb-5 text-sm text-text-muted">
            Every transaction in this deal is recorded on Solana devnet. You
            can verify each step independently on Solana Explorer.
          </p>
          {finalTx && (
            
           <a   href={`https://explorer.solana.com/tx/${finalTx}?cluster=devnet`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 border border-lime bg-lime/10 px-5 py-3 text-sm font-medium text-lime transition-all hover:bg-lime/20"
            >
              View final transaction on Solana Explorer ↗
            </a>
          )}
        </div>

        {/* Share */}
        {deal.state === "completed" && (
          <div className="mb-10 border border-border bg-surface p-6 md:p-8">
            <div className="mb-4 text-xs uppercase tracking-widest text-text-faded">
              // SHARE THIS RECEIPT
            </div>
            <p className="mb-5 text-sm text-text-muted">
              Show the world you closed a real deal on-chain. One click.
            </p>
            <ShareButtons
              amount={(deal.amount_lamports / 1e9).toFixed(4)}
              currency={deal.currency}
              title={deal.title}
              dealId={deal.deal_id}
            />
          </div>
        )}

        {/* Meta */}
        <div className="border-t border-border pt-6 text-center">
          <div className="mb-2 text-xs text-text-faded">
            Receipt #{deal.deal_id.slice(0, 8).toUpperCase()} ·{" "}
            {new Date(completedDate).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </div>
          <Link href="/" className="text-xs uppercase tracking-widest text-lime hover:underline">
            POWERED BY ZINCH · ON SOLANA
          </Link>
        </div>
      </div>
    </main>
  );
}

function TimelineItem({
  label,
  date,
  tx,
}: {
  label: string;
  date?: string | null;
  tx?: string | null;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-lime" />
      <div className="flex-1 min-w-0">
        <div className="text-sm text-text">{label}</div>
        <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-text-faded">
          {date && (
            <span>
              {new Date(date).toLocaleString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
                hour: "numeric",
                minute: "2-digit",
              })}
            </span>
          )}
          {tx && (
          <>
            {date && <span>·</span>}
            
            <a  href={`https://explorer.solana.com/tx/${tx}?cluster=devnet`}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-lime hover:underline"
            >
              {tx.slice(0, 8)}...{tx.slice(-6)} ↗
            </a>
          </>
        )}
        </div>
      </div>
    </div>
  );
}

function ShareButtons({
  amount,
  currency,
  title,
  dealId,
}: {
  amount: string;
  currency: string;
  title: string;
  dealId: string;
}) {
  const receiptUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/r/${dealId}`
      : `https://zinch.app/r/${dealId}`;

  const tweetText = `Just closed a deal on @zinch_app — ${amount} ${currency} released through on-chain escrow on Solana.

Zero platform disputes. Zero risk.

Receipt:`;

  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
    tweetText
  )}&url=${encodeURIComponent(receiptUrl)}`;

  const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(
    receiptUrl
  )}&text=${encodeURIComponent(
    `Closed a ${amount} ${currency} deal on Zinch — on-chain proof:`
  )}`;

  const copyLink = () => {
    if (typeof navigator === "undefined") return;
    navigator.clipboard.writeText(receiptUrl);
  };

  return (
    <div className="flex flex-wrap gap-2">
      
      <a
        href={twitterUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 border border-lime bg-lime/10 px-5 py-3 text-sm font-medium text-lime transition-all hover:bg-lime/20"
      >
        Share on X ↗
      </a>
      
      <a  href={telegramUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 border border-border px-5 py-3 text-sm font-medium text-text transition-all hover:border-border-hover"
      >
        Share on Telegram ↗
      </a>
      <button
        onClick={copyLink}
        className="inline-flex items-center gap-2 border border-border px-5 py-3 text-sm font-medium text-text-muted transition-all hover:border-border-hover hover:text-text"
      >
        Copy link
      </button>
    </div>
  );
}