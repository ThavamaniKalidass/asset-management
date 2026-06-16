export function CardSkeleton() {
  return <div className="card-premium p-5 skeleton h-24" />;
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="skeleton h-12" />
      ))}
    </div>
  );
}

export function ChartSkeleton() {
  return <div className="card-premium p-6 skeleton h-80" />;
}

export function PageSkeleton() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="skeleton h-8 w-48" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}