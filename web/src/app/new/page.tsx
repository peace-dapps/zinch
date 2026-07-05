"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { usePrivy } from "@privy-io/react-auth";
import { PublicKey, Transaction } from "@solana/web3.js";
import Nav from "@/components/landing/Nav";
import {
  buildCreateDealInstruction,
  generateDealId,
  dealIdToHex,
  solToLamports,
  getConnection,
  getDealPDA,
} from "@/lib/anchor";

type DealKind = "workerInitiated" | "clientInitiated";

export default function NewDeal() {
  const { authenticated, ready, login, user } = usePrivy();
  const router = useRouter();

  const [kind, setKind] = useState<DealKind>("workerInitiated");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [counterparty, setCounterparty] = useState("");
  const [autoReleaseHours, setAutoReleaseHours] = useState("72");
  const [acceptanceDays, setAcceptanceDays] = useState("7");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!ready) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <div className="text-text-muted text-sm tracking-wider uppercase">
          Loading...
        </div>
      </main>
    );
  }

  if (!authenticated) {
    return (
      <main className="relative min-h-screen">
        <Nav />
        <div className="mx-auto max-w-2xl px-6 py-32 text-center md:px-8">
          <div className="mb-4 text-xs uppercase tracking-widest text-lime">
            // SIGN IN REQUIRED
          </div>
          <h1 className="mb-4 text-4xl font-bold tracking-tight sm:text-5xl">
            Sign in to create a deal.
          </h1>
          <p className="mb-8 text-text-muted">
            You need an account to create a Zinch deal. Takes 30 seconds.
          </p>
          <button
            onClick={login}
            className="bg-lime px-7 py-4 text-sm font-medium tracking-tight text-bg transition-all hover:opacity-90"
          >
            Sign in
          </button>
        </div>
      </main>
    );
  }

  const handleSubmit = async () => {
    setError(null);

    if (!title.trim()) {
      setError("Deal title is required");
      return;
    }
    if (!amount || parseFloat(amount) <= 0) {
      setError("Amount must be greater than 0");
      return;
    }
    if (!counterparty.trim() || counterparty.length < 32) {
      setError("Enter a valid Solana wallet address for the counterparty");
      return;
    }

    const solanaWalletAccount = user?.linkedAccounts?.find(
      (a: any) => a.type === "wallet" && a.chainType === "solana"
    ) as any;

    if (!solanaWalletAccount?.address) {
      setError("No Solana wallet found. Please try signing out and back in.");
      return;
    }

    const creatorAddress = solanaWalletAccount.address;

    setLoading(true);

    try {
      const dealId = generateDealId();
      const dealIdHex = dealIdToHex(dealId);

      const amountLamports = solToLamports(parseFloat(amount));
      const autoReleaseSeconds = parseInt(autoReleaseHours) * 3600;
      const acceptanceDeadline =
        Math.floor(Date.now() / 1000) + parseInt(acceptanceDays) * 86400;

      const creatorPubkey = new PublicKey(creatorAddress);
      const counterpartyPubkey = new PublicKey(counterparty.trim());
      const [dealPDA] = getDealPDA(dealId);

      const instruction = buildCreateDealInstruction({
        creatorPubkey,
        dealPDA,
        dealId,
        amountLamports,
        counterpartyPubkey,
        autoReleaseSeconds,
        acceptanceDeadline,
        kind,
      });

      const connection = getConnection();
      const { blockhash } = await connection.getLatestBlockhash();

      const transaction = new Transaction({
        recentBlockhash: blockhash,
        feePayer: creatorPubkey,
      });
      transaction.add(instruction);

      // TODO: Sign via Privy REST API (workaround for broken /solana subpath)
      console.log("Would send transaction:", transaction);
      console.log("Creator address:", creatorAddress);
      console.log("Deal PDA:", dealPDA.toBase58());
      
      // For now, just save to DB without on-chain call
      const signature = "pending_" + dealIdHex.slice(0, 8);

      const workerWallet =
        kind === "workerInitiated" ? creatorAddress : counterparty.trim();
      const clientWallet =
        kind === "clientInitiated" ? creatorAddress : counterparty.trim();

      const res = await fetch("/api/create-deal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dealId: dealIdHex,
          creatorWallet: creatorAddress,
          counterpartyWallet: counterparty.trim(),
          workerWallet,
          clientWallet,
          title: title.trim(),
          description: description.trim() || null,
          amountLamports,
          amountDisplay: `${amount} SOL`,
          kind:
            kind === "workerInitiated" ? "worker_initiated" : "client_initiated",
          autoReleaseSeconds,
          acceptanceDeadline: new Date(acceptanceDeadline * 1000).toISOString(),
          createTxSignature: signature,
        }),
      });

      if (!res.ok) {
        console.error("Failed to save deal to DB:", await res.text());
      }

      router.push(`/d/${dealIdHex}`);
    } catch (err: any) {
      console.error("Deal creation error:", err);
      setError(err.message || "Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  return (
    <main className="relative min-h-screen">
      <Nav />

      <div className="mx-auto max-w-3xl px-6 pb-24 pt-32 md:px-8 md:pt-40">
        <div className="mb-4 text-xs uppercase tracking-widest text-lime">
          // NEW DEAL
        </div>
        <h1 className="mb-3 text-4xl font-bold tracking-tight sm:text-5xl">
          Create a deal.
        </h1>
        <p className="mb-12 text-text-muted">
          Set the terms. Get a shareable link. Lock funds in escrow on Solana.
        </p>

        <div className="mb-10">
          <div className="mb-3 text-xs uppercase tracking-widest text-text-faded">
            I am the
          </div>
          <div className="grid grid-cols-2 gap-px border border-border bg-border">
            <button
              onClick={() => setKind("workerInitiated")}
              className={`bg-bg p-5 text-left transition-colors ${
                kind === "workerInitiated"
                  ? "border-l-2 border-lime bg-surface"
                  : "hover:bg-surface"
              }`}
            >
              <div className="mb-1 text-sm font-medium">Worker</div>
              <div className="text-xs text-text-muted">
                Sending an invoice to a client
              </div>
            </button>
            <button
              onClick={() => setKind("clientInitiated")}
              className={`bg-bg p-5 text-left transition-colors ${
                kind === "clientInitiated"
                  ? "border-l-2 border-lime bg-surface"
                  : "hover:bg-surface"
              }`}
            >
              <div className="mb-1 text-sm font-medium">Client</div>
              <div className="text-xs text-text-muted">
                Hiring someone for work
              </div>
            </button>
          </div>
        </div>

        <div className="mb-8">
          <label className="mb-2 block text-xs uppercase tracking-widest text-text-faded">
            Deal title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Smart contract audit — 7 day turnaround"
            className="w-full border border-border bg-bg px-4 py-4 text-text placeholder:text-text-faded focus:border-lime focus:outline-none"
          />
        </div>

        <div className="mb-8">
          <label className="mb-2 block text-xs uppercase tracking-widest text-text-faded">
            Description <span className="text-text-faded">(optional)</span>
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Full audit of the escrow program..."
            rows={4}
            className="w-full border border-border bg-bg px-4 py-4 text-text placeholder:text-text-faded focus:border-lime focus:outline-none"
          />
        </div>

        <div className="mb-8">
          <label className="mb-2 block text-xs uppercase tracking-widest text-text-faded">
            Amount (SOL)
          </label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.5"
            step="0.001"
            min="0"
            className="w-full border border-border bg-bg px-4 py-4 text-2xl font-bold tabular-nums text-text placeholder:text-text-faded focus:border-lime focus:outline-none"
          />
          {amount && parseFloat(amount) > 0 && (
            <div className="mt-2 text-xs text-text-muted">
              Client pays{" "}
              <span className="text-text">
                {(parseFloat(amount) * 1.015).toFixed(4)} SOL
              </span>{" "}
              (includes 1.5% platform fee)
            </div>
          )}
        </div>

        <div className="mb-8">
          <label className="mb-2 block text-xs uppercase tracking-widest text-text-faded">
            {kind === "workerInitiated" ? "Client" : "Worker"} wallet address
          </label>
          <input
            type="text"
            value={counterparty}
            onChange={(e) => setCounterparty(e.target.value)}
            placeholder="Their Solana wallet address"
            className="w-full border border-border bg-bg px-4 py-4 font-mono text-sm text-text placeholder:text-text-faded focus:border-lime focus:outline-none"
          />
        </div>

        <div className="mb-10 grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label className="mb-2 block text-xs uppercase tracking-widest text-text-faded">
              Auto-release (hours)
            </label>
            <input
              type="number"
              value={autoReleaseHours}
              onChange={(e) => setAutoReleaseHours(e.target.value)}
              min="1"
              max="720"
              className="w-full border border-border bg-bg px-4 py-4 text-text focus:border-lime focus:outline-none"
            />
            <div className="mt-2 text-xs text-text-muted">
              If client ghosts, worker gets paid automatically after this
            </div>
          </div>
          <div>
            <label className="mb-2 block text-xs uppercase tracking-widest text-text-faded">
              Acceptance deadline (days)
            </label>
            <input
              type="number"
              value={acceptanceDays}
              onChange={(e) => setAcceptanceDays(e.target.value)}
              min="1"
              max="30"
              className="w-full border border-border bg-bg px-4 py-4 text-text focus:border-lime focus:outline-none"
            />
            <div className="mt-2 text-xs text-text-muted">
              Deal expires if not accepted within this window
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 border border-red-900 bg-red-950/30 p-4 text-sm text-red-400">
            {error}
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-lime px-7 py-5 text-base font-medium tracking-tight text-bg transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
        >
          {loading ? "Creating deal on Solana..." : "Create deal"}
        </button>

        <p className="mt-6 text-xs text-text-faded">
          This will call the Zinch escrow program on Solana devnet. You'll
          approve one transaction with your wallet.
        </p>
      </div>
    </main>
  );
}