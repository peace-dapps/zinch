"use client";

import { useEffect, useState } from "react";
import { use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { usePrivy } from "@privy-io/react-auth";
import Nav from "@/components/landing/Nav";
import { PageLoader } from "@/components/ui/Spinner";
import { useToast } from "@/components/ui/Toast";
import { useWallet } from "@solana/wallet-adapter-react";

type Profile = {
  user: {
    id: string;
    handle: string;
    display_name: string | null;
    bio: string | null;
    wallet_address: string;
    created_at: string;
  };
  stats: {
    dealsCompleted: number;
    dealsAsWorker: number;
    dealsAsClient: number;
    volumeAsWorker: number;
    volumeAsClient: number;
    successRate: number;
  };
  recentDeals: Array<{
    deal_id: string;
    title: string;
    amount_lamports: number;
    currency: string;
    completed_at: string;
    worker_wallet: string;
    client_wallet: string;
  }>;
};

export default function ProfilePage({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  const { handle } = use(params);
  const router = useRouter();
  const { authenticated, login } = usePrivy();
  const { publicKey } = useWallet();
  const { showToast } = useToast();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`/api/user/${handle.toLowerCase()}`);
        if (!res.ok) {
          setNotFound(true);
        } else {
          const data = await res.json();
          setProfile(data);
        }
      } catch {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    })();
  }, [handle]);

  const copyWallet = () => {
    if (!profile) return;
    navigator.clipboard.writeText(profile.user.wallet_address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    showToast("Wallet address copied", "success");
  };

  const startDealWith = () => {
    if (!profile) return;
    if (!authenticated) {
      login();
      return;
    }
    router.push(
      `/new?counterparty=${encodeURIComponent(profile.user.wallet_address)}`
    );
  };

  if (loading) {
    return (
      <main className="relative min-h-screen">
        <Nav />
        <div className="mx-auto max-w-3xl px-6 pb-24 pt-32 md:px-8 md:pt-40">
          <PageLoader label="Loading profile" />
        </div>
      </main>
    );
  }

  if (notFound || !profile) {
    return (
      <main className="relative min-h-screen">
        <Nav />
        <div className="mx-auto max-w-2xl px-6 py-32 text-center md:px-8">
          <div className="mb-4 text-xs uppercase tracking-widest text-red-400">
            // NOT FOUND
          </div>
          <h1 className="mb-4 text-4xl font-bold tracking-tight sm:text-5xl">
            Profile not found.
          </h1>
          <p className="mb-6 text-text-muted">
            @{handle} doesn&apos;t exist on Zinch.
          </p>
          <Link href="/" className="text-sm text-lime hover:underline">
            ← Back to Zinch
          </Link>
        </div>
      </main>
    );
  }

  const { user, stats, recentDeals } = profile;
  const displayName = user.display_name || `@${user.handle}`;
  const initial = displayName.charAt(0).toUpperCase();
  const joinDate = new Date(user.created_at).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
  });

  return (
    <main className="relative min-h-screen">
      <Nav />

      <div className="mx-auto max-w-3xl px-6 pb-24 pt-32 md:px-8 md:pt-40">
        {/* Header */}
        <div className="mb-10 flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div className="flex items-start gap-5">
            {/* Avatar */}
            <div className="flex h-20 w-20 shrink-0 items-center justify-center border border-lime bg-lime/10 text-3xl font-bold text-lime">
              {initial}
            </div>

            <div>
              <div className="mb-1 text-xs uppercase tracking-widest text-text-faded">
                // PROFILE
              </div>
              <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
                {displayName}
              </h1>
              <div className="mt-1 text-sm text-text-muted">@{user.handle}</div>
              <div className="mt-2 text-xs text-text-faded">
                Member since {joinDate}
              </div>
            </div>
          </div>

          <button
            onClick={startDealWith}
            className="inline-flex items-center justify-center bg-lime px-5 py-3 text-sm font-medium text-bg transition-all hover:opacity-90"
          >
            Start a deal with @{user.handle}
          </button>
        </div>

{/* Report */}
        <ReportButton
          reporterWallet={publicKey?.toBase58() || null}
          reportedWallet={user.wallet_address}
          reportedHandle={user.handle}
        />

        {/* Bio */}
        {user.bio && (
          <div className="mb-10 border border-border bg-surface p-6">
            <p className="text-sm leading-relaxed text-text">{user.bio}</p>
          </div>
        )}

        {/* Wallet */}
        <div className="mb-10 border border-border bg-surface p-5">
          <div className="mb-2 text-xs uppercase tracking-widest text-text-faded">
            Wallet
          </div>
          <div className="flex items-center gap-3">
            <div className="flex-1 break-all font-mono text-xs text-text">
              {user.wallet_address}
            </div>
            <button
              onClick={copyWallet}
              className="shrink-0 border border-border px-3 py-1.5 text-xs text-text transition-all hover:border-border-hover"
            >
              {copied ? "Copied" : "Copy"}
            </button>
            
            <a  href={`https://explorer.solana.com/address/${user.wallet_address}?cluster=devnet`}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 border border-border px-3 py-1.5 text-xs text-text-muted transition-all hover:border-border-hover hover:text-text"
              title="View on Explorer"
            >
              ↗
            </a>
          </div>
        </div>

        {/* Stats */}
        <div className="mb-10">
          <div className="mb-4 text-xs uppercase tracking-widest text-text-faded">
            Stats
          </div>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <StatCard
              label="Deals completed"
              value={String(stats.dealsCompleted)}
            />
            <StatCard
              label="Success rate"
              value={`${stats.successRate}%`}
            />
            <StatCard
              label="Earned as worker"
              value={`${(stats.volumeAsWorker / 1e9).toFixed(2)} SOL`}
            />
            <StatCard
              label="Spent as client"
              value={`${(stats.volumeAsClient / 1e9).toFixed(2)} SOL`}
            />
          </div>
        </div>

        {/* Recent deals */}
        <div>
          <div className="mb-4 text-xs uppercase tracking-widest text-text-faded">
            Recent completed deals
          </div>
          {recentDeals.length === 0 ? (
            <div className="border border-border bg-surface p-8 text-center text-sm text-text-muted">
              No completed deals yet.
            </div>
          ) : (
            <div className="space-y-2">
              {recentDeals.map((deal) => {
                const isWorker = deal.worker_wallet === user.wallet_address;
                return (
                  <Link
                    key={deal.deal_id}
                    href={`/r/${deal.deal_id}`}
                    className="block border border-border bg-surface p-4 transition-all hover:border-border-hover"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="mb-1 flex items-center gap-2 text-xs">
                          <span className="uppercase tracking-widest text-text">
                            Completed
                          </span>
                          <span className="text-text-faded">·</span>
                          <span className="text-text-faded">
                            {isWorker ? "as Worker" : "as Client"}
                          </span>
                        </div>
                        <div className="truncate text-sm font-medium text-text">
                          {deal.title}
                        </div>
                        <div className="mt-1 text-xs text-text-faded">
                          {new Date(
                            deal.completed_at
                          ).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
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
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-border bg-surface p-4">
      <div className="mb-1 text-xs uppercase tracking-wider text-text-faded">
        {label}
      </div>
      <div className="text-xl font-bold tracking-tight tabular-nums text-text">
        {value}
      </div>
    </div>
  );
}
function ReportButton({
  reporterWallet,
  reportedWallet,
  reportedHandle,
}: {
  reporterWallet: string | null;
  reportedWallet: string;
  reportedHandle: string;
}) {
  const [showForm, setShowForm] = useState(false);
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { showToast } = useToast();

  if (!reporterWallet || reporterWallet === reportedWallet) return null;
  if (submitted) {
    return (
      <div className="mb-10 text-center text-xs text-text-faded">
        Report submitted. We&apos;ll review it.
      </div>
    );
  }

  if (!showForm) {
    return (
      <div className="mb-10 text-center">
        <button
          onClick={() => setShowForm(true)}
          className="text-xs text-text-faded transition-colors hover:text-red-400"
        >
          Report this user
        </button>
      </div>
    );
  }

  const submit = async () => {
    if (!reason.trim()) {
      showToast("Please describe the issue", "error");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/user/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reporterWallet,
          reportedWallet,
          reportedHandle,
          reason: reason.trim(),
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        showToast(data.error || "Failed to submit report", "error");
      } else {
        setSubmitted(true);
        showToast("Report submitted", "success");
      }
    } catch {
      showToast("Failed to submit report", "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mb-10 border border-red-500/20 bg-red-500/5 p-5">
      <div className="mb-3 text-xs uppercase tracking-widest text-red-400">
        Report @{reportedHandle}
      </div>
      <textarea
        value={reason}
        onChange={(e) => setReason(e.target.value.slice(0, 500))}
        placeholder="Describe the issue (scam, harassment, fake profile, etc.)"
        rows={3}
        className="mb-3 w-full resize-none border border-border bg-bg px-3 py-2 text-sm text-text placeholder:text-text-faded focus:border-red-400 focus:outline-none"
      />
      <div className="flex items-center justify-between">
        <div className="text-xs text-text-faded">{reason.length}/500</div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowForm(false)}
            className="border border-border px-3 py-1.5 text-xs text-text-muted transition-all hover:text-text"
          >
            Cancel
          </button>
          <button
            onClick={submit}
            disabled={submitting || !reason.trim()}
            className="border border-red-500/40 bg-red-500/10 px-3 py-1.5 text-xs text-red-400 transition-all hover:bg-red-500/20 disabled:opacity-50"
          >
            {submitting ? "Submitting..." : "Submit report"}
          </button>
        </div>
      </div>
    </div>
  );
}