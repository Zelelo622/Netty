import { cn } from "@/lib/utils";

export function MaskotIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 200 200"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("h-14 w-fit", className)}
    >
      {/* Маскот */}
      <rect x="70" y="130" width="60" height="40" rx="20" className="fill-primary" />
      <line
        x1="100"
        y1="60"
        x2="100"
        y2="30"
        strokeWidth="6"
        strokeLinecap="round"
        className="stroke-primary"
      />
      <path
        d="M100,50 C60,50 40,75 40,100 C40,125 60,150 100,150 C110,150 120,148 130,145 L160,155 L150,125 C157,118 160,110 160,100 C160,75 140,50 100,50 Z"
        className="fill-primary"
      />

      {/* Оранжевый шар */}
      <circle cx="100" cy="25" r="10" className="fill-chart-1" />

      {/* Глаза */}
      <circle cx="75" cy="100" r="8" className="fill-white dark:fill-background" />
      <circle cx="125" cy="100" r="8" className="fill-white dark:fill-background" />
    </svg>
  );
}
