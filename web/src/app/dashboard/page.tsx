"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePrivy } from "@privy-io/react-auth";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import Nav from "@/components/landing/Nav";
import { PageLoader, ShimmerRow } from "@/components/ui/Spinner";

type Deal = {
  deal_id: string;
  title: string;
  amount_lamports: number;
  currency: string;
  kind: string;
  worker_wallet: string;
  client_wallet: string;
  creator_wallet: string;
  state: string;
  auto_release_seconds: number;
  acceptance_deadline: string;
  created_at: string;
  submitted_at: string | null;
  completed_at: string | null;
  create_tx_signature: string | null;
  fund_tx_signature: string | null;
  release_tx_signature: string | null;
  resolution_tx_signature: string | null;
};

const ACTIVE_STATES = ["created", "accepted", "funded", "submitted"];
const HISTORY_STATES = ["completed", "refunded", "cancelled", "expired"];

export default function DashboardPage() {
  const { authenticated, ready, user, login, logout } = usePrivy();
  const { publicKey, connected } = useWallet();
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(Date.now());

  const [historyFilter, setHistoryFilter] = useState<string>("all");
  const [dateRange, setDateRange] = useState<string>("all");

  const walletAddress = publicKey?.toBase58() || null;

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!walletAddress) {
      setDeals([]);
      setLoading(false);
      return;
    }
    (async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/deals?wallet=${walletAddress}`);
        const data = await res.json();
        setDeals(data.deals || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, [walletAddress]);

  const {
    pendingAction,
    active,
    history,
    totalLocked,
    totalEarned,
  } = useMemo(() => {
    if (!walletAddress) {
      return {
        pendingAction: [],
        active: [],
        history: [],
        totalLocked: 0,
        totalEarned: 0,
      };
    }

    const pendingAction: Deal[] = [];
    const active: Deal[] = [];
    const history: Deal[] = [];
    let totalLocked = 0;
    let totalEarned = 0;

    for (const deal of deals) {
      const isWorker = deal.worker_wallet === walletAddress;
      const isClient = deal.client_wallet === walletAddress;

      if (deal.state === "disputed") {
        pendingAction.push(deal);
        totalLocked += deal.amount_lamports;
        continue;
      }

      if (ACTIVE_STATES.includes(deal.state)) {
        const needsAction =
          (deal.state === "created" &&
            walletAddress !== deal.creator_wallet) ||
          (deal.state === "accepted" && isClient) ||
          (deal.state === "funded" && isWorker) ||
          (deal.state === "submitted" && isClient);

        if (needsAction) {
          pendingAction.push(deal);
        } else {
          active.push(deal);
        }

        if (deal.state === "funded" || deal.state === "submitted") {
          totalLocked += deal.amount_lamports;
        }
        continue;
      }

      if (HISTORY_STATES.includes(deal.state)) {
        history.push(deal);
        if (deal.state === "completed" && isWorker) {
          totalEarned += deal.amount_lamports;
        }
      }
    }

    return { pendingAction, active, history, totalLocked, totalEarned };
  }, [deals, walletAddress]);

  const filteredHistory = useMemo(() => {
    let filtered = history;

    if (historyFilter !== "all") {
      filtered = filtered.filter((d) => d.state === historyFilter);
    }

    if (dateRange !== "all") {
      const nowMs = Date.now();
      const ranges: Record<string, number> = {
        "7d": 7 * 86400 * 1000,
        "30d": 30 * 86400 * 1000,
        "90d": 90 * 86400 * 1000,
      };
      const rangeMs = ranges[dateRange];
      if (rangeMs) {
        filtered = filtered.filter((d) => {
          const t = new Date(d.completed_at || d.created_at).getTime();
          return nowMs - t <= rangeMs;
        });
      }
    }

    return filtered;
  }, [history, historyFilter, dateRange]);

  if (!ready) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <div className="text-xs uppercase tracking-widest text-text-faded">
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
          <h1 className="mb-4 text-4xl font-bold tracking-tight">
            Sign in to view your dashboard
          </h1>
          <button
            onClick={login}
            className="bg-lime px-6 py-3 text-sm font-medium text-bg transition-all hover:opacity-90"
          >
            Sign in
          </button>
        </div>
      </main>
    );
  }

  if (!connected || !walletAddress) {
    return (
      <main className="relative min-h-screen">
        <Nav />
        <div className="mx-auto max-w-2xl px-6 py-32 text-center md:px-8">
          <div className="mb-4 text-xs uppercase tracking-widest text-lime">
            // CONNECT WALLET
          </div>
          <h1 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
            Connect your Solana wallet
          </h1>
          <p className="mb-8 text-text-muted">
            Zinch queries deals by your connected wallet. Connect Phantom to see
            deals where you&apos;re a worker or client.
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
      </main>
    );
  }

  return (
    <main className="relative min-h-screen">
      <Nav />

      <div className="mx-auto max-w-6xl px-6 pb-24 pt-32 md:px-8 md:pt-40">
        <div className="mb-10 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="mb-2 text-xs uppercase tracking-widest text-text-faded">
              // DASHBOARD
            </div>
            <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
              Welcome back.
            </h1>
            <div className="mt-2 text-sm text-text-muted">
              <span className="font-mono text-xs">
                {walletAddress.slice(0, 6)}...{walletAddress.slice(-6)}
              </span>
              {user?.email?.address && <span> · {user.email.address}</span>}
            </div>
          </div>

          <Link
            href="/new"
            className="inline-flex items-center gap-2 bg-lime px-5 py-3 text-sm font-medium text-bg transition-all hover:opacity-90"
          >
            + Create a deal
          </Link>
        </div>

        <div className="mb-10 grid grid-cols-2 gap-3 md:grid-cols-4">
          <StatCard
            label="Total locked"
            value={`${(totalLocked / 1e9).toFixed(4)} SOL`}
            hint="Currently in escrow"
          />
          <StatCard
            label="Total earned"
            value={`${(totalEarned / 1e9).toFixed(4)} SOL`}
            hint="Lifetime worker earnings"
          />
          <StatCard
            label="Active deals"
            value={String(active.length + pendingAction.length)}
            hint="Not yet complete"
          />
          <StatCard
            label="Completed"
            value={String(history.filter((d) => d.state === "completed").length)}
            hint="All-time"
          />
        </div>

        {loading && (
          <div className="mb-10 space-y-2">
            <ShimmerRow />
            <ShimmerRow />
            <ShimmerRow />
          </div>
        )}

        {!loading && pendingAction.length > 0 && (
          <section className="mb-10">
            <div className="mb-4 flex items-baseline gap-2 font-mono text-sm uppercase tracking-widest text-lime">
              <span>[!]</span>
              <h2>Pending your action ({pendingAction.length})</h2>
            </div>
            <div className="space-y-2">
              {pendingAction.map((deal) => (
                <DealRow
                  key={deal.deal_id}
                  deal={deal}
                  walletAddress={walletAddress}
                  now={now}
                  highlight
                />
              ))}
            </div>
          </section>
        )}

        {!loading && active.length > 0 && (
          <section className="mb-10">
            <h2 className="mb-4 text-sm uppercase tracking-widest text-text-faded">
              Active ({active.length})
            </h2>
            <div className="space-y-2">
              {active.map((deal) => (
                <DealRow
                  key={deal.deal_id}
                  deal={deal}
                  walletAddress={walletAddress}
                  now={now}
                />
              ))}
            </div>
          </section>
        )}

        {!loading && (
          <section>
            <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <h2 className="text-sm uppercase tracking-widest text-text-faded">
                History ({filteredHistory.length})
              </h2>

              <div className="flex flex-wrap gap-2">
                <select
                  value={historyFilter}
                  onChange={(e) => setHistoryFilter(e.target.value)}
                  className="border border-border bg-bg px-3 py-1.5 text-xs text-text focus:border-lime focus:outline-none"
                >
                  <option value="all">All states</option>
                  <option value="completed">Completed</option>
                  <option value="refunded">Refunded</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="expired">Expired</option>
                </select>
                <select
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                  className="border border-border bg-bg px-3 py-1.5 text-xs text-text focus:border-lime focus:outline-none"
                >
                  <option value="all">All time</option>
                  <option value="7d">Last 7 days</option>
                  <option value="30d">Last 30 days</option>
                  <option value="90d">Last 90 days</option>
                </select>
              </div>
            </div>

            {filteredHistory.length === 0 ? (
              <div className="border border-border p-8 text-center text-sm text-text-muted">
                No deals match your filters.
              </div>
            ) : (
              <div className="space-y-2">
                {filteredHistory.map((deal) => (
                  <DealRow
                    key={deal.deal_id}
                    deal={deal}
                    walletAddress={walletAddress}
                    now={now}
                  />
                ))}
              </div>
            )}
          </section>
        )}

        {!loading &&
          pendingAction.length === 0 &&
          active.length === 0 &&
          history.length === 0 && (
            <div className="border border-border p-12 text-center">
              <div className="mb-2 text-xs uppercase tracking-widest text-text-faded">
                // EMPTY
              </div>
              <h3 className="mb-4 text-xl font-bold">No deals yet</h3>
              <p className="mb-6 text-sm text-text-muted">
                Create your first deal to get started.
              </p>
              <Link
                href="/new"
                className="inline-flex items-center gap-2 bg-lime px-5 py-3 text-sm font-medium text-bg transition-all hover:opacity-90"
              >
                Create a deal
              </Link>
            </div>
          )}

        <div className="mt-16 border-t border-border pt-8">
          <div className="mb-4 text-xs uppercase tracking-widest text-text-faded">
            Account
          </div>
          <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2">
            <div>
              <div className="mb-1 text-xs text-text-faded">Signed in as</div>
              <div className="text-text">
                {user?.email?.address || user?.google?.email || "—"}
              </div>
            </div>
            <div>
              <div className="mb-1 text-xs text-text-faded">Solana wallet</div>
              <div className="break-all font-mono text-xs text-text">
                {walletAddress}
              </div>
            </div>
          </div>
          <button
            onClick={() => logout()}
            className="mt-6 border border-border px-4 py-2 text-xs text-text-muted transition-all hover:border-border-hover hover:text-text"
          >
            Sign out
          </button>
        </div>
      </div>
    </main>
  );
}

function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="border border-border bg-surface p-4">
      <div className="mb-1 text-xs uppercase tracking-wider text-text-faded">
        {label}
      </div>
      <div className="text-xl font-bold tracking-tight tabular-nums text-text md:text-2xl">
        {value}
      </div>
      {hint && <div className="mt-1 text-xs text-text-faded">{hint}</div>}
    </div>
  );
}

function DealRow({
  deal,
  walletAddress,
  now,
  highlight,
}: {
  deal: Deal;
  walletAddress: string;
  now: number;
  highlight?: boolean;
}) {
  const isWorker = deal.worker_wallet === walletAddress;
  const role = isWorker ? "Worker" : "Client";

  const stateLabels: Record<string, { prefix: string; label: string }> = {
    created: { prefix: "[01]", label: "AWAITING ACCEPTANCE" },
    accepted: { prefix: "[02]", label: "AWAITING FUNDING" },
    funded: { prefix: "[03]", label: "IN PROGRESS" },
    submitted: { prefix: "[04]", label: "AWAITING APPROVAL" },
    completed: { prefix: "[✓]", label: "COMPLETED" },
    refunded: { prefix: "[↩]", label: "REFUNDED" },
    cancelled: { prefix: "[×]", label: "CANCELLED" },
    disputed: { prefix: "[!]", label: "DISPUTED" },
    expired: { prefix: "[×]", label: "EXPIRED" },
  };

  const stateColors: Record<string, string> = {
    created: "text-lime",
    accepted: "text-lime",
    funded: "text-lime",
    submitted: "text-lime",
    completed: "text-text",
    refunded: "text-text-muted",
    cancelled: "text-text-muted",
    disputed: "text-red-400",
    expired: "text-text-muted",
  };

  let countdown: string | null = null;
  if (deal.state === "submitted" && deal.submitted_at) {
    const submittedAt = new Date(deal.submitted_at).getTime();
    const expiresAt = submittedAt + deal.auto_release_seconds * 1000;
    const remaining = expiresAt - now;
    if (remaining > 0) {
      const days = Math.floor(remaining / 86400000);
      const hours = Math.floor((remaining % 86400000) / 3600000);
      const minutes = Math.floor((remaining % 3600000) / 60000);
      const seconds = Math.floor((remaining % 60000) / 1000);
      const parts = [];
      if (days > 0) parts.push(`${days}d`);
      if (days > 0 || hours > 0) parts.push(`${hours}h`);
      parts.push(`${minutes}m`);
      parts.push(`${seconds}s`);
      countdown = parts.join(" ");
    } else {
      countdown = "Auto-releasing...";
    }
  }

  const latestTx =
    deal.resolution_tx_signature ||
    deal.release_tx_signature ||
    deal.fund_tx_signature ||
    deal.create_tx_signature;

  return (
    <div
      className={`border p-4 transition-all hover:border-border-hover ${
        highlight
          ? "border-lime/50 bg-lime/5"
          : deal.state === "disputed"
          ? "border-red-500/30 bg-red-500/5"
          : "border-border bg-surface"
      }`}
    >
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <Link href={`/d/${deal.deal_id}`} className="flex-1 min-w-0 block">
          <div className="mb-1 flex items-baseline gap-2 flex-wrap font-mono text-xs uppercase tracking-widest">
            <span className={stateColors[deal.state] || "text-text-muted"}>
              {stateLabels[deal.state]?.prefix || "[?]"}
            </span>
            <span className={stateColors[deal.state] || "text-text-muted"}>
              {stateLabels[deal.state]?.label || deal.state}
            </span>
            <span className="text-xs text-text-faded">·</span>
            <span className="text-xs text-text-faded">{role}</span>
            {countdown && (
              <>
                <span className="text-xs text-text-faded">·</span>
                <span className="font-mono text-xs tabular-nums text-lime">
                  {countdown}
                </span>
              </>
            )}
          </div>
          <div className="mb-1 truncate text-sm font-medium text-text">
            {deal.title}
          </div>
          <div className="text-xs text-text-faded">
            #{deal.deal_id.slice(0, 8).toUpperCase()} ·{" "}
            {new Date(deal.created_at).toLocaleDateString()}
          </div>
        </Link>

        <div className="flex items-center gap-4">
          <Link href={`/d/${deal.deal_id}`} className="text-right block">
            <div className="text-lg font-bold tabular-nums text-lime">
              {(deal.amount_lamports / 1e9).toFixed(4)}
            </div>
            <div className="text-xs text-text-faded">SOL</div>
          </Link>

          {latestTx && (
            
           <a   href={`https://explorer.solana.com/tx/${latestTx}?cluster=devnet`}
              target="_blank"
              rel="noopener noreferrer"
              className="border border-border px-2 py-1 text-xs text-text-muted transition-all hover:border-border-hover hover:text-text"
              title="View on Solana Explorer"
            >
              ↗
            </a>
          )}
        </div>
      </div>
    </div>
  );
}