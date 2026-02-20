"use client";

import { ArrowBigUp, ArrowBigDown } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";
import { PostsService } from "@/services/posts.service";

interface PostVoteProps {
  postId: string;
  initialVotes: number;
  orientation?: "vertical" | "horizontal";
}

export const PostVote = ({ postId, initialVotes, orientation = "horizontal" }: PostVoteProps) => {
  const { user } = useAuth();
  const [currentVote, setCurrentVote] = useState<number>(0);
  const [displayVotes, setDisplayVotes] = useState(initialVotes);

  useEffect(() => {
    if (user) {
      PostsService.getUserVoteStatus(postId, user.uid).then(setCurrentVote);
    }
  }, [user, postId]);

  const handleVote = async (newValue: number) => {
    if (!user) return toast.error("Войдите, чтобы голосовать");

    const finalValue = currentVote === newValue ? 0 : newValue;
    const voteDiff = finalValue - currentVote;

    setCurrentVote(finalValue);
    setDisplayVotes((prev) => prev + voteDiff);

    try {
      await PostsService.votePost(postId, user.uid, finalValue as 1 | -1 | 0, currentVote);
    } catch (_error) {
      setCurrentVote(currentVote);
      setDisplayVotes((prev) => prev - voteDiff);
      toast.error("Не удалось сохранить голос");
    }
  };

  return (
    <div
      className={cn(
        "flex items-center gap-1 rounded-full bg-muted/40 p-1 border",
        orientation === "vertical" ? "flex-col" : "flex-row",
        currentVote === 1 && "bg-blue-500/10 border-blue-500/20",
        currentVote === -1 && "bg-pink-500/10 border-pink-500/20"
      )}
    >
      <Button
        variant="ghost"
        size="sm"
        className={cn(
          "cursor-pointer h-8 w-8 p-0 rounded-full hover:bg-transparent",
          currentVote === 1 ? "text-blue-500" : "text-muted-foreground hover:text-blue-500"
        )}
        onClick={() => handleVote(1)}
      >
        <ArrowBigUp className={cn("h-5 w-5", currentVote === 1 && "fill-current")} />
      </Button>

      <span
        className={cn(
          "text-xs font-black min-w-5 text-center",
          currentVote === 1 && "text-blue-500",
          currentVote === -1 && "text-pink-500",
          currentVote === 0 && "text-muted-foreground"
        )}
      >
        {displayVotes}
      </span>

      <Button
        variant="ghost"
        size="sm"
        className={cn(
          "cursor-pointer h-8 w-8 p-0 rounded-full hover:bg-transparent",
          currentVote === -1 ? "text-pink-500" : "text-muted-foreground hover:text-pink-500"
        )}
        onClick={() => handleVote(-1)}
      >
        <ArrowBigDown className={cn("h-5 w-5", currentVote === -1 && "fill-current")} />
      </Button>
    </div>
  );
};
