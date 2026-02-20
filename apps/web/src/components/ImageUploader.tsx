"use client";
import { ImageIcon, X, Link as LinkIcon, Check } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface IImageUploaderProps {
  url: string;
  onChange: (v: string) => void;
  variant?: "default" | "compact";
}

export function ImageUploader({ url, onChange, variant = "default" }: IImageUploaderProps) {
  const isCompact = variant === "compact";

  return (
    <div className="w-full">
      {!isCompact && url && (
        <div className="relative group rounded-3xl overflow-hidden border bg-muted/30 mb-4">
          <img src={url} alt="Preview" className="w-full max-h-125 object-contain mx-auto" />
          <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="destructive"
              size="sm"
              onClick={() => onChange("")}
              className="cursor-pointer rounded-full shadow-xl"
            >
              <X className="h-4 w-4 mr-2" /> Удалить
            </Button>
          </div>
        </div>
      )}

      <Popover>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            className={cn(
              "w-full rounded-xl border-2 border-dashed gap-3 text-muted-foreground hover:border-primary/40 transition-all",
              isCompact ? "h-10 text-sm justify-start px-3" : "h-16 text-lg font-semibold"
            )}
          >
            <ImageIcon className={cn(isCompact ? "h-4 w-4" : "h-6 w-6")} />
            <span className="truncate">
              {url
                ? isCompact
                  ? "Ссылка добавлена"
                  : "Изменить обложку"
                : isCompact
                  ? "Указать ссылку..."
                  : "Добавить обложку"}
            </span>
            {isCompact && url && <Check className="h-4 w-4 ml-auto text-green-500" />}
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-80 p-4 rounded-2xl shadow-2xl"
          align={isCompact ? "center" : "start"}
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider text-muted-foreground">
                <LinkIcon className="h-3 w-3 text-primary" /> Ссылка на фото
              </div>
              {url && (
                <button
                  onClick={() => onChange("")}
                  className="text-[10px] text-destructive hover:underline"
                >
                  Удалить
                </button>
              )}
            </div>
            <Input
              placeholder="https://example.com/image.jpg"
              value={url}
              onChange={(e) => onChange(e.target.value)}
              className="rounded-lg h-9 text-sm"
              autoFocus
            />
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
