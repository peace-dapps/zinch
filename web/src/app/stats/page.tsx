"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Nav from "@/components/landing/Nav";
import { PageLoader } from "@/components/ui/Spinner";

type Stats = {
  totalDeals: number;
  dealsLast30d: number;
  completedCount: number;
  refundedCount: number;
  disputedCount: number;
  inFlight: number;
  totalUsers: number;
  usersLast30d: number;
  totalVolumeCompletedLamports: number;
  totalFeesEarnedLamports: number;
  successRate: number;
  lastUpdated: string;
};

export default function StatsPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/stats");
        const data = await res.json();
        setStats(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <main className="relative min-h-screen">
        <Nav />
        <div className="mx-auto max-w-4xl px-6 pb-24 pt-32 md:px-8 md:pt-40">
          <PageLoader label="Loading platform stats" />
        </div>
      </main>
    );
  }

  if (!stats) {
    return (
      <main className="relative min-h-screen">
        <Nav />
        <div className="mx-auto max-w-2xl px-6 py-32 text-center md:px-8">
          <h1 className="text-3xl font-bold">Stats unavailable</h1>
        </div>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen">
      <Nav />

      <div className="mx-auto max-w-4xl px-6 pb-24 pt-32 md:px-8 md:pt-40">
        {/* Header */}
        <div className="mb-10">
          <div className="mb-2 flex items-baseline gap-2 font-mono text-xs uppercase tracking-widest text-lime">
            <span>[LIVE]</span>
            <span>PLATFORM STATS</span>
          </div>
          <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
            Zinch by the numbers.
          </h1>
          <p className="mt-4 max-w-2xl text-text-muted">
            Every metric below is generated live from on-chain Solana data and
            our public database. Updated every 60 seconds.
          </p>
        </div>

        {/* Headline volume */}
        <div className="mb-8 border border-lime/40 bg-lime/5 p-8 md:p-10">
          <div className="mb-3 text-xs uppercase tracking-widest text-lime">
            // TOTAL VOLUME COMPLETED
          </div>
          <div className="flex items-baseline gap-3">
            <div className="text-6xl font-bold tracking-tight tabular-nums text-lime md:text-7xl">
              {(stats.totalVolumeCompletedLamports / 1e9).toFixed(2)}
            </div>
            <div className="text-lg text-text-muted">SOL</div>
          </div>
          <div className="mt-3 text-sm text-text-faded">
            Across {stats.completedCount} completed deals.{" "}
            {(stats.totalFeesEarnedLamports / 1e9).toFixed(4)} SOL in platform fees.
          </div>
        </div>

        {/* Grid */}
        <div className="mb-10 grid grid-cols-2 gap-3 md:grid-cols-4">
          <StatCard label="Total deals" value={String(stats.totalDeals)} />
          <StatCard
            label="Last 30 days"
            value={String(stats.dealsLast30d)}
            hint="new deals"
          />
          <StatCard label="Total users" value={String(stats.totalUsers)} />
          <StatCard
            label="Last 30 days"
            value={String(stats.usersLast30d)}
            hint="new signups"
          />
          <StatCard
            label="In escrow now"
            value={String(stats.inFlight)}
            hint="active deals"
          />
          <StatCard
            label="Success rate"
            value={`${stats.successRate}%`}
            hint="completed / settled"
          />
          <StatCard
            label="Refunded"
            value={String(stats.refundedCount)}
            hint="worker gave back"
          />
          <StatCard
            label="Disputed"
            value={String(stats.disputedCount)}
            hint="all time"
          />
        </div>

        {/* Verify */}
        <div className="mb-10 border border-border bg-surface p-6 md:p-8">
          <div className="mb-3 text-xs uppercase tracking-widest text-text-faded">
            // VERIFY ON-CHAIN
          </div>
          <p className="mb-4 text-sm text-text-muted">
            Every deal is a Solana transaction. You can audit the smart contract
            directly.
          </p>
          
         <a   href="https://explorer.solana.com/address/3gm7tTj5meZP1tYjvE49zSzpjMmyywD5wqZ7jxPS7uDP?cluster=devnet"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 border border-lime px-4 py-2.5 text-sm text-lime transition-all hover:bg-lime/10"
          >
            View Zinch program on Solana Explorer ↗
          </a>
        </div>

        {/* Last updated + CTA */}
        <div className="flex flex-col items-center gap-4 border-t border-border pt-8 text-center">
          <div className="text-xs text-text-faded">
            Last updated:{" "}
            {new Date(stats.lastUpdated).toLocaleString("en-US", {
              dateStyle: "medium",
              timeStyle: "short",
            })}
          </div>
          <Link
            href="/new"
            className="bg-lime px-5 py-3 text-sm font-medium text-bg transition-all hover:opacity-90"
          >
            Create a deal
          </Link>
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
      <div className="text-2xl font-bold tabular-nums text-text md:text-3xl">
        {value}
      </div>
      {hint && <div className="mt-1 text-xs text-text-faded">{hint}</div>}
    </div>
  );
}