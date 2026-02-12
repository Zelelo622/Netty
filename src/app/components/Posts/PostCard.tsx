"use client";

import { useState } from "react";
import { IPostCardProps } from "./types";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  ArrowBigDown,
  ArrowBigUp,
  Languages,
  MessageSquare,
  MoreHorizontal,
  Share2,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ROUTES } from "@/lib/routes";

export const PostCard = ({ post }: IPostCardProps) => {
  const [voteStatus, setVoteStatus] = useState<"upvoted" | "downvoted" | null>(
    null,
  );

  return (
    <Card className="hover:border-primary/20 transition-colors gap-3">
      <div className="px-4 sm:px-6">
        <div className="flex items-center gap-2 mb-3">
          <Avatar className="h-6 w-6">
            <AvatarImage src={post.author.image} />
            <AvatarFallback>{post.author.name[0]}</AvatarFallback>
          </Avatar>
          <div className="flex flex-wrap items-center gap-x-2 text-[10px] sm:text-xs">
            <Link
              href={ROUTES.COMMUNITY(post.community)}
              className="font-bold hover:underline cursor-pointer text-foreground"
            >
              n/{post.community}
            </Link>
            <span className="text-muted-foreground">•</span>
            <span className="text-muted-foreground">u/{post.author.name}</span>
            <span className="text-muted-foreground">{post.createdAt}</span>
          </div>
          <div className="ml-auto">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="cursor-pointer h-8 w-8 text-muted-foreground outline-none"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem
                  disabled
                  className="cursor-pointer gap-2"
                  onClick={() => alert("Перевод в разработке...")}
                >
                  <Languages className="h-4 w-4" />
                  <span>Показать на другом языке</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="space-y-2">
          <Link
            href={ROUTES.POST(post.community, post.id)}
            className="group block"
          >
            <h2 className="mb-2 text-lg font-bold leading-tight sm:text-2xl group-hover:text-primary transition-colors line-clamp-2">
              {post.title}
            </h2>
          </Link>
          <p className="text-sm text-muted-foreground/80 line-clamp-3 leading-relaxed sm:text-base">
            {post.content}
          </p>
        </div>
      </div>

      <Separator className="bg-border/50 w-[90%] mx-auto" />

      <div className="px-4 flex items-center justify-between">
        <div
          className={cn(
            "flex items-center gap-0.5 sm:gap-1 px-1 py-0.5 rounded-full transition-colors duration-300",
            "bg-muted/40",
            voteStatus === "upvoted" && "bg-blue-500/5",
            voteStatus === "downvoted" && "bg-pink-500/5",
          )}
        >
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "cursor-pointer h-7 w-7 sm:h-8 sm:w-8 p-0 bg-transparent hover:bg-transparent transition-all",
              "text-muted-foreground hover:text-blue-500",
              voteStatus === "upvoted" && "text-blue-500",
            )}
            onClick={() =>
              setVoteStatus(voteStatus === "upvoted" ? null : "upvoted")
            }
          >
            <ArrowBigUp
              className={cn(
                "h-4 w-4 sm:h-5 sm:w-5",
                voteStatus === "upvoted" && "fill-current",
              )}
            />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "cursor-pointer h-7 w-7 sm:h-8 sm:w-8 p-0 bg-transparent hover:bg-transparent transition-all",
              "text-muted-foreground hover:text-pink-500",
              voteStatus === "downvoted" && "text-pink-500",
            )}
            onClick={() =>
              setVoteStatus(voteStatus === "downvoted" ? null : "downvoted")
            }
          >
            <ArrowBigDown
              className={cn(
                "h-4 w-4 sm:h-5 sm:w-5",
                voteStatus === "downvoted" && "fill-current",
              )}
            />
          </Button>

          <span
            className={cn(
              "text-[10px] sm:text-xs font-black min-w-5 sm:min-w-6 text-center pr-2",
              voteStatus === "upvoted" && "text-blue-500",
              voteStatus === "downvoted" && "text-pink-500",
              !voteStatus && "text-muted-foreground",
            )}
          >
            {post.votes +
              (voteStatus === "upvoted"
                ? 1
                : voteStatus === "downvoted"
                  ? -1
                  : 0)}
          </span>
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="cursor-pointer h-9 gap-2 text-muted-foreground hover:bg-muted rounded-full"
          >
            <MessageSquare className="h-4 w-4" />
            <span className="text-xs font-semibold">{post.commentsCount}</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="cursor-pointer h-9 w-9 p-0 text-muted-foreground hover:bg-muted rounded-full"
          >
            <Share2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
};
