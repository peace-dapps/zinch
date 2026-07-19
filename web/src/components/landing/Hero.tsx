export default function Hero() {
  return (
    <section className="relative mx-auto flex min-h-screen max-w-7xl flex-col justify-center px-6 pb-16 pt-32 md:px-8 md:pt-40">
      <div className="mb-8 flex w-fit flex-wrap items-baseline gap-x-3 gap-y-2">
        <div className="flex items-baseline gap-2">
          <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-lime">
            [V1]
          </span>
          <span className="text-xs uppercase tracking-widest text-text-muted">
            Live on Solana devnet
          </span>
        </div>
        <span className="text-text-faded">·</span>
        <div className="flex items-baseline gap-2">
          <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-text-faded">
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
        Trust infrastructure for crypto work agreements. Lock funds in escrow,
        complete the work, release payment. Built on Solana.
      </p>

      <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
        
        <a  href="/new"
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
            <div className="text-2xl font-bold tracking-tight text-text tabular-nums md:text-3xl">
              {stat.value}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}