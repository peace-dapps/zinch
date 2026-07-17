import Image from "next/image";

const PARTNERS = [
  { name: "Solana", src: "/partners/solana.svg", sizeMultiplier: 1.0 },
  { name: "Superteam", src: "/partners/superteam.svg", sizeMultiplier: 1.5 },
  { name: "Privy", src: "/partners/privy.svg", sizeMultiplier: 1.0 },
  { name: "Helius", src: "/partners/helius.svg", sizeMultiplier: 1.0 },
  { name: "Anchor", src: "/partners/anchor.svg", sizeMultiplier: 1.5 },
];

const BASE_HEIGHT = 32;

export default function TrustBar() {
  const items = [...PARTNERS, ...PARTNERS];

  return (
    <section className="border-y border-border bg-surface/30">
      <div className="mx-auto max-w-7xl px-6 py-12 md:px-8">
        <div className="mb-8 text-center text-xs uppercase tracking-widest text-text-faded">
          BUILT WITH SUPPORT FROM
        </div>

        {/* Mobile: static grid (2x2 + 1) */}
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 md:hidden">
          {PARTNERS.map((partner) => (
            <div
              key={partner.name}
              className="flex items-center justify-center opacity-70"
            >
              <Image
                src={partner.src}
                alt={partner.name}
                width={200}
                height={80}
                className="w-auto object-contain"
                style={{
                  height: `${BASE_HEIGHT * partner.sizeMultiplier}px`,
                }}
              />
            </div>
          ))}
        </div>

        {/* Desktop: marquee (faster now — 18s instead of 30s) */}
        <div className="relative hidden overflow-hidden md:block">
          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-bg to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-bg to-transparent" />

          <div className="flex animate-marquee-fast gap-16 whitespace-nowrap">
            {items.map((partner, idx) => (
              <div
                key={`${partner.name}-${idx}`}
                className="flex shrink-0 items-center opacity-60 grayscale transition-all hover:opacity-100 hover:grayscale-0"
              >
                <Image
                  src={partner.src}
                  alt={partner.name}
                  width={200}
                  height={80}
                  className="w-auto object-contain"
                  style={{
                    height: `${BASE_HEIGHT * partner.sizeMultiplier}px`,
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}