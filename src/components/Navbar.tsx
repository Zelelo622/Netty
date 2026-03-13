"use client";

import { signOut } from "firebase/auth";
import { Bell, MessageCircle, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/context/AuthContext";
import { useChat } from "@/context/ChatContext";
import { MAX_VISUAL_DEPTH } from "@/features/comments/components/CommentItem";
import { NotificationItem } from "@/features/notifications/components/NotificationItem";
import { ROUTES } from "@/lib/routes";
import { UserProfileCache } from "@/lib/userProfileCache";
import { cn, getNotificationText } from "@/lib/utils";
import { NotificationService } from "@/services/notification.service";
import { INotification } from "@/types/types";

import { LogoTextIcon } from "./icons/LogoTextIcon";
import { MaskotIcon } from "./icons/MaskotIcon";
import { ModeToggle } from "./ThemeToggle";
import { ScrollArea } from "./ui/scroll-area";
import { SidebarTrigger } from "./ui/sidebar";
import { UserAvatar } from "./UserAvatar";
import { auth } from "../lib/firebase";

function Navbar() {
  const { user, loading } = useAuth();
  const { toggleChat, isOpen } = useChat();
  const router = useRouter();

  const [notifications, setNotifications] = useState<INotification[]>([]);
  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    if (!user?.uid) return;

    const unsubscribe = NotificationService.subscribeToNotifications(user.uid, (data) => {
      const uniqueIds = [...new Set(data.map((n) => n.issuerId))];
      uniqueIds.forEach((uid) => UserProfileCache.fetch(uid));

      if (notifications.length > 0 && data.length > notifications.length) {
        const newNotify = data[0];
        if (!newNotify.read) {
          const issuerName = UserProfileCache.get(newNotify.issuerId)?.displayName ?? "Кто-то";
          toast.info(`${issuerName} ${getNotificationText(newNotify.type)}`, {
            description: "Нажмите, чтобы посмотреть",
            position: "top-right",
            action: {
              label: "Открыть",
              onClick: () => handleNotificationClick(newNotify),
            },
          });
        }
      }
      setNotifications(data);
    });

    return () => unsubscribe();
  }, [user?.uid, notifications.length]);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      await fetch("/api/auth/logout", { method: "POST" });
      router.refresh();
      router.push(ROUTES.AUTH);
    } catch (error) {
      console.error("Ошибка при выходе:", error);
    }
  };

  const handleClearAll = async () => {
    if (!user?.uid) return;
    try {
      await NotificationService.clearAllNotifications(user.uid);
      toast.success("Уведомления очищены");
    } catch (_error) {
      toast.error("Не удалось очистить уведомления");
    }
  };

  const handleNotificationClick = async (notification: INotification) => {
    if (!notification.read) {
      await NotificationService.markAsRead(notification.id);
    }

    const postUrl = ROUTES.POST(notification.communityName, notification.postId);

    if (!notification.commentId) {
      router.push(postUrl);
      return;
    }

    const comment = await NotificationService.getCommentById(notification.commentId);

    if (!comment) {
      router.push(postUrl);
      return;
    }

    if (comment.depth >= MAX_VISUAL_DEPTH && comment.parentId) {
      router.push(
        `${ROUTES.COMMENT_THREAD(notification.communityName, notification.postId, comment.parentId)}?highlight=${notification.commentId}#${notification.commentId}`
      );
    } else {
      router.push(`${postUrl}?highlight=${notification.commentId}#${notification.commentId}`);
    }
  };

  return (
    <nav className="h-16 w-full flex items-center border-b px-4 md:px-8 lg:px-14 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 sticky top-0 z-50">
      <SidebarTrigger className="-ml-1 md:hidden" />
      <div className="flex justify-between items-center w-full">
        <Link href={ROUTES.HOME} className="flex items-center gap-x-1 h-full">
          <MaskotIcon className="h-14 w-auto" />
          <LogoTextIcon className="h-14 w-fit hidden lg:block" />
        </Link>

        <div className="flex items-center gap-x-4">
          <ModeToggle />
          {user && (
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleChat}
              className={cn(
                "rounded-full cursor-pointer transition-colors",
                isOpen && "bg-primary/10 text-primary"
              )}
            >
              <MessageCircle className="h-5 w-5" />
            </Button>
          )}

          <div className="flex items-center justify-end gap-x-2">
            {loading ? (
              <Skeleton className="h-9 w-24 rounded-md" />
            ) : user ? (
              <>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="relative rounded-full cursor-pointer"
                    >
                      <Bell className="h-5 w-5" />
                      {unreadCount > 0 && (
                        <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-white">
                          {unreadCount > 9 ? "9+" : unreadCount}
                        </span>
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-80" align="end">
                    <DropdownMenuLabel className="flex justify-between items-center">
                      Уведомления
                      {unreadCount > 0 && (
                        <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                          {unreadCount} новых
                        </span>
                      )}
                      {notifications.length > 0 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="cursor-pointer h-7 text-[11px] text-muted-foreground hover:text-destructive"
                          onClick={handleClearAll}
                        >
                          <Trash2 className="h-3 w-3 mr-1" />
                          Очистить всё
                        </Button>
                      )}
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <ScrollArea className="h-[300px]">
                      {notifications.length > 0 ? (
                        notifications.map((n) => (
                          <NotificationItem
                            key={n.id}
                            notification={n}
                            onClick={handleNotificationClick}
                          />
                        ))
                      ) : (
                        <div className="p-4 text-center text-sm text-muted-foreground">
                          У вас пока нет уведомлений
                        </div>
                      )}
                    </ScrollArea>
                  </DropdownMenuContent>
                </DropdownMenu>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="relative h-10 w-10 rounded-full cursor-pointer focus-visible:ring-0 focus-visible:ring-offset-0"
                    >
                      <UserAvatar
                        photoURL={user.photoURL}
                        displayName={user.displayName}
                        size={40}
                      />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuItem className="cursor-pointer">
                      <Link href={ROUTES.PROFILE(user.displayName!)}>
                        <div className="flex flex-col space-y-1">
                          <p className="text-sm font-medium leading-none">
                            {user.displayName || "Пользователь"}
                          </p>
                          <p className="text-xs leading-none text-muted-foreground truncate">
                            {user.email}
                          </p>
                        </div>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild className="cursor-pointer">
                      <Link href={ROUTES.SETTINGS}>Настройки</Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-destructive cursor-pointer focus:bg-destructive/10"
                      onClick={handleSignOut}
                    >
                      Выйти
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <div className="flex items-center gap-x-2">
                <Link href={`${ROUTES.AUTH}?mode=register`}>
                  <Button variant="ghost" size="sm" className="cursor-pointer">
                    Регистрация
                  </Button>
                </Link>
                <Link href={`${ROUTES.AUTH}?mode=login`}>
                  <Button size="sm" className="cursor-pointer">
                    Войти
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
