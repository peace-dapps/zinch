export default function Pricing() {
  const rows = [
    {
      platform: "Zinch",
      fee: "1.5%",
      hold: "None",
      crypto: "Native",
      highlight: true,
    },
    {
      platform: "Fiverr",
      fee: "25–30%",
      hold: "14 days",
      crypto: "Not supported",
      highlight: false,
    },
    {
      platform: "Upwork",
      fee: "15–20%",
      hold: "5–10 days",
      crypto: "Not supported",
      highlight: false,
    },
    {
      platform: "Escrow.com",
      fee: "0.89–3.25%",
      hold: "Days",
      crypto: "Limited",
      highlight: false,
    },
    {
      platform: "Other Web3",
      fee: "5%+",
      hold: "Varies",
      crypto: "Yes",
      highlight: false,
    },
  ];

  return (
    <section
      id="pricing"
      className="mx-auto max-w-7xl px-6 py-24 md:px-8 md:py-32"
    >
      <div className="mb-4 text-xs uppercase tracking-widest text-lime">
        // PRICING
      </div>
      <h2 className="mb-5 max-w-4xl text-4xl font-bold leading-tight tracking-tight sm:text-5xl md:text-6xl">
        <span className="text-lime">1.5%.</span> That's it.{" "}
        <br className="hidden md:block" />
        That's the fee.
      </h2>
      <p className="mb-16 max-w-2xl text-base text-text-muted md:text-lg">
        Client pays the fee on top of the deal amount. Worker gets the full
        agreed price. No surprises. No hidden cuts.
      </p>

      <div className="overflow-x-auto border border-border">
        <table className="w-full min-w-2xl border-collapse">
          <thead>
            <tr className="border-b border-border bg-surface">
              <th className="px-6 py-4 text-left text-xs uppercase tracking-widest text-text-faded">
                Platform
              </th>
              <th className="px-6 py-4 text-left text-xs uppercase tracking-widest text-text-faded">
                Fee
              </th>
              <th className="px-6 py-4 text-left text-xs uppercase tracking-widest text-text-faded">
                Fund hold
              </th>
              <th className="px-6 py-4 text-left text-xs uppercase tracking-widest text-text-faded">
                Crypto
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr
                key={r.platform}
                className={`border-b border-border last:border-0 ${
                  r.highlight ? "bg-lime/10" : ""
                }`}
              >
                <td className="px-6 py-5">
                  <div
                    className={`text-base font-medium ${
                      r.highlight ? "text-lime" : "text-text"
                    }`}
                  >
                    {r.platform}
                  </div>
                </td>
                <td className="px-6 py-5">
                  <span
                    className={`text-base font-bold tabular-nums ${
                      r.highlight ? "text-lime" : "text-text-muted"
                    }`}
                  >
                    {r.fee}
                  </span>
                </td>
                <td className="px-6 py-5 text-sm text-text-muted">{r.hold}</td>
                <td className="px-6 py-5 text-sm text-text-muted">
                  {r.crypto}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-12 grid grid-cols-1 gap-px border border-border bg-border md:grid-cols-3">
        {[
          {
            title: "No platform token",
            desc: "Zinch will never launch a token. The protocol is the product.",
          },
          {
            title: "No tier system",
            desc: "Same 1.5% for a $50 deal or a $50,000 deal. No premium plans.",
          },
          {
            title: "No hidden fees",
            desc: "Network fees go to Solana validators. We take nothing else.",
          },
        ].map((p) => (
          <div key={p.title} className="bg-bg p-7 md:p-8">
            <h3 className="mb-2 text-base font-medium tracking-tight">
              {p.title}
            </h3>
            <p className="text-sm leading-relaxed text-text-muted">{p.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
