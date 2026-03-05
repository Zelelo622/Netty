import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { useUserProfile } from "@/hooks/useUserProfile";
import { getNotificationText } from "@/lib/utils";
import { INotification } from "@/types/types";

export const NotificationItem = ({
  notification,
  onClick,
}: {
  notification: INotification;
  onClick: (n: INotification) => void;
}) => {
  const { profile } = useUserProfile(notification.issuerId);

  return (
    <DropdownMenuItem
      key={notification.id}
      className={`flex flex-col items-start gap-1 p-3 cursor-pointer focus:bg-muted ${!notification.read ? "bg-primary/5" : ""}`}
      onClick={() => onClick(notification)}
    >
      <div className="flex items-center gap-2 w-full">
        <span className="font-bold text-xs">{profile?.displayName ?? "..."}</span>
        <span className="text-xs text-muted-foreground">
          {getNotificationText(notification.type)}
        </span>
      </div>
      <span className="text-[10px] text-muted-foreground uppercase">недавно</span>
    </DropdownMenuItem>
  );
};
