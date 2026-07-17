export default function ProductPreview() {
  return (
    <section className="relative mx-auto max-w-7xl px-6 py-24 md:px-8 md:py-32">
      <div className="mb-4 text-center text-xs uppercase tracking-widest text-lime">
        // THE PRODUCT
      </div>
      <h2 className="mx-auto mb-5 max-w-4xl text-center text-4xl font-bold leading-tight tracking-tight sm:text-5xl md:text-6xl">
        This is what your counterparty sees.
      </h2>
      <p className="mx-auto mb-16 max-w-xl text-center text-base text-text-muted md:text-lg">
        Send a link. They open it on any device. No accounts to create. Sign in
        with Google, connect Phantom, done.
      </p>

      <div className="mx-auto max-w-md">
        {/* Subtle lime glow behind the card */}
        <div className="relative">
          <div
            aria-hidden
            className="absolute -inset-4 -z-10 rounded-3xl bg-lime/10 opacity-60 blur-3xl"
          />

          <div className="border border-border bg-surface p-7 shadow-2xl md:p-10">
            <div className="mb-6 flex items-center justify-between border-b border-border pb-5">
              <div className="text-xs tracking-wider text-text-faded">
                DEAL #A7K2X9
              </div>
              <div className="inline-flex items-center gap-1.5 border border-lime/30 bg-lime/10 px-2.5 py-1 text-[10px] uppercase tracking-widest text-lime">
                <span className="h-1 w-1 rounded-full bg-lime" />
                AWAITING FUNDING
              </div>
            </div>

            <div className="mb-1 text-sm text-text-faded">
              From{" "}
              <span className="font-mono text-text">
                8fK2...9mQx
              </span>
            </div>
            <h3 className="mb-6 text-xl font-medium leading-snug tracking-tight text-text">
              Landing page redesign — 5 day delivery
            </h3>

            <div className="mb-6 flex items-baseline gap-3">
              <div className="text-6xl font-bold leading-none tracking-tight text-lime tabular-nums">
                4.5
              </div>
              <div className="text-sm tracking-wide text-text-muted">SOL</div>
            </div>

            <div className="mb-6 grid grid-cols-2 gap-4 border-y border-border py-5">
              {[
                { label: "Deadline", value: "May 22" },
                { label: "Auto-release", value: "72 hours" },
                { label: "Platform fee", value: "0.0675 SOL" },
                { label: "Total to lock", value: "4.5675 SOL" },
              ].map((m) => (
                <div key={m.label}>
                  <div className="mb-1.5 text-[10px] uppercase tracking-widest text-text-faded">
                    {m.label}
                  </div>
                  <div className="text-sm font-medium tabular-nums text-text">
                    {m.value}
                  </div>
                </div>
              ))}
            </div>

            <button className="mb-2 w-full bg-lime py-3.5 text-sm font-medium text-bg transition-all hover:opacity-90">
              Fund deal (4.5675 SOL)
            </button>
            <button className="w-full border border-border py-3 text-sm font-medium text-text-muted transition-all hover:border-border-hover hover:text-text">
              Open dispute
            </button>

            <div className="mt-6 grid grid-cols-2 border-t border-border pt-4">
              <div>
                <div className="mb-1 text-[10px] uppercase tracking-widest text-text-faded">
                  Worker
                </div>
                <div className="font-mono text-[11px] text-text">
                  TRMv...FAhw
                </div>
              </div>
              <div className="text-right">
                <div className="mb-1 text-[10px] uppercase tracking-widest text-text-faded">
                  Client
                </div>
                <div className="font-mono text-[11px] text-text">
                  8fK2...9mQx
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-between border-t border-border pt-4 text-[10px] tracking-widest text-text-faded">
              <div>POWERED BY ZINCH</div>
              <div>ON SOLANA</div>
            </div>
          </div>
        </div>

        {/* Subtle caption below */}
        <div className="mt-6 text-center text-xs text-text-faded">
          Same interface, every device, no downloads.
        </div>
      </div>
    </section>
  );
}