export default function Problem() {
  const scenarios = [
    {
      tag: "// THE GHOST",
      title: "Worker delivers. Client vanishes.",
      desc: "Three weeks of dev work. Submitted on Friday. Client never replies. Wallet goes silent. No recourse, no contract, no escrow — just a TG handle that stops typing.",
    },
    {
      tag: "// THE BAIT",
      title: "Client pays. Worker disappears.",
      desc: "Marketing retainer paid upfront in USDC. First week of work was great. Then the worker stops responding. The wallet you paid is empty. The Twitter account is gone.",
    },
    {
      tag: "// THE MIDDLEMAN",
      title: 'The "trusted escrow" was the scam.',
      desc: "A community member offers to hold funds. Everyone vouches for them. You send the USDC. They release the funds — to themselves. The vouchers blame each other.",
    },
  ];

  return (
    <section className="mx-auto max-w-7xl px-6 py-24 md:px-8 md:py-32">
      <div className="mb-4 text-xs uppercase tracking-widest text-lime">
        // THE PROBLEM
      </div>
      <h2 className="mb-5 max-w-4xl text-4xl font-bold leading-tight tracking-tight sm:text-5xl md:text-6xl">
        Crypto work runs on trust.{" "}
        <br className="hidden md:block" />
        <span className="text-text-muted">Trust runs on luck.</span>
      </h2>
      <p className="mb-16 max-w-2xl text-base text-text-muted md:text-lg">
        Every day, thousands of crypto deals get done across Telegram, X, and
        Discord. The outcome usually depends on who hits send first.
      </p>

      <div className="grid grid-cols-1 gap-px border border-border bg-border md:grid-cols-3">
        {scenarios.map((s) => (
          <div
            key={s.tag}
            className="flex flex-col bg-bg p-8 transition-colors duration-300 hover:bg-surface md:p-10"
          >
            <div className="mb-6 text-xs uppercase tracking-widest text-lime">
              {s.tag}
            </div>
            <h3 className="mb-3 text-xl font-medium tracking-tight md:text-2xl">
              {s.title}
            </h3>
            <p className="text-sm leading-relaxed text-text-muted md:text-base">
              {s.desc}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
