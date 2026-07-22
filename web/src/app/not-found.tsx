import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6">
      <div className="max-w-md text-center">
        <div className="mb-6 flex items-baseline justify-center gap-2 font-mono text-xs uppercase tracking-widest text-red-400">
          <span>[404]</span>
          <span>NOT FOUND</span>
        </div>
        <h1 className="mb-4 text-5xl font-bold tracking-tight md:text-6xl">
          Dead end.
        </h1>
        <p className="mb-8 text-text-muted">
          This page doesn&apos;t exist on Zinch. It may have been moved, deleted, or
          you followed a broken link.
        </p>
        <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/"
            className="bg-lime px-6 py-3 text-sm font-medium text-bg transition-all hover:opacity-90"
          >
            Back to home
          </Link>
          <Link
            href="/dashboard"
            className="border border-border px-6 py-3 text-sm font-medium text-text-muted transition-all hover:border-border-hover hover:text-text"
          >
            Go to dashboard
          </Link>
        </div>
        <div className="mt-16 text-xs text-text-faded">
          ZINCH · ON SOLANA
        </div>
      </div>
    </main>
  );
}