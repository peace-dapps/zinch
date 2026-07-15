"use client";

import { useEffect, useState } from "react";
import { use } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { PublicKey, Transaction } from "@solana/web3.js";
import Nav from "@/components/landing/Nav";
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
  create_tx_signature: string | null;
  proposed_worker_amount: number | null;
  proposed_client_amount: number | null;
  proposed_by: string | null;
};

export default function DealPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { authenticated, login } = usePrivy();
  const { publicKey, sendTransaction, connected } = useWallet();
  const [deal, setDeal] = useState<Deal | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  // Dispute state
  const [showProposeUI, setShowProposeUI] = useState(false);
  const [workerPercent, setWorkerPercent] = useState(50);

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
      alert("Please connect your Phantom wallet first.");
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
        const ix = await buildAcceptDealInstruction({
          signerPubkey: publicKey,
          dealPDA,
        });
        transaction.add(ix);
        newState = "accepted";
      } else if (action === "fund") {
        const ix = await buildFundDealInstruction({
          clientPubkey: publicKey,
          dealPDA,
        });
        transaction.add(ix);
        newState = "funded";
      } else if (action === "submit") {
        const ix = await buildSubmitWorkInstruction({
          workerPubkey: publicKey,
          dealPDA,
        });
        transaction.add(ix);
        newState = "submitted";
      } else if (action === "approve") {
        const ix = await buildApproveAndReleaseInstruction({
          clientPubkey: publicKey,
          dealPDA,
          workerPubkey: new PublicKey(deal.worker_wallet),
          feeRecipient: FEE_RECIPIENT,
        });
        transaction.add(ix);
        newState = "completed";
      } else if (action === "refund") {
        const ix = await buildRefundDealInstruction({
          workerPubkey: publicKey,
          dealPDA,
          clientPubkey: new PublicKey(deal.client_wallet),
        });
        transaction.add(ix);
        newState = "refunded";
      } else if (action === "cancel") {
        newState = "cancelled";
      } else if (action === "dispute") {
        const ix = await buildOpenDisputeInstruction({
          signerPubkey: publicKey,
          dealPDA,
        });
        transaction.add(ix);
        newState = "disputed";
      } else if (action === "acceptResolution") {
        const ix = await buildAcceptResolutionInstruction({
          signerPubkey: publicKey,
          dealPDA,
          workerPubkey: new PublicKey(deal.worker_wallet),
          clientPubkey: new PublicKey(deal.client_wallet),
          feeRecipient: FEE_RECIPIENT,
        });
        transaction.add(ix);
        newState = "completed";
      }

      if (action !== "cancel") {
        const simResult = await connection.simulateTransaction(transaction);
        if (simResult.value.err) {
          console.error("Simulation failed:", simResult.value.err);
          console.error("Logs:", simResult.value.logs);
          throw new Error(
            "Transaction would fail: " +
              JSON.stringify(simResult.value.err) +
              "\n" +
              (simResult.value.logs?.join("\n") || "")
          );
        }

        txSignature = await sendTransaction(transaction, connection);
        await connection.confirmTransaction(txSignature, "confirmed");
        console.log(`${action} tx confirmed:`, txSignature);
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
        alert("DB update failed: " + (responseData.error || "Unknown"));
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
      alert(err.message || `${action} failed. See console.`);
    } finally {
      setActionLoading(false);
    }
  };

  const proposeResolution = async () => {
    if (!deal || !publicKey || !connected) return;

    const workerAmount = Math.floor((deal.amount_lamports * workerPercent) / 100);
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
        throw new Error(
          "Failed: " +
            JSON.stringify(sim.value.err) +
            "\n" +
            (sim.value.logs?.join("\n") || "")
        );
      }

      const signature = await sendTransaction(transaction, connection);
      await connection.confirmTransaction(signature, "confirmed");

      // Update DB with proposed amounts (state stays disputed)
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
      alert(err.message || "Failed to propose resolution");
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

  const feeAmount = Math.floor((deal.amount_lamports * 150) / 10_000);
  const totalLock = deal.amount_lamports + feeAmount;

  // Dispute logic
  const hasProposal =
    deal.state === "disputed" &&
    deal.proposed_by &&
    deal.proposed_by !== "" &&
    (deal.proposed_worker_amount || 0) + (deal.proposed_client_amount || 0) > 0;

  const isProposer =
    hasProposal && currentUserWallet === deal.proposed_by;
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
            className={`inline-flex items-center gap-1.5 border ${
              deal.state === "disputed" ? "border-red-500/30 bg-red-500/10" : "border-lime/30 bg-lime/10"
            } px-2.5 py-1 text-xs uppercase tracking-wider ${stateInfo.color}`}
          >
            <span className={`h-1 w-1 rounded-full ${deal.state === "disputed" ? "bg-red-500" : "bg-lime"}`} />
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
                Auto-release
              </div>
              <div className="text-sm font-medium text-text">
                {deal.auto_release_seconds >= 3600
                  ? `${(deal.auto_release_seconds / 3600).toFixed(1)} hours`
                  : `${Math.floor(deal.auto_release_seconds / 60)} minutes`}
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

        {/* ========== DISPUTE VIEW ========== */}
        {deal.state === "disputed" && (
          <div className="mb-6 border border-red-500/30 bg-red-500/5 p-6">
            <div className="mb-4 flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-red-500" />
              <div className="text-xs uppercase tracking-widest text-red-400">
                DISPUTE ACTIVE
              </div>
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

                    {/* Preset buttons */}
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

                    {/* Slider */}
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

                    {/* Split preview */}
                    <div className="mb-5 grid grid-cols-2 gap-2 border border-border bg-bg p-4">
                      <div>
                        <div className="mb-1 text-xs uppercase tracking-wider text-text-faded">
                          Worker gets
                        </div>
                        <div className="text-lg font-bold tabular-nums text-lime">
                          {workerPercent}%
                        </div>
                        <div className="text-xs text-text-muted">
                          {((deal.amount_lamports * workerPercent) / 100 / 1e9).toFixed(4)} SOL
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
                          {((deal.amount_lamports * (100 - workerPercent)) / 100 / 1e9).toFixed(4)} SOL
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={proposeResolution}
                        disabled={actionLoading}
                        className="flex-1 bg-lime py-3 text-sm font-medium text-bg transition-all hover:opacity-90 disabled:opacity-50"
                      >
                        {actionLoading ? "Signing..." : "Submit proposal"}
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
                      {actionLoading ? "Signing..." : "Accept & execute split"}
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
                        onChange={(e) => setWorkerPercent(parseInt(e.target.value))}
                        className="w-full accent-lime"
                      />
                    </div>
                    <div className="mb-5 grid grid-cols-2 gap-2 border border-border bg-bg p-4">
                      <div>
                        <div className="mb-1 text-xs text-text-faded">Worker</div>
                        <div className="text-lg font-bold text-lime">{workerPercent}%</div>
                      </div>
                      <div className="text-right">
                        <div className="mb-1 text-xs text-text-faded">Client</div>
                        <div className="text-lg font-bold text-lime">{100 - workerPercent}%</div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={proposeResolution}
                        disabled={actionLoading}
                        className="flex-1 bg-lime py-3 text-sm font-medium text-bg transition-all hover:opacity-90 disabled:opacity-50"
                      >
                        {actionLoading ? "Signing..." : "Submit counter proposal"}
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

        {/* ========== NORMAL ACTION BUTTONS ========== */}
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
              {actionLoading ? "Signing on-chain..." : "Accept this deal"}
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
                ? "Funding on-chain..."
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
              {actionLoading ? "Submitting..." : "Submit work as delivered"}
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
              {actionLoading ? "Releasing..." : "Approve & release funds"}
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

        {authenticated && connected && isWorker && (deal.state === "funded" || deal.state === "submitted") && (
          <div className="mb-6">
            <button
              onClick={() => executeAction("refund")}
              disabled={actionLoading}
              className="w-full border border-border py-3 text-sm font-medium text-text-muted transition-all hover:border-border-hover hover:text-text disabled:opacity-50"
            >
              {actionLoading ? "Refunding..." : "Refund client (full amount)"}
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