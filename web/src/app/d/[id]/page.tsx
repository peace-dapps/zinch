"use client";

import { useEffect, useState } from "react";
import { use } from "react";
import { usePrivy } from "@privy-io/react-auth";
import Nav from "@/components/landing/Nav";

type Deal = {
  deal_id: string;
  title: string;
  description: string | null;
  amount_display: string;
  amount_lamports: number;
  currency: string;
  kind: string;
  worker_wallet: string;
  client_wallet: string;
  creator_wallet: string;
  counterparty_wallet: string;
  state: string;
  auto_release_seconds: number;
  acceptance_deadline: string;
  created_at: string;
  create_tx_signature: string | null;
};

export default function DealPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { user, authenticated, login } = usePrivy();
  const [deal, setDeal] = useState<Deal | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const currentUserWallet =
    (user?.linkedAccounts?.find(
      (a: any) => a.type === "wallet" && a.chainType === "solana"
    ) as any)?.address || null;

  useEffect(() => {
    const fetchDeal = async () => {
      try {
        const res = await fetch(`/api/deal/${id}`);
        if (!res.ok) {
          setError("Deal not found");
          setLoading(false);
          return;
        }
        const data = await res.json();
        setDeal(data.deal);
      } catch (err) {
        setError("Failed to load deal");
      } finally {
        setLoading(false);
      }
    };
    fetchDeal();
  }, [id]);

  const updateState = async (newState: string) => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/deal/${id}/state`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          newState,
          actorWallet: currentUserWallet,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        alert(err.error || "Action failed");
      } else {
        const data = await res.json();
        setDeal(data.deal);
      }
    } catch (err) {
      alert("Something went wrong");
    } finally {
      setActionLoading(false);
    }
  };

  const copyLink = () => {
    const link = `${window.location.origin}/d/${id}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <div className="text-text-muted text-sm tracking-wider uppercase">
          Loading deal...
        </div>
      </main>
    );
  }

  if (error || !deal) {
    return (
      <main className="relative min-h-screen">
        <Nav />
        <div className="mx-auto max-w-2xl px-6 py-32 text-center md:px-8">
          <div className="mb-4 text-xs uppercase tracking-widest text-red-400">
            // NOT FOUND
          </div>
          <h1 className="mb-4 text-4xl font-bold tracking-tight sm:text-5xl">
            Deal not found.
          </h1>
          <p className="text-text-muted">
            This deal link may be invalid or the deal may have been removed.
          </p>
        </div>
      </main>
    );
  }

  const isWorker = currentUserWallet === deal.worker_wallet;
  const isClient = currentUserWallet === deal.client_wallet;
  const isParty = isWorker || isClient;

  const stateLabels: Record<string, { label: string; color: string }> = {
    created: { label: "AWAITING ACCEPTANCE", color: "text-lime" },
    accepted: { label: "AWAITING FUNDING", color: "text-lime" },
    funded: { label: "IN PROGRESS", color: "text-lime" },
    submitted: { label: "AWAITING APPROVAL", color: "text-lime" },
    completed: { label: "COMPLETED", color: "text-lime" },
    refunded: { label: "REFUNDED", color: "text-text-muted" },
    cancelled: { label: "CANCELLED", color: "text-text-muted" },
    disputed: { label: "DISPUTED", color: "text-red-400" },
    expired: { label: "EXPIRED", color: "text-text-muted" },
  };

  const stateInfo = stateLabels[deal.state] || stateLabels.created;

  const feeAmount = Math.floor(
    (deal.amount_lamports * 150) / 10_000
  );
  const totalLock = deal.amount_lamports + feeAmount;

  return (
    <main className="relative min-h-screen">
      <Nav />

      <div className="mx-auto max-w-2xl px-6 pb-24 pt-32 md:px-8 md:pt-40">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div className="text-xs tracking-wider text-text-faded">
            DEAL #{id.slice(0, 8).toUpperCase()}
          </div>
          <div
            className={`inline-flex items-center gap-1.5 border border-lime/30 bg-lime/10 px-2.5 py-1 text-xs uppercase tracking-wider ${stateInfo.color}`}
          >
            <span className="h-1 w-1 rounded-full bg-lime" />
            {stateInfo.label}
          </div>
        </div>

        {/* Title + amount */}
        <div className="mb-8 border border-border bg-surface p-8 md:p-10">
          <div className="mb-1 text-sm text-text-faded">
            From{" "}
            <span className="font-mono text-text">
              {deal.creator_wallet.slice(0, 4)}...
              {deal.creator_wallet.slice(-4)}
            </span>
          </div>
          <h1 className="mb-7 text-2xl font-medium leading-tight tracking-tight md:text-3xl">
            {deal.title}
          </h1>

          {deal.description && (
            <p className="mb-7 text-sm leading-relaxed text-text-muted">
              {deal.description}
            </p>
          )}

          <div className="mb-7 flex items-baseline gap-3">
            <div className="text-6xl font-bold leading-none tracking-tight text-lime tabular-nums">
              {(deal.amount_lamports / 1e9).toFixed(4)}
            </div>
            <div className="text-sm tracking-wide text-text-muted">
              {deal.currency}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 border-y border-border py-5">
            <div>
              <div className="mb-1.5 text-xs uppercase tracking-wider text-text-faded">
                Deadline
              </div>
              <div className="text-sm font-medium text-text">
                {new Date(deal.acceptance_deadline).toLocaleDateString()}
              </div>
            </div>
            <div>
              <div className="mb-1.5 text-xs uppercase tracking-wider text-text-faded">
                Auto-release
              </div>
              <div className="text-sm font-medium text-text">
                {Math.floor(deal.auto_release_seconds / 3600)} hours
              </div>
            </div>
            <div>
              <div className="mb-1.5 text-xs uppercase tracking-wider text-text-faded">
                Platform fee
              </div>
              <div className="text-sm font-medium text-text">
                {(feeAmount / 1e9).toFixed(4)} SOL
              </div>
            </div>
            <div>
              <div className="mb-1.5 text-xs uppercase tracking-wider text-text-faded">
                Total to lock
              </div>
              <div className="text-sm font-medium text-text">
                {(totalLock / 1e9).toFixed(4)} SOL
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        {!authenticated && (
          <div className="mb-6 border border-border p-6 text-center">
            <p className="mb-4 text-sm text-text-muted">
              Sign in to accept or interact with this deal.
            </p>
            <button
              onClick={login}
              className="bg-lime px-6 py-3 text-sm font-medium tracking-tight text-bg transition-all hover:opacity-90"
            >
              Sign in
            </button>
          </div>
        )}

        {authenticated && !isParty && deal.state === "created" && (
          <div className="mb-6 border border-border p-6 text-center">
            <p className="text-sm text-text-muted">
              You are not the counterparty for this deal. Only{" "}
              <span className="font-mono text-text">
                {deal.counterparty_wallet.slice(0, 4)}...
                {deal.counterparty_wallet.slice(-4)}
              </span>{" "}
              can accept it.
            </p>
          </div>
        )}

        {authenticated && isParty && deal.state === "created" && (
          <div className="mb-6">
            <button
              onClick={() => updateState("accepted")}
              disabled={actionLoading}
              className="mb-2 w-full bg-lime py-4 text-sm font-medium text-bg transition-all hover:opacity-90 disabled:opacity-50"
            >
              {actionLoading ? "Processing..." : "Accept this deal"}
            </button>
            <button
              onClick={() => updateState("cancelled")}
              disabled={actionLoading}
              className="w-full border border-border py-3.5 text-sm font-medium text-text-muted transition-all hover:border-border-hover hover:text-text disabled:opacity-50"
            >
              Reject
            </button>
          </div>
        )}

        {authenticated && isClient && deal.state === "accepted" && (
          <div className="mb-6">
            <button
              onClick={() => updateState("funded")}
              disabled={actionLoading}
              className="w-full bg-lime py-4 text-sm font-medium text-bg transition-all hover:opacity-90 disabled:opacity-50"
            >
              {actionLoading ? "Processing..." : `Fund deal (${(totalLock / 1e9).toFixed(4)} SOL)`}
            </button>
            <p className="mt-3 text-center text-xs text-text-faded">
              On-chain funding coming soon. Marks state as funded for now.
            </p>
          </div>
        )}

        {authenticated && isWorker && deal.state === "funded" && (
          <div className="mb-6">
            <button
              onClick={() => updateState("submitted")}
              disabled={actionLoading}
              className="w-full bg-lime py-4 text-sm font-medium text-bg transition-all hover:opacity-90 disabled:opacity-50"
            >
              {actionLoading ? "Processing..." : "Submit work as delivered"}
            </button>
          </div>
        )}

        {authenticated && isClient && deal.state === "submitted" && (
          <div className="mb-6">
            <button
              onClick={() => updateState("completed")}
              disabled={actionLoading}
              className="mb-2 w-full bg-lime py-4 text-sm font-medium text-bg transition-all hover:opacity-90 disabled:opacity-50"
            >
              {actionLoading ? "Processing..." : "Approve & release funds"}
            </button>
            <button
              onClick={() => updateState("disputed")}
              disabled={actionLoading}
              className="w-full border border-border py-3.5 text-sm font-medium text-text-muted transition-all hover:border-border-hover hover:text-text disabled:opacity-50"
            >
              Open dispute
            </button>
          </div>
        )}

        {/* Share link */}
        <div className="mb-6 border border-border bg-surface p-6">
          <div className="mb-3 text-xs uppercase tracking-widest text-text-faded">
            Shareable link
          </div>
          <div className="flex items-center gap-3">
            <div className="flex-1 break-all font-mono text-xs text-text">
              {typeof window !== "undefined" ? window.location.origin : ""}/d/
              {id}
            </div>
            <button
              onClick={copyLink}
              className="border border-border px-4 py-2 text-xs font-medium text-text transition-all hover:border-border-hover"
            >
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
        </div>

        {/* Parties */}
        <div className="border border-border bg-surface p-6">
          <div className="mb-4 text-xs uppercase tracking-widest text-text-faded">
            Parties
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <div className="mb-1 text-xs text-text-faded">Worker</div>
              <div className="font-mono text-xs text-text break-all">
                {deal.worker_wallet}
              </div>
            </div>
            <div>
              <div className="mb-1 text-xs text-text-faded">Client</div>
              <div className="font-mono text-xs text-text break-all">
                {deal.client_wallet}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center text-xs text-text-faded">
          POWERED BY ZINCH · ON SOLANA DEVNET
        </div>
      </div>
    </main>
  );
}