"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePrivy } from "@privy-io/react-auth";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import Nav from "@/components/landing/Nav";
import { PageLoader } from "@/components/ui/Spinner";

type Stats = {
  overview: {
    totalDeals: number;
    dealsLast7d: number;
    dealsLast30d: number;
    volumeLocked: number;
    volumeCompleted: number;
    feesEarned: number;
    totalUsers: number;
    usersLast7d: number;
    usersLast30d: number;
    activeUsersLast30d: number;
  };
  stateBreakdown: Record<string, number>;
};

export default function AdminPage() {
  const { ready, authenticated, login } = usePrivy();
  const { publicKey, connected } = useWallet();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [unauthorized, setUnauthorized] = useState(false);

  const walletAddress = publicKey?.toBase58() || null;

  useEffect(() => {
    if (!walletAddress) return;
    (async () => {
      try {
        const res = await fetch(`/api/admin/stats?adminWallet=${walletAddress}`);
        if (res.status === 403) {
          setUnauthorized(true);
          return;
        }
        const data = await res.json();
        setStats(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, [walletAddress]);

  if (!ready) {
    return (
      <main className="relative min-h-screen">
        <Nav />
        <PageLoader label="Loading" />
      </main>
    );
  }

  if (!authenticated) {
    return (
      <main className="relative min-h-screen">
        <Nav />
        <div className="mx-auto max-w-2xl px-6 py-32 text-center md:px-8">
          <h1 className="mb-4 text-3xl font-bold tracking-tight">
            Admin sign-in required
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

  if (!connected) {
    return (
      <main className="relative min-h-screen">
        <Nav />
        <div className="mx-auto max-w-2xl px-6 py-32 text-center md:px-8">
          <div className="mb-4 text-xs uppercase tracking-widest text-lime">
            // ADMIN
          </div>
          <h1 className="mb-4 text-3xl font-bold tracking-tight">
            Connect your admin wallet
          </h1>
          <p className="mb-8 text-text-muted">
            Only whitelisted wallets can access this page.
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

  if (unauthorized) {
    return (
      <main className="relative min-h-screen">
        <Nav />
        <div className="mx-auto max-w-2xl px-6 py-32 text-center md:px-8">
          <div className="mb-4 flex items-baseline justify-center gap-2 font-mono text-xs uppercase tracking-widest text-red-400">
            <span>[×]</span>
            <span>ACCESS DENIED</span>
          </div>
          <h1 className="mb-4 text-3xl font-bold tracking-tight">
            Not authorized
          </h1>
          <p className="text-text-muted">
            Wallet <span className="font-mono">{walletAddress?.slice(0, 6)}...{walletAddress?.slice(-6)}</span> isn&apos;t
            on the admin list.
          </p>
        </div>
      </main>
    );
  }

  if (loading || !stats) {
    return (
      <main className="relative min-h-screen">
        <Nav />
        <div className="mx-auto max-w-6xl px-6 pb-24 pt-32 md:px-8 md:pt-40">
          <PageLoader label="Loading admin data" />
        </div>
      </main>
    );
  }

  const { overview, stateBreakdown } = stats;

  return (
    <main className="relative min-h-screen">
      <Nav />

      <div className="mx-auto max-w-6xl px-6 pb-24 pt-32 md:px-8 md:pt-40">
        {/* Header */}
        <div className="mb-8">
          <div className="mb-2 flex items-baseline gap-2 font-mono text-xs uppercase tracking-widest text-lime">
            <span>[ADMIN]</span>
            <span>PLATFORM OPERATOR</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
            Overview
          </h1>
        </div>

        {/* Admin tabs */}
        <AdminTabs current="overview" />

        {/* Revenue highlight */}
        <div className="mb-10 border border-lime/40 bg-lime/5 p-8">
          <div className="mb-2 text-xs uppercase tracking-widest text-lime">
            // PLATFORM REVENUE (ALL TIME)
          </div>
          <div className="flex items-baseline gap-3">
            <div className="text-6xl font-bold tracking-tight tabular-nums text-lime md:text-7xl">
              {(overview.feesEarned / 1e9).toFixed(4)}
            </div>
            <div className="text-sm tracking-wide text-text-muted">SOL</div>
          </div>
          <div className="mt-2 text-xs text-text-faded">
            From {overview.totalDeals} deals, {(overview.volumeCompleted / 1e9).toFixed(2)} SOL total volume completed
          </div>
        </div>

        {/* Grid stats */}
        <div className="mb-10 grid grid-cols-2 gap-3 md:grid-cols-4">
          <StatCard
            label="Total deals"
            value={String(overview.totalDeals)}
            hint={`+${overview.dealsLast7d} in 7d`}
          />
          <StatCard
            label="Total users"
            value={String(overview.totalUsers)}
            hint={`+${overview.usersLast7d} in 7d`}
          />
          <StatCard
            label="Locked in escrow"
            value={`${(overview.volumeLocked / 1e9).toFixed(2)} SOL`}
            hint="Active funds"
          />
          <StatCard
            label="Volume completed"
            value={`${(overview.volumeCompleted / 1e9).toFixed(2)} SOL`}
            hint="All-time settled"
          />
          <StatCard
            label="Deals last 30d"
            value={String(overview.dealsLast30d)}
          />
          <StatCard
            label="Users last 30d"
            value={String(overview.usersLast30d)}
            hint="New signups"
          />
          <StatCard
            label="Active users 30d"
            value={String(overview.activeUsersLast30d)}
          />
          <StatCard
            label="Fees earned"
            value={`${(overview.feesEarned / 1e9).toFixed(4)} SOL`}
            hint="Revenue"
          />
        </div>

        {/* State breakdown */}
        <div>
          <h2 className="mb-4 text-sm uppercase tracking-widest text-text-faded">
            Deal state breakdown
          </h2>
          <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
            {Object.entries(stateBreakdown).map(([state, count]) => (
              <div
                key={state}
                className="border border-border bg-surface p-4"
              >
                <div className="mb-1 font-mono text-xs uppercase tracking-widest text-text-faded">
                  {state.toUpperCase()}
                </div>
                <div className="text-2xl font-bold tabular-nums text-text">
                  {count}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}

export function AdminTabs({ current }: { current: string }) {
  const tabs = [
    { key: "overview", label: "Overview", href: "/admin" },
    { key: "users", label: "Users", href: "/admin/users" },
    { key: "deals", label: "Deals", href: "/admin/deals" },
    { key: "revenue", label: "Revenue", href: "/admin/revenue" },
  ];

  return (
    <div className="mb-10 flex flex-wrap gap-1 border-b border-border">
      {tabs.map((tab) => (
        <Link
          key={tab.key}
          href={tab.href}
          className={`border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
            current === tab.key
              ? "border-lime text-lime"
              : "border-transparent text-text-muted hover:text-text"
          }`}
        >
          {tab.label}
        </Link>
      ))}
    </div>
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
      <div className="text-xl font-bold tabular-nums text-text md:text-2xl">
        {value}
      </div>
      {hint && <div className="mt-1 text-xs text-text-faded">{hint}</div>}
    </div>
  );
}