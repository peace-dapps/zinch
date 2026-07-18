"use client";

import { useEffect, useState } from "react";
import { use } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { PublicKey, Transaction } from "@solana/web3.js";
import Nav from "@/components/landing/Nav";
import Link from "next/link";
import { PageLoader, ButtonSpinner } from "@/components/ui/Spinner";
import { useToast } from "@/components/ui/Toast";
import {
  buildAcceptDealInstruction,
  buildFundDealInstruction,
  buildSubmitWorkInstruction,
  buildApproveAndReleaseInstruction,
  buildRefundDealInstruction,
  buildOpenDisputeInstruction,
  buildProposeResolutionInstruction,
  buildAcceptResolutionInstruction,
  getConnection,
  getDealPDAFromHex,
  FEE_RECIPIENT,
} from "@/lib/anchor";

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
  submitted_at: string | null;
  create_tx_signature: string | null;
  proposed_worker_amount: number | null;
  proposed_client_amount: number | null;
  proposed_by: string | null;
};

function humanizeError(raw: string, fallback: string): string {
  if (!raw) return fallback;
  if (raw.includes("AccountDidNotDeserialize"))
    return "This deal was created before a smart contract upgrade and can no longer be used. Please create a new deal.";
  if (raw.includes("InvalidState"))
    return "This action isn't allowed at this stage of the deal.";
  if (raw.includes("UnauthorizedSigner"))
    return "You're not authorized to perform this action on this deal.";
  if (raw.includes("DealExpired"))
    return "This deal's acceptance deadline has passed.";
  if (raw.includes("AutoReleaseNotReady"))
    return "The auto-release timer hasn't expired yet.";
  if (raw.includes("InvalidSplit"))
    return "The proposed split doesn't add up to the deal amount.";
  if (raw.includes("InvalidAutoReleaseWindow"))
    return "Auto-release must be between 30 minutes and 30 days.";
  if (raw.includes("InvalidAmount"))
    return "Deal amount must be greater than 0.";
  if (raw.includes("InvalidDeadline"))
    return "The acceptance deadline must be in the future.";
  if (
    raw.includes("User rejected") ||
    raw.includes("rejected the request") ||
    raw.includes("Approval Denied")
  )
    return "You cancelled the transaction.";
  if (
    raw.includes("insufficient funds") ||
    raw.includes("insufficient lamports")
  )
    return "Your wallet doesn't have enough SOL for this transaction.";
  if (raw.length > 200) return fallback;
  return raw;
}

export default function DealPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { authenticated, login } = usePrivy();
  const { publicKey, sendTransaction, connected } = useWallet();
  const { showToast } = useToast();
  const [deal, setDeal] = useState<Deal | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const [showProposeUI, setShowProposeUI] = useState(false);
  const [workerPercent, setWorkerPercent] = useState(50);
  const [now, setNow] = useState(Date.now());

  const currentUserWallet = publicKey?.toBase58() || null;

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

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const executeAction = async (
    action:
      | "accept"
      | "fund"
      | "submit"
      | "approve"
      | "refund"
      | "cancel"
      | "dispute"
      | "acceptResolution"
  ) => {
    if (!deal) return;
    if (!connected || !publicKey) {
      showToast("Please connect your Phantom wallet first.", "error");
      return;
    }

    setActionLoading(true);

    try {
      const connection = getConnection();
      const [dealPDA] = getDealPDAFromHex(deal.deal_id);
      const { blockhash } = await connection.getLatestBlockhash();

      const transaction = new Transaction({
        recentBlockhash: blockhash,
        feePayer: publicKey,
      });

      let newState = "";
      let txSignature = "";

      if (action === "accept") {
        transaction.add(
          await buildAcceptDealInstruction({ signerPubkey: publicKey, dealPDA })
        );
        newState = "accepted";
      } else if (action === "fund") {
        transaction.add(
          await buildFundDealInstruction({ clientPubkey: publicKey, dealPDA })
        );
        newState = "funded";
      } else if (action === "submit") {
        transaction.add(
          await buildSubmitWorkInstruction({ workerPubkey: publicKey, dealPDA })
        );
        newState = "submitted";
      } else if (action === "approve") {
        transaction.add(
          await buildApproveAndReleaseInstruction({
            clientPubkey: publicKey,
            dealPDA,
            workerPubkey: new PublicKey(deal.worker_wallet),
            feeRecipient: FEE_RECIPIENT,
          })
        );
        newState = "completed";
      } else if (action === "refund") {
        transaction.add(
          await buildRefundDealInstruction({
            workerPubkey: publicKey,
            dealPDA,
            clientPubkey: new PublicKey(deal.client_wallet),
          })
        );
        newState = "refunded";
      } else if (action === "cancel") {
        newState = "cancelled";
      } else if (action === "dispute") {
        transaction.add(
          await buildOpenDisputeInstruction({
            signerPubkey: publicKey,
            dealPDA,
          })
        );
        newState = "disputed";
      } else if (action === "acceptResolution") {
        transaction.add(
          await buildAcceptResolutionInstruction({
            signerPubkey: publicKey,
            dealPDA,
            workerPubkey: new PublicKey(deal.worker_wallet),
            clientPubkey: new PublicKey(deal.client_wallet),
            feeRecipient: FEE_RECIPIENT,
          })
        );
        newState = "completed";
      }

      if (action !== "cancel") {
        const simResult = await connection.simulateTransaction(transaction);
        if (simResult.value.err) {
          console.error("Simulation failed:", simResult.value.err);
          console.error("Logs:", simResult.value.logs);
          const logs = simResult.value.logs?.join("\n") || "";
          throw new Error(logs || JSON.stringify(simResult.value.err));
        }

        txSignature = await sendTransaction(transaction, connection);
        await connection.confirmTransaction(txSignature, "confirmed");
        console.log(`${action} tx confirmed:`, txSignature);
        showToast(`${action} succeeded on-chain`, "success");
      }

      const res = await fetch(`/api/deal/${id}/state`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          newState,
          actorWallet: currentUserWallet,
          txSignature: txSignature || undefined,
        }),
      });

      const responseText = await res.text();
      let responseData: any = {};
      try {
        responseData = responseText ? JSON.parse(responseText) : {};
      } catch {}

      if (!res.ok) {
        console.error("DB update failed:", responseText);
        showToast(
          "DB update failed: " + (responseData.error || "Unknown"),
          "error"
        );
      } else if (responseData.deal) {
        setDeal(responseData.deal);
      } else {
        const fresh = await fetch(`/api/deal/${id}`);
        if (fresh.ok) {
          const freshData = await fresh.json();
          setDeal(freshData.deal);
        }
      }
    } catch (err: any) {
      console.error(`${action} error:`, err);
      const friendly = humanizeError(err.message || "", `${action} failed`);
      showToast(friendly, "error");
    } finally {
      setActionLoading(false);
    }
  };

  const proposeResolution = async () => {
    if (!deal || !publicKey || !connected) return;

    const workerAmount = Math.floor(
      (deal.amount_lamports * workerPercent) / 100
    );
    const clientAmount = deal.amount_lamports - workerAmount;

    setActionLoading(true);

    try {
      const connection = getConnection();
      const [dealPDA] = getDealPDAFromHex(deal.deal_id);
      const { blockhash } = await connection.getLatestBlockhash();

      const ix = await buildProposeResolutionInstruction({
        signerPubkey: publicKey,
        dealPDA,
        workerAmountLamports: workerAmount,
        clientAmountLamports: clientAmount,
      });

      const transaction = new Transaction({
        recentBlockhash: blockhash,
        feePayer: publicKey,
      });
      transaction.add(ix);

      const sim = await connection.simulateTransaction(transaction);
      if (sim.value.err) {
        console.error("Sim failed:", sim.value.err, sim.value.logs);
        const logs = sim.value.logs?.join("\n") || "";
        throw new Error(logs || JSON.stringify(sim.value.err));
      }

      const signature = await sendTransaction(transaction, connection);
      await connection.confirmTransaction(signature, "confirmed");
      showToast("Resolution proposed on-chain", "success");

      const res = await fetch(`/api/deal/${id}/state`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          newState: "disputed",
          actorWallet: currentUserWallet,
          proposedWorkerAmount: workerAmount,
          proposedClientAmount: clientAmount,
          proposedBy: publicKey.toBase58(),
        }),
      });

      const responseText = await res.text();
      const responseData = responseText ? JSON.parse(responseText) : {};
      if (responseData.deal) setDeal(responseData.deal);
      else {
        const fresh = await fetch(`/api/deal/${id}`);
        if (fresh.ok) setDeal((await fresh.json()).deal);
      }

      setShowProposeUI(false);
    } catch (err: any) {
      console.error("Propose error:", err);
      const friendly = humanizeError(
        err.message || "",
        "Failed to propose resolution"
      );
      showToast(friendly, "error");
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
      <main className="relative min-h-screen">
        <Nav />
        <div className="mx-auto max-w-2xl px-6 pb-24 pt-32 md:px-8 md:pt-40">
          <PageLoader label="Loading deal" />
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

  const stateLabels: Record<string, { prefix: string; label: string; color: string }> = {
    created: { prefix: "[01]", label: "AWAITING ACCEPTANCE", color: "text-lime" },
    accepted: { prefix: "[02]", label: "AWAITING FUNDING", color: "text-lime" },
    funded: { prefix: "[03]", label: "IN PROGRESS", color: "text-lime" },
    submitted: { prefix: "[04]", label: "AWAITING APPROVAL", color: "text-lime" },
    completed: { prefix: "[✓]", label: "COMPLETED", color: "text-lime" },
    refunded: { prefix: "[↩]", label: "REFUNDED", color: "text-text-muted" },
    cancelled: { prefix: "[×]", label: "CANCELLED", color: "text-text-muted" },
    disputed: { prefix: "[!]", label: "DISPUTED", color: "text-red-400" },
    expired: { prefix: "[×]", label: "EXPIRED", color: "text-text-muted" },
  };

  const stateInfo = stateLabels[deal.state] || stateLabels.created;

  const feeAmount = Math.floor((deal.amount_lamports * 150) / 10_000);
  const totalLock = deal.amount_lamports + feeAmount;

  const hasProposal =
    deal.state === "disputed" &&
    deal.proposed_by &&
    deal.proposed_by !== "" &&
    (deal.proposed_worker_amount || 0) + (deal.proposed_client_amount || 0) > 0;

  const isProposer = hasProposal && currentUserWallet === deal.proposed_by;
  const canAcceptProposal = hasProposal && isParty && !isProposer;

  const presetSplits = [
    { worker: 100, label: "100/0" },
    { worker: 75, label: "75/25" },
    { worker: 50, label: "50/50" },
    { worker: 25, label: "25/75" },
    { worker: 0, label: "0/100" },
  ];

  return (
    <main className="relative min-h-screen">
      <Nav />

      <div className="mx-auto max-w-2xl px-6 pb-24 pt-32 md:px-8 md:pt-40">
        <div className="mb-8 flex items-center justify-between">
          <div className="text-xs tracking-wider text-text-faded">
            DEAL #{id.slice(0, 8).toUpperCase()}
          </div>
          <div
            className={`flex items-baseline gap-2 font-mono text-xs uppercase tracking-widest ${stateInfo.color}`}
          >
            <span>{stateInfo.prefix}</span>
            <span>{stateInfo.label}</span>
          </div>
            <span
              className={`h-1 w-1 rounded-full ${
                deal.state === "disputed" ? "bg-red-500" : "bg-lime"
              }`}
            />
            {stateInfo.label}
          </div>
        </div>

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
                {deal.state === "submitted" ? "Auto-release in" : "Auto-release"}
              </div>
              <div className="text-sm font-medium text-text tabular-nums">
                {(() => {
                  if (deal.state === "submitted" && deal.submitted_at) {
                    const expires =
                      new Date(deal.submitted_at).getTime() +
                      deal.auto_release_seconds * 1000;
                    const remaining = expires - now;
                    if (remaining <= 0)
                      return (
                        <span className="text-lime">Ready to auto-release</span>
                      );
                    const days = Math.floor(remaining / 86400000);
                    const hours = Math.floor((remaining % 86400000) / 3600000);
                    const minutes = Math.floor((remaining % 3600000) / 60000);
                    const seconds = Math.floor((remaining % 60000) / 1000);
                    const parts: string[] = [];
                    if (days > 0) parts.push(`${days}d`);
                    if (days > 0 || hours > 0) parts.push(`${hours}h`);
                    parts.push(`${minutes}m`);
                    parts.push(`${seconds}s`);
                    return <span className="text-lime">{parts.join(" ")}</span>;
                  }
                  return deal.auto_release_seconds >= 3600
                    ? `${(deal.auto_release_seconds / 3600).toFixed(1)} hours`
                    : `${Math.floor(deal.auto_release_seconds / 60)} minutes`;
                })()}
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

        {deal.state === "disputed" && (
          <div className="mb-6 border border-red-500/30 bg-red-500/5 p-6">
            <div className="mb-4 flex items-baseline gap-2 font-mono text-xs uppercase tracking-widest text-red-400">
              <span>[!]</span>
              <span>DISPUTE ACTIVE</span>
            </div>

            {!hasProposal && (
              <>
                <p className="mb-6 text-sm leading-relaxed text-text-muted">
                  This deal is frozen. Both parties need to agree on a
                  resolution. Either of you can propose a split of the deal
                  amount below. The platform fee still applies.
                </p>

                {isParty && !showProposeUI && (
                  <button
                    onClick={() => setShowProposeUI(true)}
                    className="w-full bg-lime py-3.5 text-sm font-medium tracking-tight text-bg transition-all hover:opacity-90"
                  >
                    Propose a resolution
                  </button>
                )}

                {isParty && showProposeUI && (
                  <div>
                    <div className="mb-4 text-xs uppercase tracking-widest text-text-faded">
                      Choose a split
                    </div>

                    <div className="mb-5 grid grid-cols-5 gap-2">
                      {presetSplits.map((preset) => (
                        <button
                          key={preset.label}
                          onClick={() => setWorkerPercent(preset.worker)}
                          className={`border py-2 text-xs font-medium transition-all ${
                            workerPercent === preset.worker
                              ? "border-lime bg-lime/10 text-lime"
                              : "border-border text-text-muted hover:border-border-hover hover:text-text"
                          }`}
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>

                    <div className="mb-5">
                      <input
                        type="range"
                        min="0"
                        max="100"
                        step="5"
                        value={workerPercent}
                        onChange={(e) =>
                          setWorkerPercent(parseInt(e.target.value))
                        }
                        className="w-full accent-lime"
                      />
                    </div>

                    <div className="mb-5 grid grid-cols-2 gap-2 border border-border bg-bg p-4">
                      <div>
                        <div className="mb-1 text-xs uppercase tracking-wider text-text-faded">
                          Worker gets
                        </div>
                        <div className="text-lg font-bold tabular-nums text-lime">
                          {workerPercent}%
                        </div>
                        <div className="text-xs text-text-muted">
                          {(
                            (deal.amount_lamports * workerPercent) /
                            100 /
                            1e9
                          ).toFixed(4)}{" "}
                          SOL
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="mb-1 text-xs uppercase tracking-wider text-text-faded">
                          Client gets
                        </div>
                        <div className="text-lg font-bold tabular-nums text-lime">
                          {100 - workerPercent}%
                        </div>
                        <div className="text-xs text-text-muted">
                          {(
                            (deal.amount_lamports * (100 - workerPercent)) /
                            100 /
                            1e9
                          ).toFixed(4)}{" "}
                          SOL
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={proposeResolution}
                        disabled={actionLoading}
                        className="flex-1 bg-lime py-3 text-sm font-medium text-bg transition-all hover:opacity-90 disabled:opacity-50"
                      >
                        {actionLoading ? <ButtonSpinner label="Signing" /> : "Submit proposal"}
                      </button>
                      <button
                        onClick={() => setShowProposeUI(false)}
                        disabled={actionLoading}
                        className="border border-border px-4 py-3 text-sm font-medium text-text-muted transition-all hover:border-border-hover hover:text-text"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}

            {hasProposal && (
              <>
                <div className="mb-4 text-xs text-text-muted">
                  Proposed by{" "}
                  <span className="font-mono text-text">
                    {(deal.proposed_by || "").slice(0, 4)}...
                    {(deal.proposed_by || "").slice(-4)}
                  </span>
                </div>

                <div className="mb-5 grid grid-cols-2 gap-2 border border-border bg-bg p-4">
                  <div>
                    <div className="mb-1 text-xs uppercase tracking-wider text-text-faded">
                      Worker receives
                    </div>
                    <div className="text-2xl font-bold tabular-nums text-lime">
                      {((deal.proposed_worker_amount || 0) / 1e9).toFixed(4)}
                    </div>
                    <div className="text-xs text-text-muted">
                      {Math.round(
                        ((deal.proposed_worker_amount || 0) /
                          deal.amount_lamports) *
                          100
                      )}
                      % · SOL
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="mb-1 text-xs uppercase tracking-wider text-text-faded">
                      Client refunded
                    </div>
                    <div className="text-2xl font-bold tabular-nums text-lime">
                      {((deal.proposed_client_amount || 0) / 1e9).toFixed(4)}
                    </div>
                    <div className="text-xs text-text-muted">
                      {Math.round(
                        ((deal.proposed_client_amount || 0) /
                          deal.amount_lamports) *
                          100
                      )}
                      % · SOL
                    </div>
                  </div>
                </div>

                {canAcceptProposal && (
                  <div className="space-y-2">
                    <button
                      onClick={() => executeAction("acceptResolution")}
                      disabled={actionLoading}
                      className="w-full bg-lime py-3.5 text-sm font-medium text-bg transition-all hover:opacity-90 disabled:opacity-50"
                    >
                      {actionLoading ? <ButtonSpinner label="Signing" /> : "Accept & execute split"}
                    </button>
                    <button
                      onClick={() => setShowProposeUI(true)}
                      disabled={actionLoading}
                      className="w-full border border-border py-3 text-sm font-medium text-text-muted transition-all hover:border-border-hover hover:text-text disabled:opacity-50"
                    >
                      Propose different split
                    </button>
                  </div>
                )}

                {isProposer && (
                  <p className="text-center text-xs text-text-faded">
                    Waiting for the other party to accept.
                  </p>
                )}

                {isParty && showProposeUI && (
                  <div className="mt-6 border-t border-border pt-6">
                    <div className="mb-4 text-xs uppercase tracking-widest text-text-faded">
                      Propose different split
                    </div>
                    <div className="mb-5 grid grid-cols-5 gap-2">
                      {presetSplits.map((preset) => (
                        <button
                          key={preset.label}
                          onClick={() => setWorkerPercent(preset.worker)}
                          className={`border py-2 text-xs font-medium transition-all ${
                            workerPercent === preset.worker
                              ? "border-lime bg-lime/10 text-lime"
                              : "border-border text-text-muted hover:border-border-hover hover:text-text"
                          }`}
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>
                    <div className="mb-5">
                      <input
                        type="range"
                        min="0"
                        max="100"
                        step="5"
                        value={workerPercent}
                        onChange={(e) =>
                          setWorkerPercent(parseInt(e.target.value))
                        }
                        className="w-full accent-lime"
                      />
                    </div>
                    <div className="mb-5 grid grid-cols-2 gap-2 border border-border bg-bg p-4">
                      <div>
                        <div className="mb-1 text-xs text-text-faded">
                          Worker
                        </div>
                        <div className="text-lg font-bold text-lime">
                          {workerPercent}%
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="mb-1 text-xs text-text-faded">
                          Client
                        </div>
                        <div className="text-lg font-bold text-lime">
                          {100 - workerPercent}%
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={proposeResolution}
                        disabled={actionLoading}
                        className="flex-1 bg-lime py-3 text-sm font-medium text-bg transition-all hover:opacity-90 disabled:opacity-50"
                      >
                        {actionLoading ? <ButtonSpinner label="Signing" /> : "Submit counter proposal"}
                      </button>
                      <button
                        onClick={() => setShowProposeUI(false)}
                        disabled={actionLoading}
                        className="border border-border px-4 py-3 text-sm text-text-muted transition-all hover:border-border-hover hover:text-text"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

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

        {authenticated && !connected && (
          <div className="mb-6 border border-lime/30 bg-lime/5 p-6 text-center">
            <p className="mb-4 text-sm text-text-muted">
              Connect your Phantom wallet to interact with this deal.
            </p>
            <div className="inline-block">
              <WalletMultiButton
                style={{
                  backgroundColor: "#C4FF3E",
                  color: "#0A0A0A",
                  borderRadius: 0,
                  padding: "0.75rem 1.5rem",
                  fontSize: "0.875rem",
                  fontWeight: 500,
                  height: "auto",
                  fontFamily: "inherit",
                }}
              />
            </div>
          </div>
        )}

        {authenticated && connected && !isParty && deal.state === "created" && (
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

        {authenticated && connected && isParty && deal.state === "created" && (
          <div className="mb-6">
            <button
              onClick={() => executeAction("accept")}
              disabled={actionLoading}
              className="mb-2 w-full bg-lime py-4 text-sm font-medium text-bg transition-all hover:opacity-90 disabled:opacity-50"
            >
              {actionLoading ? <ButtonSpinner label="Signing" /> : "Accept this deal"}
            </button>
            <button
              onClick={() => executeAction("cancel")}
              disabled={actionLoading}
              className="w-full border border-border py-3.5 text-sm font-medium text-text-muted transition-all hover:border-border-hover hover:text-text disabled:opacity-50"
            >
              Reject
            </button>
          </div>
        )}

        {authenticated && connected && isClient && deal.state === "accepted" && (
          <div className="mb-6">
            <button
              onClick={() => executeAction("fund")}
              disabled={actionLoading}
              className="w-full bg-lime py-4 text-sm font-medium text-bg transition-all hover:opacity-90 disabled:opacity-50"
            >
              {actionLoading
                ? <ButtonSpinner label="Funding" />
                : `Fund deal (${(totalLock / 1e9).toFixed(4)} SOL)`}
            </button>
          </div>
        )}

        {authenticated && connected && isWorker && deal.state === "funded" && (
          <div className="mb-6 space-y-2">
            <button
              onClick={() => executeAction("submit")}
              disabled={actionLoading}
              className="w-full bg-lime py-4 text-sm font-medium text-bg transition-all hover:opacity-90 disabled:opacity-50"
            >
              {actionLoading ? <ButtonSpinner label="Submitting" /> : "Submit work as delivered"}
            </button>
            <button
              onClick={() => executeAction("dispute")}
              disabled={actionLoading}
              className="w-full border border-red-500/30 py-3 text-sm font-medium text-red-400 transition-all hover:border-red-500/50 disabled:opacity-50"
            >
              Open dispute
            </button>
          </div>
        )}

        {authenticated && connected && isClient && deal.state === "funded" && (
          <div className="mb-6">
            <button
              onClick={() => executeAction("dispute")}
              disabled={actionLoading}
              className="w-full border border-red-500/30 py-3 text-sm font-medium text-red-400 transition-all hover:border-red-500/50 disabled:opacity-50"
            >
              Open dispute
            </button>
          </div>
        )}

        {authenticated && connected && isClient && deal.state === "submitted" && (
          <div className="mb-6 space-y-2">
            <button
              onClick={() => executeAction("approve")}
              disabled={actionLoading}
              className="w-full bg-lime py-4 text-sm font-medium text-bg transition-all hover:opacity-90 disabled:opacity-50"
            >
              {actionLoading ? <ButtonSpinner label="Releasing" /> : "Approve & release funds"}
            </button>
            <button
              onClick={() => executeAction("dispute")}
              disabled={actionLoading}
              className="w-full border border-red-500/30 py-3 text-sm font-medium text-red-400 transition-all hover:border-red-500/50 disabled:opacity-50"
            >
              Open dispute
            </button>
          </div>
        )}

        {authenticated && connected && isWorker && deal.state === "submitted" && (
          <div className="mb-6">
            <button
              onClick={() => executeAction("dispute")}
              disabled={actionLoading}
              className="w-full border border-red-500/30 py-3 text-sm font-medium text-red-400 transition-all hover:border-red-500/50 disabled:opacity-50"
            >
              Open dispute
            </button>
          </div>
        )}

        {authenticated && connected && isWorker &&
          (deal.state === "funded" || deal.state === "submitted") && (
            <div className="mb-6">
              <button
                onClick={() => executeAction("refund")}
                disabled={actionLoading}
                className="w-full border border-border py-3 text-sm font-medium text-text-muted transition-all hover:border-border-hover hover:text-text disabled:opacity-50"
              >
                {actionLoading ? <ButtonSpinner label="Refunding" /> : "Refund client (full amount)"}
              </button>
            </div>
          )}

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

        {(deal.state === "completed" ||
          deal.state === "refunded" ||
          deal.state === "cancelled") && (
          <div className="mb-6 border border-lime/30 bg-lime/5 p-6">
            <div className="mb-3 text-xs uppercase tracking-widest text-lime">
              // RECEIPT AVAILABLE
            </div>
            <p className="mb-4 text-sm text-text-muted">
              This deal is complete. Share the public receipt as proof.
            </p>
            <Link
              href={`/r/${id}`}
              className="inline-flex items-center gap-2 border border-lime bg-lime/10 px-4 py-2.5 text-sm font-medium text-lime transition-all hover:bg-lime/20"
            >
              View public receipt →
            </Link>
          </div>
        )}

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