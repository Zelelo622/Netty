"use client";

import { Timestamp } from "firebase/firestore";

import { UserAvatar } from "@/components/UserAvatar";
import { cn } from "@/lib/utils";
import { IMessage } from "@/types/types";

interface IMessageBubbleProps {
  message: IMessage;
  currentUserId: string;
  otherAvatar?: string | null;
}

function formatTime(ts: Timestamp | null | undefined): string {
  if (!ts) return "";
  return ts.toDate().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export const MessageBubble = ({ message, currentUserId, otherAvatar }: IMessageBubbleProps) => {
  const isOwn = message.senderId === currentUserId;

  return (
    <div
      className={cn(
        "flex gap-2 max-w-[80%] items-end mb-2",
        isOwn ? "ml-auto flex-row-reverse" : "mr-auto"
      )}
    >
      {!isOwn && (
        <div className="shrink-0">
          <UserAvatar photoURL={otherAvatar} />
        </div>
      )}

      <div
        className={cn(
          "px-3 py-2 rounded-2xl text-sm leading-relaxed wrap-break-word",
          isOwn ? "bg-primary text-primary-foreground rounded-br-none" : "bg-muted rounded-bl-none",
          message.isPending && "opacity-60",
          message.isFailed && "border border-destructive"
        )}
      >
        {message.text}
        <div className="text-xs opacity-60 mt-0.5 text-right select-none">
          {formatTime(message.createdAt)}
          {message.isFailed && " · Ошибка"}
        </div>
      </div>
    </div>
  );
};
