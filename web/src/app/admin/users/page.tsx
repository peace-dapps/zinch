"use client";

import { useCallback, useEffect, useState } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { useWallet } from "@solana/wallet-adapter-react";
import Nav from "@/components/landing/Nav";
import { PageLoader } from "@/components/ui/Spinner";
import { useToast } from "@/components/ui/Toast";
import { AdminTabs } from "../page";

type UserRow = {
  id: string;
  privy_id: string;
  email: string | null;
  google_email: string | null;
  handle: string | null;
  display_name: string | null;
  wallet_address: string | null;
  telegram_username: string | null;
  created_at: string;
  banned: boolean;
  stats: {
    total: number;
    completed: number;
    volume: number;
  };
};

export default function AdminUsersPage() {
  const { ready, authenticated } = usePrivy();
  const { publicKey, connected } = useWallet();
  const { showToast } = useToast();
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [unauthorized, setUnauthorized] = useState(false);
  const [q, setQ] = useState("");
  const [sort, setSort] = useState("created_at");

  const walletAddress = publicKey?.toBase58() || null;

  const fetchUsers = useCallback(async () => {
    if (!walletAddress) return;
    setLoading(true);
    try {
      const params = new URLSearchParams({
        adminWallet: walletAddress,
        sort,
        q,
      });
      const res = await fetch(`/api/admin/users?${params}`);
      if (res.status === 403) {
        setUnauthorized(true);
        return;
      }
      const data = await res.json();
      setUsers(data.users || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [walletAddress, sort, q]);

  useEffect(() => {
    if (!walletAddress) return;
    const timer = setTimeout(fetchUsers, 300);
    return () => clearTimeout(timer);
  }, [walletAddress, fetchUsers]);

  const toggleBan = async (userId: string, currentBanned: boolean) => {
    try {
      const res = await fetch("/api/admin/users/ban", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          adminWallet: walletAddress,
          userId,
          banned: !currentBanned,
        }),
      });
      if (!res.ok) {
        showToast("Failed to update", "error");
      } else {
        showToast(
          currentBanned ? "User unbanned" : "User banned",
          "success"
        );
        fetchUsers();
      }
    } catch {
      showToast("Failed to update", "error");
    }
  };

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

  return (
    <main className="relative min-h-screen">
      <Nav />

      <div className="mx-auto max-w-6xl px-6 pb-24 pt-32 md:px-8 md:pt-40">
        <div className="mb-8">
          <div className="mb-2 flex items-baseline gap-2 font-mono text-xs uppercase tracking-widest text-lime">
            <span>[ADMIN]</span>
            <span>USER MANAGEMENT</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
            Users
          </h1>
        </div>

        <AdminTabs current="users" />

        {/* Filters */}
        <div className="mb-6 flex flex-col gap-3 md:flex-row">
          <input
            type="text"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by email, handle, wallet, name..."
            className="flex-1 border border-border bg-bg px-4 py-2.5 text-sm text-text placeholder:text-text-faded focus:border-lime focus:outline-none"
          />
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="border border-border bg-bg px-3 py-2.5 text-sm text-text focus:border-lime focus:outline-none"
          >
            <option value="created_at">Newest first</option>
            <option value="handle">By handle</option>
          </select>
        </div>

        {loading ? (
          <PageLoader label="Loading users" />
        ) : users.length === 0 ? (
          <div className="border border-border bg-surface p-12 text-center text-sm text-text-muted">
            No users found.
          </div>
        ) : (
          <div className="border border-border bg-surface overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="p-4 text-left text-xs uppercase tracking-widest text-text-faded">
                    User
                  </th>
                  <th className="p-4 text-left text-xs uppercase tracking-widest text-text-faded">
                    Wallet
                  </th>
                  <th className="p-4 text-right text-xs uppercase tracking-widest text-text-faded">
                    Deals
                  </th>
                  <th className="p-4 text-right text-xs uppercase tracking-widest text-text-faded">
                    Volume
                  </th>
                  <th className="p-4 text-left text-xs uppercase tracking-widest text-text-faded">
                    Joined
                  </th>
                  <th className="p-4 text-right text-xs uppercase tracking-widest text-text-faded">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr
                    key={user.id}
                    className={`border-b border-border last:border-0 ${
                      user.banned ? "opacity-50" : ""
                    }`}
                  >
                    <td className="p-4">
                      <div className="font-medium text-text">
                        {user.display_name || (user.handle ? `@${user.handle}` : "—")}
                      </div>
                      <div className="text-xs text-text-faded">
                        {user.email || user.google_email || "—"}
                      </div>
                      {user.banned && (
                        <span className="mt-1 inline-block font-mono text-xs text-red-400">
                          [BANNED]
                        </span>
                      )}
                    </td>
                    <td className="p-4">
                      {user.wallet_address ? (
                        <div className="font-mono text-xs text-text-muted">
                          {user.wallet_address.slice(0, 6)}...{user.wallet_address.slice(-6)}
                        </div>
                      ) : (
                        <div className="text-xs text-text-faded">—</div>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <div className="text-sm text-text tabular-nums">
                        {user.stats.completed} / {user.stats.total}
                      </div>
                      <div className="text-xs text-text-faded">completed</div>
                    </td>
                    <td className="p-4 text-right">
                      <div className="text-sm text-lime tabular-nums">
                        {(user.stats.volume / 1e9).toFixed(2)}
                      </div>
                      <div className="text-xs text-text-faded">SOL</div>
                    </td>
                    <td className="p-4 text-left">
                      <div className="text-xs text-text-muted">
                        {new Date(user.created_at).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => toggleBan(user.id, user.banned)}
                        className={`border px-3 py-1.5 text-xs transition-all ${
                          user.banned
                            ? "border-lime/40 bg-lime/5 text-lime hover:bg-lime/10"
                            : "border-red-500/40 bg-red-500/5 text-red-400 hover:bg-red-500/10"
                        }`}
                      >
                        {user.banned ? "Unban" : "Ban"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}