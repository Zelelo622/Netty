import { cn } from "@/lib/utils";
import { IMessage } from "@/types/types";

interface IMessageBubbleProps {
  message: IMessage;
}

export const MessageBubble = ({ message }: IMessageBubbleProps) => {
  const isUser = message.sender === "user";

  return (
    <div
      className={cn("flex gap-3 max-w-[80%] items-end", isUser ? "ml-auto justify-end" : "mr-auto")}
    >
      {!isUser && <div className="w-8 h-8 rounded-full bg-primary/20 shrink-0" />}

      <div
        className={cn(
          "px-4 py-2.5 rounded-2xl text-sm leading-relaxed",
          isUser ? "bg-primary text-primary-foreground rounded-br-none" : "bg-muted rounded-bl-none"
        )}
      >
        {message.text}
        <div className="text-xs opacity-60 mt-1 text-right">
          {message.timestamp.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </div>
      </div>

      {isUser && <div className="w-8 h-8 rounded-full bg-primary/10 shrink-0" />}
    </div>
  );
};
