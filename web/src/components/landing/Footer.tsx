export default function Footer() {
  const cols = [
    {
      title: "Product",
      links: [
        { label: "How it works", href: "#how" },
        { label: "Pricing", href: "#pricing" },
        { label: "Security", href: "#" },
        { label: "Roadmap", href: "#" },
      ],
    },
    {
      title: "Resources",
      links: [
        { label: "Documentation", href: "#" },
        { label: "FAQ", href: "#faq" },
        { label: "Brand kit", href: "#" },
        { label: "Status", href: "#" },
      ],
    },
    {
      title: "Connect",
      links: [
        { label: "X / Twitter", href: "https://x.com/zinch_app" },
        { label: "Telegram", href: "https://t.me/zinchapp" },
        { label: "GitHub", href: "#" },
        { label: "Email", href: "mailto:gm@zinch.app" },
      ],
    },
  ];

  return (
    <footer className="border-t border-border">
      <div className="mx-auto max-w-7xl px-6 py-16 md:px-8 md:py-20">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-4">
          <div className="md:col-span-1">
            <div className="flex items-center gap-2.5">
              <svg viewBox="0 0 32 32" fill="none" className="h-7 w-7">
                <path d="M4 4H14L18 12H8L4 4Z" fill="#C4FF3E" />
                <path d="M8 12H18L14 20H4L8 12Z" fill="#C4FF3E" />
                <path d="M14 12H24L28 20H18L14 12Z" fill="#C4FF3E" />
                <path d="M18 20H28L24 28H14L18 20Z" fill="#C4FF3E" />
              </svg>
              <span className="text-xl font-bold tracking-tight">zinch</span>
            </div>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-text-muted">
              Trust infrastructure for crypto work agreements. Built on Solana.
            </p>
          </div>

          {cols.map((col) => (
            <div key={col.title}>
              <h4 className="mb-5 text-xs uppercase tracking-widest text-text-faded">
                {col.title}
              </h4>
              <ul className="space-y-3">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-sm text-text-muted transition-colors hover:text-text"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-16 flex flex-wrap items-center justify-between gap-4 border-t border-border pt-8 text-xs tracking-wider text-text-faded">
          <div>© 2026 ZINCH · ALL RIGHTS RESERVED</div>
          <div className="flex items-center gap-2">
            <span>BUILT ON</span>
            <span className="text-lime">SOLANA</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
