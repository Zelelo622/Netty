"use client";

import EmojiPicker, { EmojiClickData, Theme } from "emoji-picker-react";
import { SendHorizonal, Smile } from "lucide-react";
import { KeyboardEvent, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface IInputChatProps {
  onSend: (text: string) => Promise<void>;
  disabled?: boolean;
}

export const InputChat = ({ onSend, disabled }: IInputChatProps) => {
  const [message, setMessage] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [openEmoji, setOpenEmoji] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const onEmojiClick = (emojiData: EmojiClickData) => {
    setMessage((prev) => prev + emojiData.emoji);
    setOpenEmoji(false);
  };

  const handleSend = async () => {
    const trimmed = message.trim();
    if (!trimmed || isSending) return;

    setMessage("");
    setIsSending(true);
    try {
      await onSend(trimmed);
    } catch (err) {
      console.error("[InputChat] send failed:", err);
      setMessage(trimmed); // возвращаем текст если ошибка
    } finally {
      setIsSending(false);
      textareaRef.current?.focus();
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
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
            placeholder={disabled ? "Выберите собеседника..." : "Сообщение..."}
            disabled={disabled || isSending}
            rows={1}
            className={cn(
              "min-h-11 max-h-35 resize-none bg-transparent! border-0 px-2 py-2.5 text-base",
              "focus-visible:ring-0 focus-visible:ring-offset-0",
              "scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent"
            )}
          />
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-1">
              <Popover open={openEmoji} onOpenChange={setOpenEmoji}>
                <PopoverTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="cursor-pointer h-9 w-9 rounded-full text-muted-foreground hover:text-foreground"
                    disabled={disabled}
                    title="Эмодзи"
                  >
                    <Smile />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 border-none shadow-xl">
                  <EmojiPicker
                    onEmojiClick={onEmojiClick}
                    autoFocusSearch={false}
                    theme={Theme.DARK}
                    skinTonesDisabled
                    previewConfig={{ showPreview: false }}
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="flex items-center">
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="cursor-pointer h-9 w-9 rounded-full"
                onClick={handleSend}
                disabled={isEmpty || disabled || isSending}
              >
                <SendHorizonal />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
