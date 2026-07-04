export default function Features() {
  const features = [
    {
      icon: "M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5",
      title: "Code-enforced trust",
      desc: "No human arbitrators. The smart contract enforces every term.",
    },
    {
      icon: "M12 8v4l3 3M3 12a9 9 0 1 1 18 0 9 9 0 0 1-18 0z",
      title: "Auto-release timer",
      desc: "Funds release automatically if a client ghosts after delivery.",
    },
    {
      icon: "M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0zM12 3v18M3 12h18",
      title: "Mobile-first",
      desc: "Built to work flawlessly in Telegram and X in-app browsers.",
    },
    {
      icon: "M3 7v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V7M3 7l9-5 9 5M3 7l9 5 9-5",
      title: "Any SPL token",
      desc: "USDC, SOL, BONK, JUP, your project's token — all supported.",
    },
    {
      icon: "M16 11V7a4 4 0 1 0-8 0v4M5 11h14l1 10H4l1-10z",
      title: "Insurance fund",
      desc: "20% of every fee goes into a public insurance fund. Verifiable on-chain.",
    },
    {
      icon: "M12 2v20M5 12h14M7 7l10 10M17 7L7 17",
      title: "Mutual disputes",
      desc: "No central arbiter. Both parties propose a resolution. The protocol executes.",
    },
    {
      icon: "M9 12l2 2 4-4M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z",
      title: "Public receipts",
      desc: "Every completed deal gets a permanent, shareable, on-chain receipt.",
    },
    {
      icon: "M13 2L3 14h9l-1 8 10-12h-9l1-8z",
      title: "1.5% flat fee",
      desc: "No platform token. No marketplace cut. Just the simplest fee in escrow.",
    },
  ];

  return (
    <section className="mx-auto max-w-7xl px-6 py-24 md:px-8 md:py-32">
      <div className="mb-4 text-xs uppercase tracking-widest text-lime">
        // FEATURES
      </div>
      <h2 className="mb-5 max-w-4xl text-4xl font-bold leading-tight tracking-tight sm:text-5xl md:text-6xl">
        Everything escrow <br className="hidden md:block" />
        should be.
      </h2>
      <p className="mb-16 max-w-2xl text-base text-text-muted md:text-lg">
        Engineered for the way crypto work actually happens. Mobile, instant,
        global, code-enforced.
      </p>

      <div className="grid grid-cols-1 gap-px border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
        {features.map((f) => (
          <div
            key={f.title}
            className="bg-bg p-7 transition-colors hover:bg-surface md:p-8"
          >
            <svg
              className="mb-6 h-7 w-7 text-lime"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d={f.icon} />
            </svg>
            <h3 className="mb-2 text-lg font-medium tracking-tight">
              {f.title}
            </h3>
            <p className="text-sm leading-relaxed text-text-muted">{f.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
