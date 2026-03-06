"use client";

import { SquareArrowOutUpRightIcon, XIcon } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { useChat } from "@/context/ChatContext";
import { ROUTES } from "@/lib/routes";

export const HeaderChat = () => {
  const { closeChat } = useChat();

  return (
    <div className="flex items-center justify-between border-b p-1 h-12 bg-background/95">
      <>
        {/* TODO: тут выводить названия чата */}
        <div className="text-lg">Сообщения</div>
      </>
      <div className="flex items-center gap-1">
        <Link
          href={ROUTES.CHAT}
          className="p-2 rounded-4xl hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent"
        >
          <SquareArrowOutUpRightIcon width={16} height={16} />
        </Link>
        <Button
          onClick={closeChat}
          className="cursor-pointer rounded-4xl p-2 hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent"
          variant="ghost"
          size="icon-sm"
        >
          <XIcon />
        </Button>
      </div>
    </div>
  );
};
