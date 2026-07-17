import Image from "next/image";

export default function Footer() {
  const cols = [
    {
      title: "Product",
      links: [
        { label: "How it works", href: "/#how" },
        { label: "Pricing", href: "/#pricing" },
        { label: "Dashboard", href: "/dashboard" },
        { label: "Create a deal", href: "/new" },
      ],
    },
    {
      title: "Resources",
      links: [
        { label: "Documentation", href: "/docs" },
        { label: "FAQ", href: "/#faq" },
        { label: "GitHub", href: "https://github.com/peace-dapps/zinch" },
        { label: "Solana Explorer", href: "https://explorer.solana.com/address/3gm7tTj5meZP1tYjvE49zSzpjMmyywD5wqZ7jxPS7uDP?cluster=devnet" },
      ],
    },
    {
      title: "Legal",
      links: [
        { label: "Terms of Service", href: "/legal/terms" },
        { label: "Privacy Policy", href: "/legal/privacy" },
        { label: "Contact", href: "mailto:hello@zinch.app" },
      ],
    },
    {
      title: "Connect",
      links: [
        { label: "X / Twitter", href: "https://x.com/zinch_app" },
        { label: "Telegram", href: "https://t.me/zinchapp" },
        { label: "Email", href: "mailto:gm@zinch.app" },
      ],
    },
  ];

  return (
    <footer className="border-t border-border">
      <div className="mx-auto max-w-7xl px-6 py-16 md:px-8 md:py-20">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-5">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2.5">
              <Image
                src="/logo.svg"
                alt="Zinch"
                width={38}
                height={38}
                className="h-8 w-8"
              />
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
                    
                    <a  href={link.href}
                      target={link.href.startsWith("http") ? "_blank" : undefined}
                      rel={link.href.startsWith("http") ? "noopener noreferrer" : undefined}
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