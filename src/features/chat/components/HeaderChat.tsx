"use client";

import { SquareArrowOutUpRightIcon, XIcon } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/UserAvatar";
import { useChat } from "@/context/ChatContext";
import { useUserProfile } from "@/hooks/useUserProfile";
import { ROUTES } from "@/lib/routes";

export const HeaderChat = () => {
  const { closeChat, activeParticipantId } = useChat();
  const { profile } = useUserProfile(activeParticipantId ?? undefined);

  return (
    <div className="flex items-center justify-between border-b px-3 h-12 bg-background/95 shrink-0">
      <div className="flex items-center gap-2 min-w-0">
        {profile ? (
          <>
            <UserAvatar photoURL={profile.photoURL} />
            <span className="font-medium truncate">{profile.displayName}</span>
          </>
        ) : (
          <span className="text-muted-foreground text-sm">Выберите собеседника</span>
        )}
      </div>

      <div className="flex items-center gap-1 shrink-0">
        <Link
          href={ROUTES.CHAT}
          className="p-2 rounded-full hover:bg-accent hover:text-accent-foreground"
        >
          <SquareArrowOutUpRightIcon width={16} height={16} />
        </Link>
        <Button
          onClick={closeChat}
          className="cursor-pointer rounded-full p-2 hover:bg-accent hover:text-accent-foreground"
          variant="ghost"
          size="icon-sm"
        >
          <XIcon />
        </Button>
      </div>
    </div>
  );
};
