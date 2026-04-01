import { cn } from "@/lib/utils";

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse bg-slate-200 rounded", className)} />;
}

export function CardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
      <Skeleton className="h-5 w-1/3" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-4/5" />
      <Skeleton className="h-4 w-2/3" />
    </div>
  );
}

export function AnalysisSkeleton() {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-slate-200 p-10 flex flex-col items-center">
        <Skeleton className="h-5 w-40 mb-6" />
        <Skeleton className="h-40 w-40 rounded-full" />
      </div>
      <div className="grid md:grid-cols-2 gap-6">
        <CardSkeleton />
        <CardSkeleton />
      </div>
      <CardSkeleton />
    </div>
  );
}

export function ChatSkeleton() {
  return (
    <div className="space-y-4 p-4">
      <div className="flex gap-3">
        <Skeleton className="w-8 h-8 rounded-lg flex-shrink-0" />
        <Skeleton className="h-20 w-3/4 rounded-2xl" />
      </div>
      <div className="flex gap-3 justify-end">
        <Skeleton className="h-12 w-2/3 rounded-2xl" />
        <Skeleton className="w-8 h-8 rounded-lg flex-shrink-0" />
      </div>
    </div>
  );
}
