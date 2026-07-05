import Nav from "@/components/landing/Nav";

export default async function DealPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <main className="relative min-h-screen">
      <Nav />

      <div className="mx-auto max-w-2xl px-6 pb-24 pt-32 md:px-8 md:pt-40">
        <div className="mb-4 text-xs uppercase tracking-widest text-lime">
          // DEAL CREATED
        </div>
        <h1 className="mb-3 text-4xl font-bold tracking-tight sm:text-5xl">
          Deal is live on Solana.
        </h1>
        <p className="mb-8 text-text-muted">
          Share this link with your counterparty. They can view and accept the
          deal without signing up.
        </p>

        <div className="mb-8 border border-border bg-surface p-6 md:p-8">
          <div className="mb-2 text-xs uppercase tracking-widest text-text-faded">
            Deal ID
          </div>
          <div className="mb-4 break-all font-mono text-sm text-text">{id}</div>
          <div className="mb-2 text-xs uppercase tracking-widest text-text-faded">
            Shareable link
          </div>
          <div className="break-all font-mono text-sm text-lime">
            http://localhost:3000/d/{id}
          </div>
        </div>

        <a
          href="/dashboard"
          className="inline-block bg-lime px-7 py-4 text-sm font-medium tracking-tight text-bg transition-all hover:opacity-90"
        >
          Go to dashboard
        </a>
      </div>
    </main>
  );
}