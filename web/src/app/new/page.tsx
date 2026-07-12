"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { usePrivy } from "@privy-io/react-auth";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
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
  const { authenticated, ready, login } = usePrivy();
  const { publicKey, sendTransaction, connected } = useWallet();
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

    if (!connected || !publicKey) {
      setError("Please connect your Phantom wallet first.");
      return;
    }
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

    const creatorAddress = publicKey.toBase58();

    setLoading(true);

    try {
      const dealId = generateDealId();
      const dealIdHex = dealIdToHex(dealId);

      const amountLamports = solToLamports(parseFloat(amount));
      const autoReleaseSeconds = parseInt(autoReleaseHours) * 3600;
      const acceptanceDeadline =
        Math.floor(Date.now() / 1000) + parseInt(acceptanceDays) * 86400;

      const counterpartyPubkey = new PublicKey(counterparty.trim());
      const [dealPDA] = getDealPDA(dealId);

      const instruction = await buildCreateDealInstruction({
        creatorPubkey: publicKey,
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
        feePayer: publicKey,
      });
      transaction.add(instruction);

      // Simulate first to get useful errors
      console.log("Simulating transaction...");
      const simResult = await connection.simulateTransaction(transaction);
      console.log("Simulation result:", simResult);
      if (simResult.value.err) {
        console.error("Simulation error:", simResult.value.err);
        console.error("Simulation logs:", simResult.value.logs);
        throw new Error(
          "Simulation failed: " +
            JSON.stringify(simResult.value.err) +
            "\nLogs: " +
            (simResult.value.logs?.join("\n") || "no logs")
        );
      }

      // Sign and send via Phantom
      const signature = await sendTransaction(transaction, connection);

      console.log("Transaction sent:", signature);
      // Wait for confirmation
      await connection.confirmTransaction(signature, "confirmed");

      console.log("Transaction confirmed:", signature);

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
      console.error("Error name:", err.name);
      console.error("Error message:", err.message);
      console.error("Error cause:", err.cause);
      console.error("Error logs:", err.logs);
      if (err.cause) {
        console.error("Cause details:", JSON.stringify(err.cause, null, 2));
      }
      // Try to extract logs from wallet error
      const walletError = err.error || err.cause;
      if (walletError) {
        console.error("Wallet error details:", walletError);
      }
      setError(
        err.message + (err.cause ? ` | Cause: ${JSON.stringify(err.cause)}` : "")
      );
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

        {!connected && (
          <div className="mb-8 border border-lime/30 bg-lime/5 p-6">
            <div className="mb-3 text-xs uppercase tracking-widest text-lime">
              // WALLET REQUIRED
            </div>
            <p className="mb-4 text-sm text-text-muted">
              Connect your Phantom wallet to sign the transaction that creates
              this deal on Solana.
            </p>
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
        )}

        {connected && publicKey && (
          <div className="mb-8 border border-border bg-surface p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="mb-1 text-xs uppercase tracking-widest text-text-faded">
                  Signing wallet
                </div>
                <div className="font-mono text-sm text-text">
                  {publicKey.toBase58().slice(0, 6)}...
                  {publicKey.toBase58().slice(-6)}
                </div>
              </div>
              <div className="text-xs text-lime">CONNECTED</div>
            </div>
          </div>
        )}

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
          disabled={loading || !connected}
          className="w-full bg-lime px-7 py-5 text-base font-medium tracking-tight text-bg transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
        >
          {loading
            ? "Creating deal on Solana..."
            : !connected
              ? "Connect wallet first"
              : "Create deal"}
        </button>

        <p className="mt-6 text-xs text-text-faded">
          This will call the Zinch escrow program on Solana devnet. You'll
          approve one transaction with Phantom.
        </p>
      </div>
    </main>
  );
}