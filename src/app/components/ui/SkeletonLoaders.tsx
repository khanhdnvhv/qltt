function SkeletonBox({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse bg-gray-200 dark:bg-white/[0.06] rounded-lg ${className}`}
    />
  );
}

export function CardSkeleton() {
  return (
    <div className="bg-white dark:bg-card rounded-2xl border border-gray-100 dark:border-border overflow-hidden">
      <SkeletonBox className="h-48 rounded-none" />
      <div className="p-6 space-y-3">
        <div className="flex items-center justify-between">
          <SkeletonBox className="h-5 w-40" />
          <SkeletonBox className="h-5 w-16 rounded-full" />
        </div>
        <SkeletonBox className="h-4 w-full" />
        <SkeletonBox className="h-4 w-3/4" />
        <div className="flex gap-3 pt-1">
          <SkeletonBox className="h-3.5 w-16" />
          <SkeletonBox className="h-3.5 w-16" />
          <SkeletonBox className="h-3.5 w-16" />
        </div>
        <div className="flex items-center justify-between pt-2">
          <SkeletonBox className="h-5 w-20" />
          <SkeletonBox className="h-5 w-24" />
        </div>
        <SkeletonBox className="h-11 w-full rounded-xl" />
      </div>
    </div>
  );
}

export function TableRowSkeleton() {
  return (
    <tr className="border-b border-gray-50 dark:border-border/50">
      <td className="px-5 py-4"><SkeletonBox className="w-4 h-4" /></td>
      <td className="px-3 py-4">
        <div className="flex items-center gap-3">
          <SkeletonBox className="w-9 h-9 rounded-full" />
          <div className="space-y-1.5">
            <SkeletonBox className="h-3.5 w-28" />
            <SkeletonBox className="h-3 w-36" />
          </div>
        </div>
      </td>
      <td className="px-3 py-4"><SkeletonBox className="h-5 w-16 rounded-full" /></td>
      <td className="px-3 py-4"><SkeletonBox className="h-3.5 w-8" /></td>
      <td className="px-3 py-4"><SkeletonBox className="h-3.5 w-6" /></td>
      <td className="px-3 py-4"><SkeletonBox className="h-5 w-20 rounded-full" /></td>
      <td className="px-3 py-4"><SkeletonBox className="h-3.5 w-20" /></td>
      <td className="px-3 py-4"><SkeletonBox className="w-6 h-6 rounded-lg" /></td>
    </tr>
  );
}

export function StatCardSkeleton() {
  return (
    <div className="bg-white dark:bg-card rounded-2xl border border-gray-100 dark:border-border p-5">
      <div className="flex items-center justify-between mb-3">
        <SkeletonBox className="w-10 h-10 rounded-xl" />
        <SkeletonBox className="h-5 w-14 rounded-full" />
      </div>
      <SkeletonBox className="h-7 w-24 mb-1" />
      <SkeletonBox className="h-3 w-20" />
    </div>
  );
}

export function BlogCardSkeleton() {
  return (
    <div className="bg-white dark:bg-card rounded-2xl border border-gray-100 dark:border-border overflow-hidden">
      <SkeletonBox className="h-44 rounded-none" />
      <div className="p-5 space-y-3">
        <div className="flex gap-2">
          <SkeletonBox className="h-5 w-16 rounded-full" />
          <SkeletonBox className="h-5 w-20 rounded-full" />
        </div>
        <SkeletonBox className="h-5 w-full" />
        <SkeletonBox className="h-4 w-full" />
        <SkeletonBox className="h-4 w-2/3" />
        <div className="flex items-center gap-2 pt-2">
          <SkeletonBox className="w-7 h-7 rounded-full" />
          <SkeletonBox className="h-3.5 w-24" />
        </div>
      </div>
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>
      {/* Charts */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-card rounded-2xl border border-gray-100 dark:border-border p-6">
          <div className="flex justify-between mb-5">
            <div className="space-y-1.5">
              <SkeletonBox className="h-5 w-28" />
              <SkeletonBox className="h-3.5 w-40" />
            </div>
            <SkeletonBox className="h-7 w-24 rounded-lg" />
          </div>
          <SkeletonBox className="h-48 w-full rounded-xl" />
        </div>
        <div className="bg-white dark:bg-card rounded-2xl border border-gray-100 dark:border-border p-6">
          <SkeletonBox className="h-5 w-28 mb-5" />
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="space-y-1.5">
                <div className="flex justify-between">
                  <SkeletonBox className="h-3.5 w-32" />
                  <SkeletonBox className="h-3.5 w-12" />
                </div>
                <SkeletonBox className="h-2 w-full rounded-full" />
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* Recent */}
      <div className="grid lg:grid-cols-2 gap-6">
        {[0, 1].map((i) => (
          <div key={i} className="bg-white dark:bg-card rounded-2xl border border-gray-100 dark:border-border p-6">
            <SkeletonBox className="h-5 w-36 mb-5" />
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, j) => (
                <div key={j} className="flex items-center gap-3 p-3 bg-[#f8f9fb] dark:bg-muted rounded-xl">
                  <SkeletonBox className="w-9 h-9 rounded-full" />
                  <div className="flex-1 space-y-1.5">
                    <SkeletonBox className="h-3.5 w-28" />
                    <SkeletonBox className="h-3 w-40" />
                  </div>
                  <SkeletonBox className="h-5 w-16 rounded-full" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

