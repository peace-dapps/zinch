"use client";

import { usePrivy } from "@privy-io/react-auth";

export default function Nav() {
  const { login, authenticated, logout, user } = usePrivy();

  const displayName =
    user?.email?.address ||
    user?.google?.email ||
    user?.telegram?.username ||
    "Signed in";

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between border-b border-border bg-bg/70 px-5 py-4 backdrop-blur-xl md:px-8 md:py-5">
      <a href="/" className="flex items-center gap-2.5">
        <svg viewBox="0 0 32 32" fill="none" className="h-6 w-6">
          <path d="M4 4H14L18 12H8L4 4Z" fill="#C4FF3E" />
          <path d="M8 12H18L14 20H4L8 12Z" fill="#C4FF3E" />
          <path d="M14 12H24L28 20H18L14 12Z" fill="#C4FF3E" />
          <path d="M18 20H28L24 28H14L18 20Z" fill="#C4FF3E" />
        </svg>
        <span className="font-bold text-lg tracking-tight text-text">zinch</span>
      </a>

      <div className="flex items-center gap-1">
        <a href="#how" className="hidden px-4 py-2 text-sm font-medium text-text-muted transition-colors hover:text-text sm:block">
          How it works
        </a>
        <a href="#pricing" className="hidden px-4 py-2 text-sm font-medium text-text-muted transition-colors hover:text-text sm:block">
          Pricing
        </a>
        <a href="#faq" className="hidden px-4 py-2 text-sm font-medium text-text-muted transition-colors hover:text-text md:block">
          FAQ
        </a>

        {authenticated ? (
          <div className="flex items-center gap-2">
            <span className="hidden px-3 py-2 text-sm text-text-muted sm:block">
              {displayName}
            </span>
            <button onClick={logout} className="ml-2 border border-border bg-transparent px-4 py-2 text-sm font-medium text-text transition-all hover:border-border-hover hover:bg-surface">
              Sign out
            </button>
          </div>
        ) : (
          <button onClick={login} className="ml-2 bg-lime px-4 py-2 text-sm font-medium text-bg transition-all hover:opacity-90">
            Sign in
          </button>
        )}
      </div>
    </nav>
  );
}