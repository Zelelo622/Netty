import { MaskotIcon } from "@/components/MaskotIcon";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/routes";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[calc(100vh-64px)] w-full flex-col items-center justify-center p-6 text-center">
      <div className="relative mb-1 animate-bounce duration-3000 sm:mb-8">
        <MaskotIcon className="h-40 w-auto opacity-80 grayscale-[0.5]" />
        <div className="absolute -top-4 -right-8 bg-destructive text-destructive-foreground px-3 py-1 rounded-full text-sm font-bold rotate-12 shadow-lg text-white">
          404: Потерялся?
        </div>
      </div>

      <h1 className="text-4xl font-black mb-2 text-primary">
        Упс! Тут пусто...
      </h1>
      <p className="text-muted-foreground max-w-[400px] mb-8">
        Твой маленький помощник обнюхал каждый угол, но так и не смог найти эту
        страницу. Возможно, она переехала или её никогда не существовало.
      </p>

      <div className="flex gap-4">
        <Link href={ROUTES.HOME}>
          <Button variant="default" className="font-bold px-8 cursor-pointer">
            НА ГЛАВНУЮ
          </Button>
        </Link>
      </div>

      <div className="mt-12 text-xs text-muted-foreground/50 uppercase tracking-widest">
        Netty Security System v1.0
      </div>
    </div>
  );
}
