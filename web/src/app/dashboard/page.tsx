"use client";

import { usePrivy } from "@privy-io/react-auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Nav from "@/components/landing/Nav";

export default function Dashboard() {
  const { ready, authenticated, user, logout } = usePrivy();
  const router = useRouter();

  useEffect(() => {
    if (ready && !authenticated) {
      router.push("/");
    }
  }, [ready, authenticated, router]);

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

  const walletAddress = user?.wallet?.address;
  const shortWallet = walletAddress
    ? `${walletAddress.slice(0, 4)}...${walletAddress.slice(-4)}`
    : "No wallet";

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

          <a
            href="/new"
            className="inline-block bg-lime px-7 py-4 text-sm font-medium tracking-tight text-bg transition-all hover:opacity-90"
          >
            + Create a deal
          </a>
        </div>

        <div className="mb-12 grid grid-cols-2 gap-px border border-border bg-border md:grid-cols-4">
          {[
            { label: "Active deals", value: "0" },
            { label: "Pending action", value: "0" },
            { label: "Total locked", value: "0 SOL" },
            { label: "Total earned", value: "0 SOL" },
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
          
          <a  href="/new"
            className="inline-block bg-lime px-7 py-4 text-sm font-medium tracking-tight text-bg transition-all hover:opacity-90"
          >
            Create your first deal
          </a>
        </div>

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
      onClick={() => {
        navigator.clipboard.writeText(walletAddress);
      }}
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