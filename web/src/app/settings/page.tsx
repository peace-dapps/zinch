"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { usePrivy } from "@privy-io/react-auth";
import { useWallet } from "@solana/wallet-adapter-react";
import Nav from "@/components/landing/Nav";
import { PageLoader, ButtonSpinner } from "@/components/ui/Spinner";
import { useToast } from "@/components/ui/Toast";

type UserRow = {
  privy_id: string;
  email: string | null;
  google_email: string | null;
  telegram_username: string | null;
  wallet_address: string | null;
  handle: string | null;
  display_name: string | null;
  bio: string | null;
  notify_accepted: boolean;
  notify_funded: boolean;
  notify_submitted: boolean;
  notify_completed: boolean;
  notify_refunded: boolean;
  notify_disputed: boolean;
};

export default function SettingsPage() {
  const router = useRouter();
  const { authenticated, ready, user, logout, login } = usePrivy();
  const { publicKey } = useWallet();
  const { showToast } = useToast();

  const [row, setRow] = useState<UserRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form state
  const [displayName, setDisplayName] = useState("");
  const [handle, setHandle] = useState("");
  const [bio, setBio] = useState("");
  const [handleChecking, setHandleChecking] = useState(false);
  const [handleAvailable, setHandleAvailable] = useState<boolean | null>(null);
  const [handleReason, setHandleReason] = useState<string | null>(null);
  const [notifs, setNotifs] = useState({
    accepted: true,
    funded: true,
    submitted: true,
    completed: true,
    refunded: true,
    disputed: true,
  });

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteInput, setDeleteInput] = useState("");
  const [deleting, setDeleting] = useState(false);

  // Fetch current user
  useEffect(() => {
    if (!ready || !authenticated || !user) return;
    (async () => {
      try {
        const res = await fetch(`/api/user/me?privyId=${user.id}`);
        const data = await res.json();
        if (data.user) {
          setRow(data.user);
          setDisplayName(data.user.display_name || "");
          setHandle(data.user.handle || "");
          setBio(data.user.bio || "");
          setNotifs({
            accepted: data.user.notify_accepted ?? true,
            funded: data.user.notify_funded ?? true,
            submitted: data.user.notify_submitted ?? true,
            completed: data.user.notify_completed ?? true,
            refunded: data.user.notify_refunded ?? true,
            disputed: data.user.notify_disputed ?? true,
          });
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, [ready, authenticated, user]);

  // Debounced handle availability check
  useEffect(() => {
    if (!handle || handle === row?.handle) {
      setHandleAvailable(null);
      setHandleReason(null);
      return;
    }

    setHandleChecking(true);
    const timer = setTimeout(async () => {
      try {
        const res = await fetch("/api/user/check-handle", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            handle,
            excludePrivyId: user?.id,
          }),
        });
        const data = await res.json();
        setHandleAvailable(data.available);
        setHandleReason(data.reason || null);
      } catch {
        setHandleAvailable(null);
      } finally {
        setHandleChecking(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [handle, row?.handle, user?.id]);

  const saveProfile = useCallback(async () => {
    if (!user || !row) return;
    if (handle && handleAvailable === false) {
      showToast(handleReason || "Handle isn't valid", "error");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/user/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          privyId: user.id,
          display_name: displayName || null,
          handle: handle || null,
          bio: bio || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || "Failed to save", "error");
      } else {
        setRow(data.user);
        showToast("Profile saved", "success");
      }
    } catch (err: any) {
      showToast(err.message || "Failed to save", "error");
    } finally {
      setSaving(false);
    }
  }, [user, row, displayName, handle, bio, handleAvailable, handleReason, showToast]);

  const saveNotifs = useCallback(
    async (updated: typeof notifs) => {
      if (!user) return;
      setNotifs(updated);
      try {
        const res = await fetch("/api/user/update", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            privyId: user.id,
            notify_accepted: updated.accepted,
            notify_funded: updated.funded,
            notify_submitted: updated.submitted,
            notify_completed: updated.completed,
            notify_refunded: updated.refunded,
            notify_disputed: updated.disputed,
          }),
        });
        if (!res.ok) {
          const data = await res.json();
          showToast(data.error || "Failed to save preferences", "error");
        }
      } catch {
        showToast("Failed to save preferences", "error");
      }
    },
    [user, showToast]
  );

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    showToast(`${label} copied`, "success");
  };

  const deleteAccount = async () => {
    if (!user) return;
    if (deleteInput !== "DELETE") {
      showToast("Type DELETE to confirm", "error");
      return;
    }
    setDeleting(true);
    try {
      const res = await fetch("/api/user/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ privyId: user.id }),
      });
      if (!res.ok) {
        const data = await res.json();
        showToast(data.error || "Failed to delete", "error");
      } else {
        showToast("Account deleted", "success");
        await logout();
        router.push("/");
      }
    } catch (err: any) {
      showToast(err.message || "Failed", "error");
    } finally {
      setDeleting(false);
    }
  };

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
          <h1 className="mb-4 text-4xl font-bold tracking-tight">
            Sign in to view settings
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

  if (loading) {
    return (
      <main className="relative min-h-screen">
        <Nav />
        <div className="mx-auto max-w-3xl px-6 pb-24 pt-32 md:px-8 md:pt-40">
          <PageLoader label="Loading settings" />
        </div>
      </main>
    );
  }

  const phantomAddress = publicKey?.toBase58() || null;
  const privyEmbeddedAddress = user?.wallet?.address || null;

  return (
    <main className="relative min-h-screen">
      <Nav />

      <div className="mx-auto max-w-3xl px-6 pb-24 pt-32 md:px-8 md:pt-40">
        <div className="mb-10">
          <div className="mb-2 text-xs uppercase tracking-widest text-text-faded">
            // SETTINGS
          </div>
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
            Settings
          </h1>
          <p className="mt-2 text-sm text-text-muted">
            Manage your profile, notifications, and wallets.
          </p>
        </div>

        {/* Profile */}
        <section className="mb-12">
          <h2 className="mb-4 text-sm uppercase tracking-widest text-text-faded">
            Profile
          </h2>

          <div className="border border-border bg-surface p-6 space-y-6">
            <div>
              <label className="mb-2 block text-xs uppercase tracking-widest text-text-faded">
                Display name
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Your name"
                maxLength={50}
                className="w-full border border-border bg-bg px-4 py-3 text-sm text-text placeholder:text-text-faded focus:border-lime focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-2 block text-xs uppercase tracking-widest text-text-faded">
                Handle
              </label>
              <div className="flex items-center border border-border bg-bg focus-within:border-lime">
                <span className="pl-4 text-sm text-text-muted">@</span>
                <input
                  type="text"
                  value={handle}
                  onChange={(e) =>
                    setHandle(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ""))
                  }
                  placeholder="your-handle"
                  maxLength={30}
                  className="flex-1 bg-transparent px-2 py-3 text-sm text-text placeholder:text-text-faded focus:outline-none"
                />
              </div>
              <div className="mt-2 text-xs">
                {handleChecking && <span className="text-text-faded">Checking...</span>}
                {!handleChecking && handleAvailable === true && (
                  <span className="text-lime">Available</span>
                )}
                {!handleChecking && handleAvailable === false && (
                  <span className="text-red-400">{handleReason}</span>
                )}
                {handle === row?.handle && (
                  <span className="text-text-faded">Your current handle</span>
                )}
                {!handle && (
                  <span className="text-text-faded">
                    3-30 lowercase letters, numbers, dashes, or underscores
                  </span>
                )}
              </div>
              {row?.handle && (
                <div className="mt-2 text-xs text-text-faded">
                  Your profile:{" "}
                  
                 <a   href={`/u/${row.handle}`}
                    className="text-lime hover:underline"
                  >
                    zinch.app/u/{row.handle}
                  </a>
                </div>
              )}
            </div>

            <div>
              <label className="mb-2 block text-xs uppercase tracking-widest text-text-faded">
                Bio
              </label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value.slice(0, 160))}
                placeholder="Short bio for your profile"
                rows={3}
                className="w-full resize-none border border-border bg-bg px-4 py-3 text-sm text-text placeholder:text-text-faded focus:border-lime focus:outline-none"
              />
              <div className="mt-1 text-right text-xs text-text-faded">
                {bio.length}/160
              </div>
            </div>

            <button
              onClick={saveProfile}
              disabled={saving}
              className="bg-lime px-5 py-2.5 text-sm font-medium text-bg transition-all hover:opacity-90 disabled:opacity-50"
            >
              {saving ? <ButtonSpinner label="Saving" /> : "Save profile"}
            </button>
          </div>
        </section>

        {/* Notifications */}
        <section className="mb-12">
          <h2 className="mb-4 text-sm uppercase tracking-widest text-text-faded">
            Email notifications
          </h2>

          <div className="border border-border bg-surface p-6 space-y-3">
            <p className="mb-4 text-xs text-text-muted">
              You&apos;ll get an email at{" "}
              <span className="text-text">
                {row?.email || row?.google_email || "your account address"}
              </span>{" "}
              when these things happen on your deals.
            </p>

            {[
              { key: "accepted", label: "Deal accepted" },
              { key: "funded", label: "Escrow funded" },
              { key: "submitted", label: "Work submitted" },
              { key: "completed", label: "Deal completed / funds released" },
              { key: "refunded", label: "Deal refunded" },
              { key: "disputed", label: "Dispute opened" },
            ].map((item) => {
              const checked = (notifs as any)[item.key];
              return (
                <label
                  key={item.key}
                  className="flex cursor-pointer items-center justify-between border-b border-border py-3 last:border-0"
                >
                  <span className="text-sm text-text">{item.label}</span>
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={(e) =>
                      saveNotifs({ ...notifs, [item.key]: e.target.checked })
                    }
                    className="h-4 w-4 accent-lime"
                  />
                </label>
              );
            })}
          </div>
        </section>

        {/* Wallets */}
        <section className="mb-12">
          <h2 className="mb-4 text-sm uppercase tracking-widest text-text-faded">
            Wallets
          </h2>

          <div className="space-y-3">
            <div className="border border-border bg-surface p-5">
              <div className="mb-1 flex items-center gap-2">
                <div className="text-xs uppercase tracking-widest text-text-faded">
                  Phantom (used for signing)
                </div>
              </div>
              {phantomAddress ? (
                <div className="flex items-center gap-3">
                  <div className="flex-1 break-all font-mono text-xs text-text">
                    {phantomAddress}
                  </div>
                  <button
                    onClick={() => copyToClipboard(phantomAddress, "Phantom address")}
                    className="shrink-0 border border-border px-3 py-1.5 text-xs text-text transition-all hover:border-border-hover"
                  >
                    Copy
                  </button>
                </div>
              ) : (
                <div className="text-sm text-text-muted">
                  Phantom not connected. Connect from the Nav bar to see your address.
                </div>
              )}
            </div>

            {privyEmbeddedAddress && (
              <div className="border border-border bg-surface p-5">
                <div className="mb-1 text-xs uppercase tracking-widest text-text-faded">
                  Privy embedded wallet
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-1 break-all font-mono text-xs text-text">
                    {privyEmbeddedAddress}
                  </div>
                  <button
                    onClick={() => copyToClipboard(privyEmbeddedAddress, "Privy address")}
                    className="shrink-0 border border-border px-3 py-1.5 text-xs text-text transition-all hover:border-border-hover"
                  >
                    Copy
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Account */}
        <section className="mb-12">
          <h2 className="mb-4 text-sm uppercase tracking-widest text-text-faded">
            Account
          </h2>

          <div className="border border-border bg-surface p-5 space-y-4">
            <div>
              <div className="mb-1 text-xs uppercase tracking-widest text-text-faded">
                Signed in as
              </div>
              <div className="text-sm text-text">
                {row?.email || row?.google_email || "—"}
              </div>
            </div>

            <button
              onClick={() => logout()}
              className="border border-border px-4 py-2 text-sm text-text-muted transition-all hover:border-border-hover hover:text-text"
            >
              Sign out
            </button>
          </div>
        </section>

        {/* Danger zone */}
        <section>
          <h2 className="mb-4 text-sm uppercase tracking-widest text-red-400">
            Danger zone
          </h2>

          <div className="border border-red-500/30 bg-red-500/5 p-6">
            <h3 className="mb-2 text-sm font-medium text-text">Delete account</h3>
            <p className="mb-4 text-xs text-text-muted">
              Removes your Zinch account and email notification settings. Your
              on-chain deals stay on Solana and cannot be deleted. This action
              cannot be undone.
            </p>

            {!showDeleteConfirm ? (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="border border-red-500/50 px-4 py-2 text-sm font-medium text-red-400 transition-all hover:bg-red-500/10"
              >
                Delete account
              </button>
            ) : (
              <div className="space-y-3">
                <div className="text-xs text-text-muted">
                  Type <span className="font-mono text-red-400">DELETE</span> to confirm:
                </div>
                <input
                  type="text"
                  value={deleteInput}
                  onChange={(e) => setDeleteInput(e.target.value)}
                  className="w-full border border-border bg-bg px-3 py-2 font-mono text-sm text-text focus:border-red-500 focus:outline-none"
                />
                <div className="flex gap-2">
                  <button
                    onClick={deleteAccount}
                    disabled={deleting || deleteInput !== "DELETE"}
                    className="border border-red-500/50 bg-red-500/10 px-4 py-2 text-sm font-medium text-red-400 transition-all hover:bg-red-500/20 disabled:opacity-50"
                  >
                    {deleting ? <ButtonSpinner label="Deleting" /> : "Confirm delete"}
                  </button>
                  <button
                    onClick={() => {
                      setShowDeleteConfirm(false);
                      setDeleteInput("");
                    }}
                    disabled={deleting}
                    className="border border-border px-4 py-2 text-sm text-text-muted transition-all hover:border-border-hover hover:text-text disabled:opacity-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}