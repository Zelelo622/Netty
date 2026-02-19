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
import { PostsService } from "@/services/posts.service";
import { toast } from "sonner";
import { PostVote } from "./PostVote";
import { PostActions } from "./PostActions";
import { DeletePostModal } from "@/components/DeletePostModal";
import { useRouter } from "next/navigation";

export const PostCard = ({ post }: IPostCardProps) => {
  const { user } = useAuth();
  const router = useRouter();
  const isAuthor = user?.uid === post.authorId;

  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const formattedDate = post.createdAt?.seconds
    ? new Date(post.createdAt.seconds * 1000).toLocaleDateString("ru-RU", {
        day: "numeric",
        month: "short",
      })
    : "Только что";

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await PostsService.deletePost(post.id);
      toast.success("Пост успешно удален");
      router.refresh();
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
              href={ROUTES.POST(post.communityName, post.slug)}
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
          <PostVote postId={post.id} initialVotes={post.votes} />

          <PostActions
            commentsCount={post.commentsCount}
            title={post.title}
            shareUrl={`${window.location.origin}${ROUTES.POST(post.communityName, post.slug)}`}
          />
        </div>

        <DeletePostModal
          open={showDeleteModal}
          onOpenChange={setShowDeleteModal}
          onConfirm={handleDelete}
          isLoading={isDeleting}
        />
      </Card>
    </>
  );
};
