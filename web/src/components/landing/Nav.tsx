"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useWallet } from "@solana/wallet-adapter-react";

export default function Nav() {
  const { login, authenticated, logout } = usePrivy();
  const { connected } = useWallet();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-bg/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3.5 md:px-8 md:py-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5">
            <Image
              src="/logo.svg"
              alt="Zinch"
              width={40}
              height={40}
              priority
              className="h-10 w-10"
            />
            <span className="text-xl font-bold tracking-tight text-text">
              zinch
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden items-center gap-1 md:flex">
            {authenticated ? (
              <>
                <Link
                  href="/dashboard"
                  className="px-4 py-2 text-sm font-medium text-text-muted transition-colors hover:text-text"
                >
                  Dashboard
                </Link>
                <Link
                  href="/new"
                  className="px-4 py-2 text-sm font-medium text-text-muted transition-colors hover:text-text"
                >
                  New deal
                </Link>
                <Link
                  href="/docs"
                  className="px-4 py-2 text-sm font-medium text-text-muted transition-colors hover:text-text"
                >
                  Docs
                </Link>
                <Link
                  href="/settings"
                  className="px-4 py-2 text-sm font-medium text-text-muted transition-colors hover:text-text"
                >
                  Settings
                </Link>
                <div className="mx-2 h-6 w-px bg-border" />
                <div className="hidden lg:block">
                  <WalletMultiButton
                    style={{
                      backgroundColor: connected ? "#1a1a1a" : "transparent",
                      border: "1px solid #2a2a2a",
                      borderRadius: 0,
                      padding: "0.5rem 1rem",
                      fontSize: "0.8125rem",
                      height: "auto",
                      fontFamily: "inherit",
                      color: connected ? "#C4FF3E" : "#a0a0a0",
                    }}
                  />
                </div>
                <button
                  onClick={logout}
                  className="border border-border bg-transparent px-4 py-2 text-sm font-medium text-text-muted transition-all hover:border-border-hover hover:text-text"
                >
                  Sign out
                </button>
              </>
            ) : (
              <>
                
               <a   href="#how"
                  className="px-4 py-2 text-sm font-medium text-text-muted transition-colors hover:text-text"
                >
                  How it works
                </a>
                
                <a  href="#pricing"
                  className="px-4 py-2 text-sm font-medium text-text-muted transition-colors hover:text-text"
                >
                  Pricing
                </a>
                <Link
                  href="/docs"
                  className="px-4 py-2 text-sm font-medium text-text-muted transition-colors hover:text-text"
                >
                  Docs
                </Link>
                
                <Link
                  href="/stats"
                  className="px-4 py-2 text-sm font-medium text-text-muted transition-colors hover:text-text"
                >
                Stats
                </Link>

               <a   href="#faq"
                  className="px-4 py-2 text-sm font-medium text-text-muted transition-colors hover:text-text"
                >
                  FAQ
                </a>
                <button
                  onClick={login}
                  className="ml-2 bg-lime px-4 py-2 text-sm font-medium text-bg transition-all hover:opacity-90"
                >
                  Sign in
                </button>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileOpen((v) => !v)}
            className="flex items-center justify-center border border-border p-2 md:hidden"
            aria-label="Toggle menu"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="text-text"
            >
              {mobileOpen ? (
                <>
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </>
              ) : (
                <>
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </>
              )}
            </svg>
          </button>
        </div>

        {/* Mobile menu panel */}
        {mobileOpen && (
          <div className="border-t border-border bg-bg/95 backdrop-blur-xl md:hidden">
            <div className="mx-auto max-w-7xl px-5 py-4">
              {authenticated ? (
                <div className="flex flex-col gap-1">
                  <Link
                    href="/dashboard"
                    onClick={() => setMobileOpen(false)}
                    className="border border-border px-4 py-3 text-sm font-medium text-text hover:border-border-hover"
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/new"
                    onClick={() => setMobileOpen(false)}
                    className="border border-border px-4 py-3 text-sm font-medium text-text hover:border-border-hover"
                  >
                    New deal
                  </Link>
                  <Link
                    href="/docs"
                    onClick={() => setMobileOpen(false)}
                    className="border border-border px-4 py-3 text-sm font-medium text-text hover:border-border-hover"
                  >
                    Docs
                  </Link>
                  <Link
                    href="/settings"
                    onClick={() => setMobileOpen(false)}
                    className="border border-border px-4 py-3 text-sm font-medium text-text hover:border-border-hover"
                  >
                    Settings
                  </Link>
                  <div className="mt-2 border border-border p-3">
                    <div className="mb-2 text-xs uppercase tracking-wider text-text-faded">
                      Wallet
                    </div>
                    <WalletMultiButton
                      style={{
                        backgroundColor: connected ? "#1a1a1a" : "transparent",
                        border: "1px solid #2a2a2a",
                        borderRadius: 0,
                        padding: "0.5rem 1rem",
                        fontSize: "0.8125rem",
                        height: "auto",
                        fontFamily: "inherit",
                        color: connected ? "#C4FF3E" : "#a0a0a0",
                        width: "100%",
                      }}
                    />
                  </div>
                  <button
                    onClick={() => {
                      setMobileOpen(false);
                      logout();
                    }}
                    className="mt-2 border border-border bg-transparent px-4 py-3 text-sm font-medium text-text-muted transition-all hover:border-border-hover hover:text-text"
                  >
                    Sign out
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-1">
                  
                 <a   href="#how"
                    onClick={() => setMobileOpen(false)}
                    className="border border-border px-4 py-3 text-sm font-medium text-text hover:border-border-hover"
                  >
                    How it works
                  </a>
                  
                 <a   href="#pricing"
                    onClick={() => setMobileOpen(false)}
                    className="border border-border px-4 py-3 text-sm font-medium text-text hover:border-border-hover"
                  >
                    Pricing
                  </a>
                  <Link
                    href="/docs"
                    onClick={() => setMobileOpen(false)}
                    className="border border-border px-4 py-3 text-sm font-medium text-text hover:border-border-hover"
                  >
                    Docs
                  </Link>

                  <Link
                    href="/stats"
                    onClick={() => setMobileOpen(false)}
                    className="border border-border px-4 py-3 text-sm font-medium text-text hover:border-border-hover"
                  >
                    Stats
                  </Link>
                  
                  <a  href="#faq"
                    onClick={() => setMobileOpen(false)}
                    className="border border-border px-4 py-3 text-sm font-medium text-text hover:border-border-hover"
                  >
                    FAQ
                  </a>
                  <button
                    onClick={() => {
                      setMobileOpen(false);
                      login();
                    }}
                    className="mt-2 bg-lime px-4 py-3 text-sm font-medium text-bg transition-all hover:opacity-90"
                  >
                    Sign in
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>
    </>
  );
}