export default function TrustBar() {
  return (
    <section className="border-y border-border bg-surface/30">
      <div className="mx-auto max-w-7xl px-6 py-12 md:px-8">
        <div className="mb-8 text-center text-xs uppercase tracking-widest text-text-faded">
          BUILT WITH SUPPORT FROM
        </div>
        <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6 opacity-70">
          {["Solana", "Superteam", "Privy", "Helius", "Anchor"].map((p) => (
            <div
              key={p}
              className="text-xl font-bold tracking-tight text-text-muted transition-colors hover:text-text md:text-2xl"
            >
              {p}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
