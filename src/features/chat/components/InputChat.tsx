"use client";

import { Paperclip, SendHorizonal, Smile } from "lucide-react";
import { KeyboardEvent, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

export const InputChat = () => {
  const [message, setMessage] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    if (message.trim()) {
      // TODO: пока что временно
      console.log("Отправляем: ", message);
      setMessage("");
      textareaRef.current?.focus();
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();

      if (message.trim()) {
        // TODO: пока что временно
        console.log("Отправляем: ", message.trim());
        setMessage("");
      }
    }
  };

  const isEmpty = message.trim() === "";

  return (
    <div className="p-3 pb-4 border-t bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div
        className={cn(
          "relative rounded-xl border bg-input/30 shadow-sm transition-all",
          isFocused && "ring-1 ring-ring shadow-md"
        )}
      >
        <div className="flex flex-col items-start gap-2 px-2 py-1.5">
          <Textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder="Сообщение..."
            rows={1}
            className={cn(
              "min-h-11 max-h-35 resize-none bg-transparent! border-0 px-2 py-2.5 text-base",
              "focus-visible:ring-0 focus-visible:ring-offset-0",
              "scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent"
            )}
          />
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-1">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="cursor-pointer h-9 w-9 rounded-full text-muted-foreground hover:text-foreground"
                title="Эмодзи"
              >
                <Smile />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="cursor-pointer h-9 w-9 rounded-full text-muted-foreground hover:text-foreground"
                title="Прикрепить"
              >
                <Paperclip />
              </Button>
            </div>
            <div className="flex items-center">
              <Button
                type="button"
                variant={"outline"}
                size="icon"
                className="cursor-pointer h-9 w-9 rounded-full"
                onClick={handleSend}
                disabled={isEmpty}
              >
                <SendHorizonal />
              </Button>
            </div>
          </div>
        </div>

        <input type="file" id="file-upload" className="hidden" />
      </div>
    </div>
  );
};
