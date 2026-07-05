export default function CTA() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-24 md:px-8 md:py-32">
      <div className="border border-border bg-surface px-8 py-16 md:px-16 md:py-24">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-bg px-3 py-1.5 text-xs tracking-wide text-text-muted">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-lime" />
            JOIN EARLY
          </div>

          <h2 className="mb-6 text-5xl font-bold leading-tight tracking-tight sm:text-6xl md:text-7xl">
            Stop getting <br />
            <span className="text-lime">scammed.</span>
          </h2>

          <p className="mx-auto mb-10 max-w-lg text-base text-text-muted md:text-lg">
            Create your first Zinch deal in 60 seconds. No app to install. No
            account required to view a deal.
          </p>

          <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
            
             <a href="/new"
              className="inline-flex w-full items-center justify-center gap-2 bg-lime px-8 py-4 text-sm font-medium tracking-tight text-bg transition-all duration-200 hover:opacity-90 active:scale-95 sm:w-auto"
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
            
            <a  href="#faq"
              className="inline-block w-full border border-border bg-bg px-7 py-4 text-center text-sm font-medium text-text transition-all duration-200 hover:border-border-hover hover:bg-surface sm:w-auto"
            >
              Read the docs
            </a>
          </div>

          <p className="mt-8 text-xs uppercase tracking-widest text-text-faded">
            BUILT ON SOLANA · 1.5% FLAT FEE · NO PLATFORM TOKEN
          </p>
        </div>
      </div>
    </section>
  );
}