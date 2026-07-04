"use client";

import { PrivyProvider } from "@privy-io/react-auth";
import { useUserSync } from "@/hooks/useUserSync";

function UserSyncWrapper({ children }: { children: React.ReactNode }) {
  useUserSync();
  return <>{children}</>;
}

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
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
      <UserSyncWrapper>{children}</UserSyncWrapper>
    </PrivyProvider>
  );
}