"use client";

import { useEffect, useState } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { useRouter } from "next/navigation";
import Nav from "@/components/landing/Nav";
import Link from "next/link";

type Deal = {
  deal_id: string;
  title: string;
  amount_lamports: number;
  amount_display: string;
  currency: string;
  state: string;
  worker_wallet: string;
  client_wallet: string;
  created_at: string;
};

const stateLabels: Record<string, { label: string; color: string }> = {
  created: { label: "Awaiting acceptance", color: "text-lime" },
  accepted: { label: "Awaiting funding", color: "text-lime" },
  funded: { label: "In progress", color: "text-lime" },
  submitted: { label: "Awaiting approval", color: "text-lime" },
  completed: { label: "Completed", color: "text-text-muted" },
  refunded: { label: "Refunded", color: "text-text-muted" },
  cancelled: { label: "Cancelled", color: "text-text-muted" },
  disputed: { label: "Disputed", color: "text-red-400" },
  expired: { label: "Expired", color: "text-text-muted" },
};

export default function Dashboard() {
  const { ready, authenticated, user, logout } = usePrivy();
  const router = useRouter();
  const [deals, setDeals] = useState<Deal[]>([]);
  const [dealsLoading, setDealsLoading] = useState(true);

  const walletAddress =
    (user?.linkedAccounts?.find(
      (a: any) => a.type === "wallet" && a.chainType === "solana"
    ) as any)?.address || null;

  useEffect(() => {
    if (ready && !authenticated) {
      router.push("/");
    }
  }, [ready, authenticated, router]);

  useEffect(() => {
    if (!walletAddress) return;
    const fetchDeals = async () => {
      try {
        const res = await fetch(`/api/deals?wallet=${walletAddress}`);
        if (res.ok) {
          const data = await res.json();
          setDeals(data.deals || []);
        }
      } catch (err) {
        console.error("Failed to fetch deals:", err);
      } finally {
        setDealsLoading(false);
      }
    };
    fetchDeals();
  }, [walletAddress]);

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
    return null;
  }

  const displayName =
    user?.email?.address ||
    user?.google?.email ||
    user?.telegram?.username ||
    "Anonymous";

  const activeDeals = deals.filter((d) =>
    ["created", "accepted", "funded", "submitted"].includes(d.state)
  ).length;

  const pendingAction = deals.filter((d) => {
    const isWorker = d.worker_wallet === walletAddress;
    const isClient = d.client_wallet === walletAddress;
    if (isClient && (d.state === "created" || d.state === "accepted" || d.state === "submitted")) return true;
    if (isWorker && d.state === "funded") return true;
    return false;
  }).length;

  const totalLocked = deals
    .filter((d) => ["funded", "submitted"].includes(d.state))
    .reduce((sum, d) => sum + d.amount_lamports, 0);

  const totalEarned = deals
    .filter((d) => d.state === "completed" && d.worker_wallet === walletAddress)
    .reduce((sum, d) => sum + d.amount_lamports, 0);

  return (
    <main className="relative min-h-screen">
      <Nav />

      <div className="mx-auto max-w-7xl px-6 pb-24 pt-32 md:px-8 md:pt-40">
        <div className="mb-12 flex flex-wrap items-end justify-between gap-6">
          <div>
            <div className="mb-3 text-xs uppercase tracking-widest text-lime">
              // DASHBOARD
            </div>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
              Welcome back.
            </h1>
            <p className="mt-3 text-text-muted">
              Signed in as <span className="text-text">{displayName}</span>
            </p>
          </div>

          
          <a  href="/new"
            className="inline-block bg-lime px-7 py-4 text-sm font-medium tracking-tight text-bg transition-all hover:opacity-90"
          >
            + Create a deal
          </a>
        </div>

        <div className="mb-12 grid grid-cols-2 gap-px border border-border bg-border md:grid-cols-4">
          {[
            { label: "Active deals", value: activeDeals.toString() },
            { label: "Pending action", value: pendingAction.toString() },
            { label: "Total locked", value: `${(totalLocked / 1e9).toFixed(3)} SOL` },
            { label: "Total earned", value: `${(totalEarned / 1e9).toFixed(3)} SOL` },
          ].map((stat) => (
            <div key={stat.label} className="bg-bg p-6 md:p-8">
              <div className="mb-2 text-xs uppercase tracking-widest text-text-faded">
                {stat.label}
              </div>
              <div className="text-2xl font-bold tracking-tight tabular-nums md:text-3xl">
                {stat.value}
              </div>
            </div>
          ))}
        </div>

        {dealsLoading ? (
          <div className="border border-border p-12 text-center">
            <div className="text-text-muted text-sm uppercase tracking-widest">
              Loading deals...
            </div>
          </div>
        ) : deals.length === 0 ? (
          <div className="border border-border p-12 text-center md:p-20">
            <div className="mx-auto mb-6 flex h-12 w-12 items-center justify-center border border-lime bg-lime/10">
              <svg
                className="h-5 w-5 text-lime"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M12 5v14M5 12h14" />
              </svg>
            </div>
            <h2 className="mb-3 text-2xl font-medium tracking-tight md:text-3xl">
              Nothing here yet.
            </h2>
            <p className="mx-auto mb-8 max-w-md text-text-muted">
              Your first Zinch deal starts with a link. Create one, share it,
              lock funds in escrow.
            </p>
            
          <a    href="/new"
              className="inline-block bg-lime px-7 py-4 text-sm font-medium tracking-tight text-bg transition-all hover:opacity-90"
            >
              Create your first deal
            </a>
          </div>
        ) : (
          <div>
            <div className="mb-4 text-xs uppercase tracking-widest text-text-faded">
              Your deals
            </div>
            <div className="border border-border">
              {deals.map((deal, idx) => {
                const isWorker = deal.worker_wallet === walletAddress;
                const stateInfo = stateLabels[deal.state] || stateLabels.created;
                return (
                  
                 <a   key={deal.deal_id}
                    href={`/d/${deal.deal_id}`}
                    className={`block p-6 transition-colors hover:bg-surface ${
                      idx !== deals.length - 1 ? "border-b border-border" : ""
                    }`}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="mb-2 flex items-center gap-3">
                          <span
                            className={`inline-flex items-center gap-1.5 border border-lime/30 bg-lime/10 px-2 py-0.5 text-xs uppercase tracking-wider ${stateInfo.color}`}
                          >
                            {stateInfo.label}
                          </span>
                          <span className="text-xs text-text-faded">
                            {isWorker ? "You're the worker" : "You're the client"}
                          </span>
                        </div>
                        <div className="mb-1 font-medium text-text truncate">
                          {deal.title}
                        </div>
                        <div className="text-xs text-text-faded">
                          Deal #{deal.deal_id.slice(0, 8).toUpperCase()} ·{" "}
                          {new Date(deal.created_at).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold tabular-nums text-lime">
                          {(deal.amount_lamports / 1e9).toFixed(4)}
                        </div>
                        <div className="text-xs text-text-faded">
                          {deal.currency}
                        </div>
                      </div>
                    </div>
                  </a>
                );
              })}
            </div>
          </div>
        )}

        <div className="mt-12 border border-border p-6 md:p-8">
          <div className="mb-4 text-xs uppercase tracking-widest text-text-faded">
            Account
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <div className="mb-1 text-xs text-text-faded">Signed in as</div>
              <div className="text-sm text-text">{displayName}</div>
            </div>
            <div>
              <div className="mb-1 text-xs text-text-faded">Solana wallet</div>
              <div className="mb-2 font-mono text-sm text-text break-all">
                {walletAddress || "No wallet"}
              </div>
              {walletAddress && (
                <button
                  onClick={() => navigator.clipboard.writeText(walletAddress)}
                  className="text-xs text-lime hover:opacity-80"
                >
                  Copy address
                </button>
              )}
            </div>
          </div>
          <button
            onClick={logout}
            className="mt-6 border border-border bg-transparent px-5 py-3 text-sm font-medium text-text-muted transition-all hover:border-border-hover hover:text-text"
          >
            Sign out
          </button>
        </div>
      </div>
    </main>
  );
}