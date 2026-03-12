"use client";

import EmojiPicker, { EmojiClickData, Theme } from "emoji-picker-react";
import { CheckCheck, Clock } from "lucide-react";
import { useState } from "react";

import { ContextMenu, ContextMenuContent, ContextMenuTrigger } from "@/components/ui/context-menu";
import { UserAvatar } from "@/components/UserAvatar";
import { cn, formatTime } from "@/lib/utils";
import { ChatService } from "@/services/chat.service";
import { IMessage } from "@/types/types";

interface IMessageBubbleProps {
  message: IMessage;
  currentUserId: string;
  otherAvatar?: string | null;
  convId: string;
}

export const MessageBubble = ({
  message,
  currentUserId,
  otherAvatar,
  convId,
}: IMessageBubbleProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const isOwn = message.senderId === currentUserId;

  const handleEmojiClick = async (emojiData: EmojiClickData | { emoji: string }) => {
    const newEmoji = emojiData.emoji;

    let currentReaction: string | null = null;
    if (message.reactions) {
      currentReaction =
        Object.keys(message.reactions).find((key) =>
          message.reactions?.[key]?.includes(currentUserId)
        ) || null;
    }

    const action = currentReaction === newEmoji ? "remove" : "add";
    setIsOpen(false);

    try {
      await ChatService.toggleReaction(
        convId,
        message.id,
        currentUserId,
        newEmoji,
        action,
        currentReaction
      );
    } catch (error) {
      console.error("Failed to toggle reaction:", error);
    }
  };
  const renderStatus = () => {
    if (!isOwn) return null;

    if (message.isPending) {
      return <Clock className="h-3.5 w-3.5 opacity-60" />;
    }

    if (message.isFailed) {
      return null;
    }

    if (message.read) {
      return <CheckCheck className="h-3.5 w-3.5 text-green-500" />;
    }

    return <CheckCheck className="h-3.5 w-3.5 opacity-60" />;
  };

  return (
    <div className={cn("flex flex-col mb-2", isOwn ? "items-end" : "items-start")}>
      <div
        className={cn("flex gap-2 max-w-[80%] items-end", isOwn ? "flex-row-reverse" : "flex-row")}
      >
        {!isOwn && (
          <div className="shrink-0">
            <UserAvatar photoURL={otherAvatar} />
          </div>
        )}

        <ContextMenu onOpenChange={setIsOpen}>
          <ContextMenuTrigger>
            <div
              className={cn(
                "px-3 py-2 rounded-2xl text-sm leading-relaxed wrap-break-word cursor-default",
                isOwn
                  ? "bg-primary text-primary-foreground rounded-br-none"
                  : "bg-muted rounded-bl-none",
                message.isPending && "opacity-60",
                message.isFailed && "border border-destructive"
              )}
            >
              {message.text}
              <div className="text-xs opacity-60 mt-0.5 text-right select-none">
                <div className="flex flex-row-reverse items-center justify-between gap-2">
                  {formatTime(message.createdAt)}
                  {renderStatus()}
                </div>
                {message.isFailed && " · Ошибка"}
              </div>
            </div>
          </ContextMenuTrigger>

          <ContextMenuContent className="p-0 border-none bg-transparent shadow-none">
            {!message.isPending && (
              <EmojiPicker
                open={isOpen}
                theme={Theme.DARK}
                onEmojiClick={handleEmojiClick}
                reactionsDefaultOpen={true}
                allowExpandReactions={false}
              />
            )}
          </ContextMenuContent>
        </ContextMenu>
      </div>

      {message.reactions && Object.keys(message.reactions).length > 0 && (
        <div className={cn("flex flex-wrap gap-1 mt-1", isOwn ? "mr-1" : "ml-12")}>
          {Object.entries(message.reactions).map(
            ([emoji, uids]) =>
              uids &&
              uids.length > 0 && (
                <button
                  key={emoji}
                  onClick={() => handleEmojiClick({ emoji })}
                  className={cn(
                    "flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] border transition-all active:scale-90",
                    uids.includes(currentUserId)
                      ? "bg-primary/20 border-primary/40 text-primary"
                      : "bg-muted border-transparent"
                  )}
                >
                  <span>{emoji}</span>
                  <span className="font-bold">{uids.length}</span>
                </button>
              )
          )}
        </div>
      )}
    </div>
  );
};
