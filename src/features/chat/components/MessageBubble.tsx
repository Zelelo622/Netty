"use client";

import EmojiPicker, { EmojiClickData, Theme } from "emoji-picker-react";
import { CheckCheck, Clock, Pencil } from "lucide-react";
import { useState } from "react";

import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { UserAvatar } from "@/components/UserAvatar";
import { cn, formatTime } from "@/lib/utils";
import { ChatService } from "@/services/chat.service";
import { IMessage } from "@/types/types";

import { ParseMessageText } from "./ParseMessageText";

interface IMessageBubbleProps {
  message: IMessage;
  currentUserId: string;
  otherAvatar?: string | null;
  convId: string;
  onEdit: (message: IMessage) => void;
}

export const MessageBubble = ({
  message,
  currentUserId,
  otherAvatar,
  convId,
  onEdit,
}: IMessageBubbleProps) => {
  const [menuKey, setMenuKey] = useState(0);
  const isOwn = message.senderId === currentUserId;
  const closeMenu = () => setMenuKey((prev) => prev + 1);

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
    closeMenu();

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
    <div key={menuKey} className={cn("flex flex-col mb-2", isOwn ? "items-end" : "items-start")}>
      <div
        className={cn(
          "flex gap-2 max-w-[80%] items-end overflow-hidden",
          isOwn ? "flex-row-reverse" : "flex-row"
        )}
      >
        {!isOwn && (
          <div className="shrink-0">
            <UserAvatar photoURL={otherAvatar} />
          </div>
        )}

        <ContextMenu>
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
              <span className="whitespace-pre-wrap wrap-anywhere">
                {ParseMessageText(message.text)}
              </span>
              <div className="text-xs opacity-60 mt-0.5 text-right select-none">
                <div className="flex flex-row-reverse items-center justify-between gap-2">
                  {formatTime(message.createdAt)}
                  <div className="flex gap-1 items-center">
                    {renderStatus()}
                    {message.isEdited && <span>ред.</span>}
                  </div>
                </div>
                {message.isFailed && " · Ошибка"}
              </div>
            </div>
          </ContextMenuTrigger>

          <ContextMenuContent>
            {!message.isPending && (
              <>
                {isOwn && (
                  <ContextMenuItem
                    onSelect={() => onEdit(message)}
                    className="flex items-center gap-2 px-3 py-2 cursor-pointer rounded-md text-sm font-medium"
                  >
                    <Pencil className="h-4 w-4" />
                    Редактировать
                  </ContextMenuItem>
                )}
                <div className="pt-1 border-t mt-1">
                  <EmojiPicker
                    theme={Theme.DARK}
                    onEmojiClick={(emojiData) => {
                      handleEmojiClick(emojiData);
                    }}
                    reactionsDefaultOpen={true}
                    allowExpandReactions={false}
                  />
                </div>
              </>
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
