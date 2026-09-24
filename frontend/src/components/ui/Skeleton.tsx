export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`skeleton ${className}`} />;
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="stack gap-sm">
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-10 w-full" />
      ))}
    </div>
  );
}

export function PageLoader({ rows = 6 }: { rows?: number }) {
  return (
    <div className="page-loader">
      <div className="page-loader-header">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-72" />
      </div>
      <div className="stats">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="stat">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-16" />
          </div>
        ))}
      </div>
      <div className="panel">
        <TableSkeleton rows={rows} />
      </div>
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="page-loader">
      <div className="page-loader-header">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-4 w-80" />
      </div>
      <div className="stats">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="stat">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-8 w-20" />
          </div>
        ))}
      </div>
      <div className="dashboard-grid">
        <div className="panel">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-40 w-full" />
        </div>
        <div className="panel">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-40 w-full" />
        </div>
      </div>
    </div>
  );
}
