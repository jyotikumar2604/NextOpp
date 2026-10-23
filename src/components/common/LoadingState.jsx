function CardSkeleton() {
  return (
    <div className="rounded-xl border border-stone-200 bg-white p-5 shadow-[var(--shadow-card)]">
      <div className="flex gap-3">
        <div className="skeleton size-11 rounded-xl" />
        <div className="flex-1 space-y-2">
          <div className="skeleton h-4 w-2/3" />
          <div className="skeleton h-3 w-1/3" />
        </div>
        <div className="skeleton h-7 w-20" />
      </div>
      <div className="skeleton mt-4 h-3 w-full" />
      <div className="skeleton mt-2 h-3 w-4/5" />
      <div className="mt-4 flex gap-2">
        <div className="skeleton h-6 w-16" />
        <div className="skeleton h-6 w-16" />
        <div className="skeleton h-6 w-16" />
      </div>
    </div>
  );
}

/** Skeleton placeholders. `variant="page"` mimics the dashboard; "cards" is just a stack of cards. */
export default function LoadingState({ count = 3, variant = "cards", label = "Loading" }) {
  return (
    <div role="status" aria-busy="true" aria-label={label}>
      {variant === "page" && (
        <div className="mb-6 space-y-6">
          <div className="skeleton h-28 w-full rounded-xl" />
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="skeleton h-24 rounded-xl" />
            ))}
          </div>
        </div>
      )}
      <div className="space-y-4">
        {Array.from({ length: count }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
      <span className="sr-only">{label}…</span>
    </div>
  );
}
