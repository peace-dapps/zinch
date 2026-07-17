"use client";

import { PrivyProvider } from "@privy-io/react-auth";
import { useUserSync } from "@/hooks/useUserSync";
import { useMemo } from "react";
import { ToastProvider } from "@/components/ui/Toast";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-wallets";

import "@solana/wallet-adapter-react-ui/styles.css";

function UserSyncWrapper({ children }: { children: React.ReactNode }) {
  useUserSync();
  return <>{children}</>;
}

export default function Providers({ children }: { children: React.ReactNode }) {
  const endpoint =
    process.env.NEXT_PUBLIC_SOLANA_RPC || "https://api.devnet.solana.com";

  const wallets = useMemo(() => [new PhantomWalletAdapter()], []);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <PrivyProvider
            appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID!}
            config={{
              appearance: {
                theme: "dark",
                accentColor: "#C4FF3E",
                showWalletLoginFirst: false,
              },
              loginMethods: ["email", "google", "telegram"],
              embeddedWallets: {
                solana: {
                  createOnLogin: "users-without-wallets",
                },
              },
            }}
          >
            <ToastProvider>
  <UserSyncWrapper>{children}</UserSyncWrapper>
</ToastProvider>
          </PrivyProvider>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}