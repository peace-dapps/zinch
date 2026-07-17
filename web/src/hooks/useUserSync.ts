"use client";

import { useEffect } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { useWallet } from "@solana/wallet-adapter-react";

export function useUserSync() {
  const { authenticated, user, ready } = usePrivy();
  const { publicKey, connected } = useWallet();

  useEffect(() => {
    if (!ready || !authenticated || !user) return;

    const syncUser = async () => {
      try {
        // Prefer connected Phantom wallet; fall back to Privy embedded wallet
        const phantomAddress = connected ? publicKey?.toBase58() : null;
        const walletAddress = phantomAddress || user.wallet?.address;

        const res = await fetch("/api/sync-user", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            privyId: user.id,
            email: user.email?.address,
            googleEmail: user.google?.email,
            telegramUsername: user.telegram?.username,
            walletAddress,
          }),
        });

        if (!res.ok) {
          console.error("Failed to sync user:", await res.text());
        } else {
          const data = await res.json();
          console.log("User synced:", data.user?.wallet_address);
        }
      } catch (err) {
        console.error("User sync error:", err);
      }
    };

    syncUser();
  }, [ready, authenticated, user, connected, publicKey]);
}