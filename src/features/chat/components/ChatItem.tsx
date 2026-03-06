import { UserAvatar } from "@/components/UserAvatar";
import { cn } from "@/lib/utils";

interface IChatItemProps {
  id: string;
  name: string;
  avatar?: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount?: number;
  isActive?: boolean;
  isOnline?: boolean;
  onClick?: () => void;
}

export const ChatItem = ({
  id,
  name,
  avatar,
  lastMessage,
  lastMessageTime,
  unreadCount,
  isActive,
  isOnline,
  onClick,
}: IChatItemProps) => {
  return (
    <div
      onClick={onClick}
      className={cn(
        "group flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-colors",
        isActive ? "bg-accent text-accent-foreground" : "hover:bg-accent/60 text-foreground/90"
      )}
    >
      <div className="relative">
        <UserAvatar />

        {isOnline && (
          <span className="absolute bottom-0 right-0 h-2 w-2 rounded-full bg-green-500 ring-2 ring-background" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-baseline">
          <p className="font-medium truncate">{name}</p>
          <span className="text-xs text-muted-foreground whitespace-nowrap pl-2">
            {lastMessageTime}
          </span>
        </div>

        <p className="text-sm text-muted-foreground truncate mt-0.5">{lastMessage}</p>
      </div>

      {!!unreadCount && unreadCount > 0 && (
        <div className="ml-2 shrink-0">
          <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-xs font-medium text-primary-foreground">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        </div>
      )}
    </div>
  );
};
