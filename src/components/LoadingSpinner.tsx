import { cn } from "@/lib/utils";

interface ILoadingStateProps {
  description?: string;
  className?: string;
}

export function LoadingSpinner({
  description = "Загрузка...",
  className,
}: ILoadingStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 w-full max-w-2xl mx-auto py-20 items-center justify-center",
        className,
      )}
    >
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      {description && (
        <p className="text-sm text-muted-foreground animate-pulse font-medium tracking-wide">
          {description}
        </p>
      )}
    </div>
  );
}
