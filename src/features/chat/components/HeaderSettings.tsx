"use client";

import { MessageCirclePlus, MessageSquareCheck } from "lucide-react";

import { MaskotIcon } from "@/components/icons/MaskotIcon";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export const HeaderSettings = () => {
  return (
    <div className="shrink-0 px-1 py-3 bg-background/95 h-12 flex items-center justify-between">
      <div className="flex items-center gap-1">
        <MaskotIcon className="w-8 h-8" />
        <span className="text-2xl">Chats</span>
      </div>
      <div className="flex items-center gap-0.5">
        <Tooltip>
          <TooltipTrigger>
            <Button
              className="cursor-pointer rounded-4xl hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent"
              variant="ghost"
              size="icon-sm"
            >
              <MessageSquareCheck />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Отметить все сообщения как прочитанные</p>
          </TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger>
            <Button
              className="cursor-pointer rounded-4xl hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent"
              variant="ghost"
              size="icon-sm"
            >
              <MessageCirclePlus />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Новый чат</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
};
