export default function Hero() {
  return (
    <section className="relative mx-auto flex min-h-screen max-w-7xl flex-col justify-center px-6 pb-16 pt-32 md:px-8 md:pt-40">
      <div className="flex flex-col gap-12 lg:flex-row lg:items-center lg:justify-between">
        {/* Left — copy */}
        <div className="flex-1">
          <div className="mb-8 flex w-fit flex-wrap items-baseline gap-x-3 gap-y-2">
            <div className="flex items-baseline gap-2">
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-lime">
                [V1]
              </span>
              <span className="text-xs uppercase tracking-widest text-text-muted">
                Live on Solana devnet
              </span>
            </div>
            <span className="text-text-faded">·</span>
            <div className="flex items-baseline gap-2">
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-text-faded">
                [V2]
              </span>
              <span className="text-xs uppercase tracking-widest text-text-muted">
                USDC coming soon
              </span>
            </div>
          </div>

          <h1 className="mb-7 text-5xl font-bold leading-tight tracking-tight text-text sm:text-6xl md:text-7xl lg:text-8xl">
            Crypto deals,
            <br />
            <span className="text-lime">locked in.</span>
          </h1>

          <p className="mb-10 max-w-2xl text-base leading-relaxed text-text-muted md:text-lg lg:text-xl">
            Trust infrastructure for crypto work agreements. Lock funds in
            escrow, complete the work, release payment. Built on Solana.
          </p>

          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
            
           <a   href="/new"
              className="inline-flex items-center justify-center gap-2 bg-lime px-7 py-4 text-sm font-medium tracking-tight text-bg transition-all duration-200 hover:opacity-90 active:scale-95"
            >
              Create a deal
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </a>
            
            <a  href="#how"
              className="inline-flex items-center justify-center border border-border bg-transparent px-6 py-4 text-sm font-medium text-text transition-all duration-200 hover:border-border-hover hover:bg-surface"
            >
              How it works
            </a>
          </div>
        </div>

        {/* Right — floating deal card */}
        <div className="relative hidden lg:block lg:w-[380px]">
          {/* Lime glow */}
          <div
            aria-hidden
            className="absolute -inset-8 -z-10 rounded-3xl bg-lime/10 opacity-50 blur-3xl"
          />

          <div className="border border-border bg-surface p-6 shadow-2xl">
            {/* Header */}
            <div className="mb-5 flex items-center justify-between border-b border-border pb-4">
              <div className="font-mono text-[10px] tracking-widest text-text-faded">
                DEAL #7F2A
              </div>
              <div className="flex items-baseline gap-1.5 font-mono text-[10px] uppercase tracking-widest text-lime">
                <span>[03]</span>
                <span>IN PROGRESS</span>
              </div>
            </div>

            {/* Content */}
            <div className="mb-1 text-xs text-text-faded">
              From{" "}
              <span className="font-mono text-text">8fK2...9mQx</span>
            </div>
            <div className="mb-5 text-sm font-medium text-text">
              Smart contract audit — 5 day delivery
            </div>

            {/* Amount */}
            <div className="mb-5 flex items-baseline gap-2">
              <div className="text-4xl font-bold tabular-nums text-lime">
                2.5
              </div>
              <div className="text-xs text-text-muted">SOL</div>
            </div>

            {/* Meta grid */}
            <div className="mb-5 grid grid-cols-2 gap-3 border-y border-border py-4">
              <div>
                <div className="mb-1 text-[10px] uppercase tracking-widest text-text-faded">
                  Auto-release
                </div>
                <div className="text-xs font-medium tabular-nums text-lime">
                  23h 41m 12s
                </div>
              </div>
              <div>
                <div className="mb-1 text-[10px] uppercase tracking-widest text-text-faded">
                  Fee
                </div>
                <div className="text-xs font-medium text-text">
                  0.0375 SOL
                </div>
              </div>
            </div>

            {/* Action */}
            <div className="mb-3 w-full bg-lime py-3 text-center text-xs font-medium text-bg">
              Approve & release funds
            </div>

            {/* Parties */}
            <div className="grid grid-cols-2 gap-3 border-t border-border pt-3">
              <div>
                <div className="mb-0.5 text-[9px] uppercase tracking-widest text-text-faded">
                  Worker
                </div>
                <div className="font-mono text-[10px] text-text-muted">
                  TRMv...FAhw
                </div>
              </div>
              <div className="text-right">
                <div className="mb-0.5 text-[9px] uppercase tracking-widest text-text-faded">
                  Client
                </div>
                <div className="font-mono text-[10px] text-text-muted">
                  8fK2...9mQx
                </div>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between border-t border-border pt-3 text-[9px] tracking-widest text-text-faded">
              <span>POWERED BY ZINCH</span>
              <span>ON SOLANA</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom stats */}
      <div className="mt-20 grid grid-cols-2 gap-x-6 gap-y-8 border-t border-border pt-10 md:grid-cols-4">
        {[
          { label: "Platform fee", value: "1.5%" },
          { label: "Settlement", value: "< 1s" },
          { label: "Min deal", value: "$1" },
          { label: "Chain", value: "Solana" },
        ].map((stat) => (
          <div key={stat.label}>
            <div className="mb-2 text-xs uppercase tracking-widest text-text-faded">
              {stat.label}
            </div>
            <div className="text-2xl font-bold tracking-tight tabular-nums text-text md:text-3xl">
              {stat.value}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}