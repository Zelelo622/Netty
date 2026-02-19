import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  ArrowBigDown,
  ArrowBigUp,
  MessageSquare,
  MoreHorizontal,
} from "lucide-react";

// Компонент одного комментария (рекурсивный)
export default function CommentItem({ depth = 0 }: { depth?: number }) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3",
        depth > 0 &&
          "mt-4 ml-2 md:ml-6 pl-4 border-l-2 border-muted hover:border-primary/20 transition-colors",
      )}
    >
      {/* Шапка комментария */}
      <div className="flex items-center gap-2">
        <Avatar className="h-6 w-6">
          <AvatarFallback className="text-[10px]">AI</AvatarFallback>
        </Avatar>
        <span className="text-xs font-bold">u/username</span>
        <span className="text-[10px] text-muted-foreground">5 ч. назад</span>
      </div>

      {/* Текст */}
      <div className="text-sm leading-relaxed text-foreground/90">
        Это пример комментария. Здесь может быть много текста, который объясняет
        суть древовидной структуры.
      </div>

      {/* Действия */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1 bg-muted/30 rounded-full px-2 py-0.5">
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 hover:text-orange-600"
          >
            <ArrowBigUp className="h-4 w-4" />
          </Button>
          <span className="text-[11px] font-bold">12</span>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 hover:text-blue-600"
          >
            <ArrowBigDown className="h-4 w-4" />
          </Button>
        </div>

        <Button
          variant="ghost"
          size="sm"
          className="h-7 gap-1.5 text-xs text-muted-foreground hover:bg-muted"
        >
          <MessageSquare className="h-3.5 w-3.5" />
          Ответить
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-muted-foreground"
        >
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </div>

      {/* Рекурсивный вызов для вложенных ответов (имитация) */}
      {depth < 2 && (
        <div className="space-y-4">
          <CommentItem depth={depth + 1} />
        </div>
      )}
    </div>
  );
};
