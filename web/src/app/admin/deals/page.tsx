"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { usePrivy } from "@privy-io/react-auth";
import { useWallet } from "@solana/wallet-adapter-react";
import Nav from "@/components/landing/Nav";
import { PageLoader } from "@/components/ui/Spinner";
import { AdminTabs } from "../page";

type Deal = {
  deal_id: string;
  title: string;
  amount_lamports: number;
  currency: string;
  state: string;
  kind: string;
  worker_wallet: string;
  client_wallet: string;
  created_at: string;
  completed_at: string | null;
  create_tx_signature: string | null;
  fund_tx_signature: string | null;
  release_tx_signature: string | null;
  resolution_tx_signature: string | null;
};

export default function AdminDealsPage() {
  const { ready, authenticated } = usePrivy();
  const { publicKey, connected } = useWallet();
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [unauthorized, setUnauthorized] = useState(false);
  const [stateFilter, setStateFilter] = useState("all");
  const [q, setQ] = useState("");

  const walletAddress = publicKey?.toBase58() || null;

  const fetchDeals = useCallback(async () => {
    if (!walletAddress) return;
    setLoading(true);
    try {
      const params = new URLSearchParams({
        adminWallet: walletAddress,
        state: stateFilter,
        q,
      });
      const res = await fetch(`/api/admin/deals?${params}`);
      if (res.status === 403) {
        setUnauthorized(true);
        return;
      }
      const data = await res.json();
      setDeals(data.deals || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [walletAddress, stateFilter, q]);

  useEffect(() => {
    if (!walletAddress) return;
    const timer = setTimeout(fetchDeals, 300);
    return () => clearTimeout(timer);
  }, [walletAddress, fetchDeals]);

  if (!ready || !authenticated || !connected) {
    return (
      <main className="relative min-h-screen">
        <Nav />
        <PageLoader label="Loading" />
      </main>
    );
  }

  if (unauthorized) {
    return (
      <main className="relative min-h-screen">
        <Nav />
        <div className="mx-auto max-w-2xl px-6 py-32 text-center md:px-8">
          <h1 className="text-3xl font-bold">Not authorized</h1>
        </div>
      </main>
    );
  }

  const statePrefixes: Record<string, string> = {
    created: "[01]",
    accepted: "[02]",
    funded: "[03]",
    submitted: "[04]",
    completed: "[✓]",
    refunded: "[↩]",
    cancelled: "[×]",
    disputed: "[!]",
    expired: "[×]",
  };

  return (
    <main className="relative min-h-screen">
      <Nav />

      <div className="mx-auto max-w-6xl px-6 pb-24 pt-32 md:px-8 md:pt-40">
        <div className="mb-8">
          <div className="mb-2 flex items-baseline gap-2 font-mono text-xs uppercase tracking-widest text-lime">
            <span>[ADMIN]</span>
            <span>DEAL MANAGEMENT</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
            Deals
          </h1>
        </div>

        <AdminTabs current="deals" />

        {/* Filters */}
        <div className="mb-6 flex flex-col gap-3 md:flex-row">
          <input
            type="text"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by deal ID, title, wallet..."
            className="flex-1 border border-border bg-bg px-4 py-2.5 text-sm text-text placeholder:text-text-faded focus:border-lime focus:outline-none"
          />
          <select
            value={stateFilter}
            onChange={(e) => setStateFilter(e.target.value)}
            className="border border-border bg-bg px-3 py-2.5 text-sm text-text focus:border-lime focus:outline-none"
          >
            <option value="all">All states</option>
            <option value="created">Created</option>
            <option value="accepted">Accepted</option>
            <option value="funded">Funded</option>
            <option value="submitted">Submitted</option>
            <option value="completed">Completed</option>
            <option value="refunded">Refunded</option>
            <option value="disputed">Disputed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        {loading ? (
          <PageLoader label="Loading deals" />
        ) : deals.length === 0 ? (
          <div className="border border-border bg-surface p-12 text-center text-sm text-text-muted">
            No deals found.
          </div>
        ) : (
          <div className="space-y-2">
            {deals.map((deal) => {
              const latestTx =
                deal.resolution_tx_signature ||
                deal.release_tx_signature ||
                deal.fund_tx_signature ||
                deal.create_tx_signature;
              return (
                <div
                  key={deal.deal_id}
                  className={`border p-4 transition-all ${
                    deal.state === "disputed"
                      ? "border-red-500/30 bg-red-500/5"
                      : "border-border bg-surface"
                  }`}
                >
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="mb-1 flex items-baseline gap-2 flex-wrap font-mono text-xs uppercase tracking-widest">
                        <span
                          className={
                            deal.state === "disputed"
                              ? "text-red-400"
                              : deal.state === "completed" || deal.state === "funded" || deal.state === "submitted"
                              ? "text-lime"
                              : "text-text-muted"
                          }
                        >
                          {statePrefixes[deal.state] || "[?]"}
                        </span>
                        <span
                          className={
                            deal.state === "disputed"
                              ? "text-red-400"
                              : "text-text-muted"
                          }
                        >
                          {deal.state.toUpperCase()}
                        </span>
                      </div>
                      <div className="mb-1 truncate text-sm font-medium text-text">
                        {deal.title}
                      </div>
                      <div className="text-xs text-text-faded">
                        #{deal.deal_id.slice(0, 8).toUpperCase()} ·{" "}
                        {new Date(deal.created_at).toLocaleDateString()} ·{" "}
                        <span className="font-mono">
                          {deal.worker_wallet.slice(0, 4)}...
                        </span>{" "}
                        →{" "}
                        <span className="font-mono">
                          {deal.client_wallet.slice(0, 4)}...
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="text-lg font-bold tabular-nums text-lime">
                          {(deal.amount_lamports / 1e9).toFixed(4)}
                        </div>
                        <div className="text-xs text-text-faded">
                          {deal.currency}
                        </div>
                      </div>

                      <Link
                        href={`/d/${deal.deal_id}`}
                        target="_blank"
                        className="border border-border px-3 py-1.5 text-xs text-text-muted transition-all hover:border-border-hover hover:text-text"
                      >
                        View
                      </Link>

                      {latestTx && (
                        
                        <a
                          href={`https://explorer.solana.com/tx/${latestTx}?cluster=devnet`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="border border-border px-2 py-1.5 text-xs text-text-muted transition-all hover:border-border-hover hover:text-text"
                          title="Explorer"
                        >
                          ↗
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}