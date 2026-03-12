"use client";

import { Timestamp } from "firebase/firestore";
import { CheckCheck, Clock } from "lucide-react";

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
          <div className="flex flex-row-reverse items-center justify-between">
            {formatTime(message.createdAt)}
            {renderStatus()}
          </div>
          {message.isFailed && " · Ошибка"}
        </div>
      </div>
    </div>
  );
};
