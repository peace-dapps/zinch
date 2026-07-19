import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Your active deals, pending actions, and completed history on Zinch.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}