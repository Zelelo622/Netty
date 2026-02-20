"use client";

import { MessageSquare, Share2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

interface IPostActionsProps {
  commentsCount: number;
  shareUrl: string;
  commentUrl?: string;
  title: string;
}

export const PostActions = ({ commentsCount, shareUrl, title }: IPostActionsProps) => {
  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      if (navigator.share) {
        await navigator.share({ title, url: shareUrl });
      } else {
        await navigator.clipboard.writeText(shareUrl);
        toast.success("Ссылка скопирована!");
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center h-8 px-2.5 gap-1.5 text-muted-foreground/70 select-none">
        <MessageSquare className="h-4 w-4" />
        <span className="text-xs font-medium">{commentsCount}</span>
      </div>

      <Button
        variant="ghost"
        size="sm"
        onClick={handleShare}
        className="cursor-pointer h-9 w-9 p-0 text-muted-foreground hover:bg-muted rounded-full"
      >
        <Share2 className="h-4 w-4" />
      </Button>
    </div>
  );
};
