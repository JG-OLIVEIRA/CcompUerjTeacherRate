import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function Loading() {
  return (
    <div className="flex flex-col h-screen bg-background">
      <header className="flex items-center justify-between p-4 border-b">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-10 w-24" />
      </header>
      <main className="flex-grow p-4 md:p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        <Card className="flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between">
                <Skeleton className="h-8 w-32" />
                <div className="flex gap-2">
                    <Skeleton className="h-10 w-32" />
                    <Skeleton className="h-10 w-32" />
                </div>
            </CardHeader>
            <CardContent className="flex-grow">
                <Skeleton className="h-full w-full rounded-md" />
            </CardContent>
        </Card>
        <Card className="flex flex-col">
            <CardHeader>
                <Skeleton className="h-8 w-40" />
            </CardHeader>
            <CardContent className="flex-grow space-y-4">
                <Skeleton className="h-10 w-full" />
                <div className="space-y-2 pt-4">
                  <Skeleton className="h-6 w-1/3" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
            </CardContent>
        </Card>
      </main>
    </div>
  );
}
