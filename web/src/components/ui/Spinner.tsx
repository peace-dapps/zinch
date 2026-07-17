export function Spinner({ size = 16, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={`animate-spin ${className}`}
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeOpacity="0.2"
        strokeWidth="3"
      />
      <path
        d="M22 12a10 10 0 0 1-10 10"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function ButtonSpinner({ label = "Signing" }: { label?: string }) {
  return (
    <span className="inline-flex items-center gap-2">
      <Spinner size={14} />
      <span>{label}...</span>
    </span>
  );
}

export function PageLoader({ label = "Loading" }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16">
      <Spinner size={28} className="text-lime" />
      <div className="text-xs uppercase tracking-widest text-text-faded">
        {label}
      </div>
    </div>
  );
}

export function ShimmerRow() {
  return (
    <div className="border border-border bg-surface p-4">
      <div className="flex items-center justify-between">
        <div className="flex-1 space-y-2">
          <div className="h-3 w-24 animate-pulse bg-border" />
          <div className="h-4 w-48 animate-pulse bg-border" />
          <div className="h-3 w-32 animate-pulse bg-border" />
        </div>
        <div className="h-10 w-20 animate-pulse bg-border" />
      </div>
    </div>
  );
}