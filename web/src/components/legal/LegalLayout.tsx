import Nav from "@/components/landing/Nav";

export default function LegalLayout({
  title,
  updated,
  children,
}: {
  title: string;
  updated: string;
  children: React.ReactNode;
}) {
  return (
    <main className="relative min-h-screen">
      <Nav />

      <div className="mx-auto max-w-3xl px-6 pb-24 pt-32 md:px-8 md:pt-40">
        <div className="mb-2 text-xs uppercase tracking-widest text-text-faded">
          // LEGAL
        </div>
        <h1 className="mb-3 text-4xl font-bold tracking-tight md:text-5xl">
          {title}
        </h1>
        <div className="mb-12 text-sm text-text-muted">
          Last updated: {updated}
        </div>

        <div className="legal-content space-y-6 text-text-muted leading-relaxed">
          {children}
        </div>

        <div className="mt-16 border-t border-border pt-6 text-xs text-text-faded">
          Questions? Reach out at{" "}
           
          <a href="mailto:hello@zinch.app"
            className="text-lime hover:underline"
          >
            hello@zinch.app
          </a>
        </div>
      </div>
    </main>
  );
}