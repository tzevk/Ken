function Bone({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-border/60 ${className}`} />;
}

export default function DashboardSkeleton() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-12">
      <div className="flex items-center justify-between gap-4">
        <div className="space-y-2">
          <Bone className="h-3 w-24" />
          <Bone className="h-7 w-64" />
          <Bone className="h-3 w-40" />
        </div>
        <Bone className="h-8 w-28 rounded-full" />
      </div>
      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className="card space-y-4 p-6">
            <Bone className="h-4 w-40" />
            <div className="grid gap-4 sm:grid-cols-2">
              <Bone className="h-32" />
              <Bone className="h-32" />
            </div>
          </div>
          <div className="card space-y-4 p-6">
            <Bone className="h-4 w-40" />
            <Bone className="h-56" />
          </div>
        </div>
        <div className="space-y-6">
          <div className="card space-y-3 p-6">
            <Bone className="h-4 w-32" />
            <Bone className="h-4 w-full" />
            <Bone className="h-4 w-5/6" />
            <Bone className="h-4 w-3/4" />
          </div>
        </div>
      </div>
      <p className="mt-8 text-center text-xs text-foreground/40">
        Loading your data, projecting goals, and benchmarking against peers…
      </p>
    </main>
  );
}
