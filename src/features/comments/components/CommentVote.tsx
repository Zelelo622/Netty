"use client";

import { ArrowBigUp, ArrowBigDown } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";
import { CommentsService } from "@/services/comments.service";

interface CommentVoteProps {
  commentId: string;
  initialVotes: number;
}

export const CommentVote = ({ commentId, initialVotes }: CommentVoteProps) => {
  const { user } = useAuth();
  const [currentVote, setCurrentVote] = useState<number>(0);
  const [displayVotes, setDisplayVotes] = useState(initialVotes);

  useEffect(() => {
    if (user) {
      CommentsService.getCommentVoteStatus(commentId, user.uid).then(setCurrentVote);
    }
  }, [user, commentId]);

  const handleVote = async (newValue: number) => {
    if (!user) return toast.error("Войдите, чтобы голосовать");

    const finalValue = currentVote === newValue ? 0 : newValue;
    const voteDiff = finalValue - currentVote;

    setCurrentVote(finalValue);
    setDisplayVotes((prev) => prev + voteDiff);

    try {
      await CommentsService.voteComment(commentId, user.uid, finalValue as 1 | -1 | 0, currentVote);
    } catch (_error) {
      setCurrentVote(currentVote);
      setDisplayVotes((prev) => prev - voteDiff);
      toast.error("Ошибка сохранения голоса");
    }
  };

  return (
    <div className="flex items-center gap-1 bg-muted/30 rounded-full px-1 py-0.5">
      <Button
        variant="ghost"
        size="icon"
        className={cn(
          "h-7 w-7 rounded-full transition-colors",
          currentVote === 1 ? "text-blue-500 bg-blue-500/10" : "hover:text-blue-500"
        )}
        onClick={() => handleVote(1)}
      >
        <ArrowBigUp className={cn("h-4 w-4", currentVote === 1 && "fill-current")} />
      </Button>

      <span
        className={cn(
          "text-[11px] font-bold min-w-[12px] text-center",
          currentVote === 1 && "text-blue-500",
          currentVote === -1 && "text-pink-500"
        )}
      >
        {displayVotes}
      </span>

      <Button
        variant="ghost"
        size="icon"
        className={cn(
          "h-7 w-7 rounded-full transition-colors",
          currentVote === -1 ? "text-pink-500 bg-pink-500/10" : "hover:text-pink-500"
        )}
        onClick={() => handleVote(-1)}
      >
        <ArrowBigDown className={cn("h-4 w-4", currentVote === -1 && "fill-current")} />
      </Button>
    </div>
  );
};
