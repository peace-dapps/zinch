export default function Security() {
  const protections = [
    {
      num: "01",
      title: "Audited smart contract",
      desc: "The escrow program is open source and undergoes informal community audits before mainnet. Full audit planned post-launch.",
    },
    {
      num: "02",
      title: "Permissionless auto-release",
      desc: "If our backend goes down, workers can still trigger auto-release themselves directly on-chain. Your funds are never our hostages.",
    },
    {
      num: "03",
      title: "Public insurance fund",
      desc: "20% of every fee funds a public insurance pool. If a contract bug ever loses funds, we make affected users whole.",
    },
    {
      num: "04",
      title: "Non-custodial by design",
      desc: "Zinch never holds your funds. Money lives in a smart contract escrow account that only the protocol can release.",
    },
  ];

  return (
    <section className="border-y border-border bg-surface/30">
      <div className="mx-auto max-w-7xl px-6 py-24 md:px-8 md:py-32">
        <div className="mb-4 text-xs uppercase tracking-widest text-lime">
          // SECURITY
        </div>
        <h2 className="mb-5 max-w-4xl text-4xl font-bold leading-tight tracking-tight sm:text-5xl md:text-6xl">
          Trust isn't a promise. <br className="hidden md:block" />
          It's the code.
        </h2>
        <p className="mb-16 max-w-2xl text-base text-text-muted md:text-lg">
          Four protections built into the protocol from day one. None of them
          require trusting us.
        </p>

        <div className="grid grid-cols-1 gap-px border border-border bg-border md:grid-cols-2">
          {protections.map((p) => (
            <div key={p.num} className="bg-bg p-8 md:p-10">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center border border-lime bg-lime/10 text-xs text-lime">
                  {p.num}
                </div>
                <h3 className="text-xl font-medium tracking-tight md:text-2xl">
                  {p.title}
                </h3>
              </div>
              <p className="text-sm leading-relaxed text-text-muted md:text-base">
                {p.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
