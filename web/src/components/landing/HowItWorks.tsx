export default function HowItWorks() {
  const steps = [
    {
      num: "01",
      title: "Create the deal",
      desc: "Job title, amount, terms, deadline. Takes 60 seconds. Generates a unique shareable link.",
      bullets: ["Any SPL token", "Custom terms", "Single or split payment"],
    },
    {
      num: "02",
      title: "Share the link",
      desc: "Drop it in Telegram, X DMs, Discord, WhatsApp — wherever the deal is already happening.",
      bullets: ["No app install", "Mobile-friendly", "Opens in any browser"],
    },
    {
      num: "03",
      title: "Fund the escrow",
      desc: "Client locks payment in a Solana smart contract. Funds are visible on-chain at all times.",
      bullets: ["Wallet or card", "USDC or SOL", "Verifiable on Solscan"],
    },
    {
      num: "04",
      title: "Get paid",
      desc: "Worker delivers proof of work. Client approves. Funds release instantly. Auto-release if ghosted.",
      bullets: ["72-hour timer", "Permissionless release", "Public receipt"],
    },
  ];

  return (
    <section
      id="how"
      className="mx-auto max-w-7xl px-6 py-24 md:px-8 md:py-32"
    >
      <div className="mb-4 text-xs uppercase tracking-widest text-lime">
        // HOW IT WORKS
      </div>
      <h2 className="mb-5 max-w-4xl text-4xl font-bold leading-tight tracking-tight sm:text-5xl md:text-6xl">
        A protocol, <br className="md:hidden" />
        not a marketplace.
      </h2>
      <p className="mb-16 max-w-2xl text-base text-text-muted md:text-lg">
        Zinch slots into the conversation where your deal is already happening.
        No accounts to manage. No middlemen. No 20% Fiverr-style fees.
      </p>

      <div className="grid grid-cols-1 gap-px border border-border bg-border lg:grid-cols-2">
        {steps.map((step) => (
          <div
            key={step.num}
            className="flex flex-col bg-bg p-8 transition-colors duration-300 hover:bg-surface md:p-10"
          >
            <div className="mb-6 flex items-center justify-between">
              <div className="text-xs tracking-widest text-lime">
                STEP {step.num}
              </div>
              <div className="text-4xl font-bold tracking-tight text-text-faded opacity-30">
                {step.num}
              </div>
            </div>
            <h3 className="mb-3 text-2xl font-medium tracking-tight md:text-3xl">
              {step.title}
            </h3>
            <p className="mb-6 text-sm leading-relaxed text-text-muted md:text-base">
              {step.desc}
            </p>
            <div className="mt-auto flex flex-wrap gap-2">
              {step.bullets.map((b) => (
                <span
                  key={b}
                  className="border border-border bg-bg px-2.5 py-1 text-xs tracking-wide text-text-muted"
                >
                  {b}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
