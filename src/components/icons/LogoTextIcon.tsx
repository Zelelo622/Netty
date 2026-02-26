import { cn } from "@/lib/utils";

export function LogoTextIcon({ className }: { className?: string }) {
  return (
    <svg
      width="240"
      height="80"
      viewBox="0 0 240 80"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("h-14 w-auto", className)}
    >
      <style>{`.netty-text { font-family: sans-serif; font-weight: 800; font-size: 54px; }`}</style>

      <text x="10" y="60" className="netty-text fill-foreground/90 dark:fill-foreground">
        N<tspan className="fill-primary">e</tspan>tty
      </text>

      {/* Оранжевая точка */}
      <circle cx="215" cy="25" r="7" className="fill-chart-1" />

      {/* Синяя линия */}
      <path d="M215,32 L215,50" strokeWidth="4" strokeLinecap="round" className="stroke-primary" />
    </svg>
  );
}
