export default function WhySolana() {
  const reasons = [
    {
      stat: "< 1s",
      label: "Settlement",
      desc: "Deals finalize in milliseconds. No waiting for confirmations. No multi-day fund holds like Web2 platforms.",
    },
    {
      stat: "$0.00025",
      label: "Avg fee",
      desc: "Network fees are fractions of a cent. You don't pay more in gas than the deal itself is worth.",
    },
    {
      stat: "$5B+",
      label: "USDC liquidity",
      desc: "Solana has deep stablecoin liquidity. Workers can cash out instantly. Clients always have what to pay with.",
    },
    {
      stat: "24/7",
      label: "Mobile-ready",
      desc: "Phantom, Solflare, and Backpack work on every phone. Solana Pay deep links open wallets natively.",
    },
  ];

  return (
    <section className="border-y border-border bg-surface/30">
      <div className="mx-auto max-w-7xl px-6 py-24 md:px-8 md:py-32">
        <div className="mb-4 text-xs uppercase tracking-widest text-lime">
          // WHY SOLANA
        </div>
        <h2 className="mb-5 max-w-4xl text-4xl font-bold leading-tight tracking-tight sm:text-5xl md:text-6xl">
          The only chain fast <br className="hidden md:block" />
          and cheap enough.
        </h2>
        <p className="mb-16 max-w-2xl text-base text-text-muted md:text-lg">
          Zinch needs settlement in seconds, fees in cents, and wallets users
          actually have. Solana delivers on all three.
        </p>

        <div className="grid grid-cols-1 gap-px border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
          {reasons.map((r) => (
            <div key={r.label} className="bg-bg p-8 md:p-10">
              <div className="mb-2 text-4xl font-bold tracking-tight text-lime tabular-nums md:text-5xl">
                {r.stat}
              </div>
              <div className="mb-4 text-xs uppercase tracking-widest text-text-faded">
                {r.label}
              </div>
              <p className="text-sm leading-relaxed text-text-muted">
                {r.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
