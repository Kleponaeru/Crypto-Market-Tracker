import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function DashboardSkeleton() {
  return (
    <div className="mx-auto w-full max-w-[1440px] space-y-7 p-4 sm:p-6 lg:p-8" aria-label="Loading market dashboard">
      <div className="flex flex-col gap-4 border-b border-border/70 pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-3">
          <Skeleton className="h-6 w-36 rounded-full" />
          <Skeleton className="h-10 w-64 max-w-full" />
          <Skeleton className="h-4 w-80 max-w-full" />
        </div>
        <Skeleton className="h-10 w-28" />
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5">
        {Array.from({ length: 5 }).map((_, index) => (
          <Card key={index} className="rounded-2xl">
            <CardContent className="space-y-4 p-5">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-8 w-36" />
              <Skeleton className="h-3 w-28" />
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <Card className="overflow-hidden rounded-2xl">
          <CardContent className="space-y-5 p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <Skeleton className="h-8 w-52" />
              <Skeleton className="h-9 w-56" />
            </div>
            {Array.from({ length: 7 }).map((_, index) => (
              <Skeleton key={index} className="h-11 w-full" />
            ))}
          </CardContent>
        </Card>
        <Card className="overflow-hidden rounded-2xl">
          <CardContent className="space-y-5 p-5">
            <Skeleton className="h-8 w-48" />
            {Array.from({ length: 6 }).map((_, index) => (
              <Skeleton key={index} className="h-12 w-full" />
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
