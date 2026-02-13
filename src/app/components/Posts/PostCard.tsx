"use client";

import { useEffect, useState } from "react";
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
  Trash2,
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
import { useAuth } from "@/context/AuthContext";
import { PostsService } from "@/services/posts";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export const PostCard = ({ post }: IPostCardProps) => {
  const { user } = useAuth();
  const isAuthor = user?.uid === post.authorId;

  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [currentVote, setCurrentVote] = useState<number>(0);
  const [displayVotes, setDisplayVotes] = useState(post.votes);

  const formattedDate = post.createdAt?.seconds
    ? new Date(post.createdAt.seconds * 1000).toLocaleDateString("ru-RU", {
        day: "numeric",
        month: "short",
      })
    : "Только что";

  useEffect(() => {
    if (user && post.id) {
      PostsService.getUserVoteStatus(post.id, user.uid).then(setCurrentVote);
    }
  }, [user, post.id]);

  const handleVote = async (newValue: number) => {
    if (!user) return toast.error("Войдите, чтобы голосовать");

    const finalValue = currentVote === newValue ? 0 : newValue;

    const voteDiff = finalValue - currentVote;
    setCurrentVote(finalValue);
    setDisplayVotes((prev) => prev + voteDiff);

    try {
      await PostsService.votePost(
        post.id,
        user.uid,
        finalValue as 1 | -1 | 0,
        currentVote,
      );
    } catch (e) {
      setCurrentVote(currentVote);
      setDisplayVotes((prev) => prev - voteDiff);
      toast.error("не удалось сохранить голос");
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await PostsService.deletePost(post.id);
      toast.success("Пост успешно удален");
      window.location.reload();
    } catch (error) {
      toast.error("Ошибка при удалении");
      setIsDeleting(false);
    }
  };

  return (
    <>
      <Card className="hover:border-primary/20 transition-colors gap-3">
        <div className="px-4 sm:px-6">
          <div className="flex items-center gap-2 mb-3">
            <Avatar className="h-6 w-6">
              <AvatarImage src={post.authorImage} />
              <AvatarFallback>{post.authorName[0]}</AvatarFallback>
            </Avatar>
            <div className="flex flex-wrap items-center gap-x-2 text-[10px] sm:text-xs">
              <Link
                href={ROUTES.COMMUNITY(post.communityName)}
                className="font-bold hover:underline cursor-pointer text-foreground"
              >
                n/{post.communityName}
              </Link>
              <span className="text-muted-foreground">•</span>
              <span className="text-muted-foreground">u/{post.authorName}</span>
              <span className="text-muted-foreground">{formattedDate}</span>
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
                  {isAuthor && (
                    <>
                      <Separator className="my-1" />
                      <DropdownMenuItem
                        className="cursor-pointer gap-2 text-destructive focus:text-destructive focus:bg-destructive/10"
                        onSelect={() => setShowDeleteModal(true)}
                      >
                        <Trash2 className="h-4 w-4" />
                        <span>Удалить пост</span>
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <div className="space-y-2">
            <Link
              href={ROUTES.POST(post.communityName, post.id)}
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
              "flex items-center gap-0.5 sm:gap-1 px-1 py-0.5 rounded-full",
              "bg-muted/40",
              currentVote === 1 && "bg-blue-500/10",
              currentVote === -1 && "bg-pink-500/10",
            )}
          >
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "cursor-pointer h-8 w-8 p-0 hover:bg-transparent",
                currentVote === 1
                  ? "text-blue-500"
                  : "text-muted-foreground hover:text-blue-500",
              )}
              onClick={() => handleVote(1)}
            >
              <ArrowBigUp
                className={cn("h-5 w-5", currentVote === 1 && "fill-current")}
              />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "cursor-pointer h-8 w-8 p-0 hover:bg-transparent",
                currentVote === -1
                  ? "text-pink-500"
                  : "text-muted-foreground hover:text-pink-500",
              )}
              onClick={() => handleVote(-1)}
            >
              <ArrowBigDown
                className={cn("h-5 w-5", currentVote === -1 && "fill-current")}
              />
            </Button>

            <span
              className={cn(
                "text-xs font-black min-w-[20px] text-center",
                currentVote === 1 && "text-blue-500",
                currentVote === -1 && "text-pink-500",
                currentVote === 0 && "text-muted-foreground",
              )}
            >
              {displayVotes}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="cursor-pointer h-9 gap-2 text-muted-foreground hover:bg-muted rounded-full"
            >
              <MessageSquare className="h-4 w-4" />
              <span className="text-xs font-semibold">
                {post.commentsCount}
              </span>
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
      <AlertDialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Вы уверены?</AlertDialogTitle>
            <AlertDialogDescription>
              Пост «{post.title}» будет удален навсегда. Вы уверены, что хотите
              его удалить?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="cursor-pointer rounded-xl">
              Отмена
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="cursor-pointer bg-destructive hover:bg-destructive/90 rounded-xl"
            >
              {isDeleting ? "Удаление..." : "Да, удалить"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
