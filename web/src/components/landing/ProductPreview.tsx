export default function ProductPreview() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-24 md:px-8 md:py-32">
      <div className="mb-4 text-center text-xs uppercase tracking-widest text-lime">
        // THE PRODUCT
      </div>
      <h2 className="mx-auto mb-5 max-w-4xl text-center text-4xl font-bold leading-tight tracking-tight sm:text-5xl md:text-6xl">
        This is what your counterparty sees.
      </h2>
      <p className="mx-auto mb-16 max-w-xl text-center text-base text-text-muted md:text-lg">
        Send a link. They open it on any device. No accounts to create. No
        wallet extensions needed.
      </p>

      <div className="mx-auto max-w-md">
        <div className="border border-border bg-surface p-7 md:p-10">
          <div className="mb-7 flex items-center justify-between border-b border-border pb-5">
            <div className="text-xs tracking-wider text-text-faded">
              DEAL #A7K2X9
            </div>
            <div className="inline-flex items-center gap-1.5 border border-lime/30 bg-lime/10 px-2.5 py-1 text-xs uppercase tracking-wider text-lime">
              <span className="h-1 w-1 rounded-full bg-lime" />
              Awaiting acceptance
            </div>
          </div>

          <div className="mb-1 text-sm text-text-faded">
            From <span className="font-medium text-text">@peace_onchain</span>
          </div>
          <h3 className="mb-7 text-xl font-medium leading-tight tracking-tight">
            Smart contract audit — 7 day turnaround
          </h3>

          <div className="mb-7 flex items-baseline gap-3">
            <div className="text-6xl font-bold leading-none tracking-tight text-lime tabular-nums">
              500
            </div>
            <div className="text-sm tracking-wide text-text-muted">USDC</div>
          </div>

          <div className="mb-7 grid grid-cols-2 gap-4 border-y border-border py-5">
            {[
              { label: "Deadline", value: "7 days" },
              { label: "Auto-release", value: "72 hours" },
              { label: "Platform fee", value: "$7.50" },
              { label: "Total to lock", value: "$507.50" },
            ].map((m) => (
              <div key={m.label}>
                <div className="mb-1.5 text-xs uppercase tracking-wider text-text-faded">
                  {m.label}
                </div>
                <div className="text-sm font-medium text-text">{m.value}</div>
              </div>
            ))}
          </div>

          <button className="mb-2 w-full bg-lime py-4 text-sm font-medium text-bg transition-all hover:opacity-90">
            Accept this deal
          </button>
          <button className="w-full border border-border py-3.5 text-sm font-medium text-text-muted transition-all hover:border-border-hover hover:text-text">
            Reject
          </button>

          <div className="mt-7 flex items-center justify-between border-t border-border pt-5 text-xs tracking-wider text-text-faded">
            <div>POWERED BY ZINCH</div>
            <div>ON SOLANA</div>
          </div>
        </div>
      </div>
    </section>
  );
}
