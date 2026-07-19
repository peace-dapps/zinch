import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create a deal",
  description: "Start a new escrow deal on Zinch. Lock funds on Solana until work is delivered.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}