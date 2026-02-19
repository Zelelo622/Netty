"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { PostsService } from "@/services/posts";
import { IPost } from "@/types/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/app/components/LoadingSpinner";
import {
  Share2,
  ArrowBigUp,
  ArrowBigDown,
  MessageSquare,
  MoreHorizontal,
  Languages,
  Trash2,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ru } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import CommentItem from "@/app/components/comments/CommentItem";

export default function PostPage() {
  const { postSlug } = useParams();
  const router = useRouter();
  const { user } = useAuth();

  const [post, setPost] = useState<IPost | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [currentVote, setCurrentVote] = useState<number>(0);
  const [displayVotes, setDisplayVotes] = useState(0);

  const isAuthor = user?.uid === post?.authorId;

  useEffect(() => {
    const fetchPostData = async () => {
      if (!postSlug) return;
      try {
        setIsLoading(true);
        const postData = await PostsService.getPostBySlug(postSlug as string);
        if (postData) {
          setPost(postData);
          setDisplayVotes(postData.votes);
          if (user) {
            const voteStatus = await PostsService.getUserVoteStatus(
              postData.id,
              user.uid,
            );
            setCurrentVote(voteStatus);
          }
        }
      } catch (error) {
        console.error("Ошибка при загрузке поста:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPostData();
  }, [postSlug, user]);

  const handleVote = async (newValue: number) => {
    if (!user || !post) return toast.error("Войдите, чтобы голосовать");

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
      toast.error("Не удалось сохранить голос");
    }
  };

  const handleDelete = async () => {
    if (!post) return;
    setIsDeleting(true);
    try {
      await PostsService.deletePost(post.id);
      toast.success("Пост удален");
      router.push(`/n/${post.communityName}`);
    } catch (error) {
      toast.error("Ошибка при удалении");
      setIsDeleting(false);
    }
  };

  if (isLoading) return <LoadingSpinner />;
  if (!post) return <div className="text-center py-20">Пост не найден</div>;

  const postDate = post.createdAt?.toDate
    ? post.createdAt.toDate()
    : new Date(post.createdAt);

  return (
    <div className="max-w-3xl mx-auto py-10 px-4 md:px-0">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={post.authorImage} />
            <AvatarFallback>{post.authorName[0]}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm">n/{post.communityName}</span>
              <Badge variant="secondary" className="text-[10px] h-5">
                Community
              </Badge>
            </div>
            <span className="text-xs text-muted-foreground">
              u/{post.authorName} •{" "}
              {formatDistanceToNow(postDate, { addSuffix: true, locale: ru })}
            </span>
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full cursor-pointer"
            >
              <MoreHorizontal className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 rounded-xl">
            <DropdownMenuItem
              disabled
              className="cursor-pointer gap-2"
              onClick={() => toast.info("В разработке")}
            >
              <Languages className="h-4 w-4" />
              <span>Перевести</span>
            </DropdownMenuItem>
            {isAuthor && (
              <DropdownMenuItem
                className="cursor-pointer gap-2 text-destructive focus:text-destructive focus:bg-destructive/10"
                onSelect={() => setShowDeleteModal(true)}
              >
                <Trash2 className="h-4 w-4" />
                <span>Удалить пост</span>
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <h1 className="text-3xl md:text-4xl font-black mb-6 leading-tight">
        {post.title}
      </h1>

      <div className="space-y-6">
        {post.imageUrl && (
          <div className="rounded-2xl overflow-hidden border bg-muted shadow-md">
            <img
              src={post.imageUrl}
              alt={post.title}
              className="w-full h-auto max-h-[700px] object-contain mx-auto"
            />
          </div>
        )}
        <p className="text-lg md:text-xl text-foreground/80 whitespace-pre-wrap leading-relaxed">
          {post.content}
        </p>
      </div>

      <Separator className="my-8" />

      <div className="flex items-center justify-between">
        <div className="flex items-center bg-muted/50 rounded-full p-1 border shadow-sm">
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "rounded-full h-9 w-9 p-0 cursor-pointer",
              currentVote === 1
                ? "text-blue-500 bg-blue-500/10"
                : "hover:text-blue-500",
            )}
            onClick={() => handleVote(1)}
          >
            <ArrowBigUp
              className={cn("h-6 w-6", currentVote === 1 && "fill-current")}
            />
          </Button>
          <span
            className={cn(
              "px-3 text-sm font-black min-w-[40px] text-center",
              currentVote === 1 && "text-blue-500",
              currentVote === -1 && "text-pink-500",
            )}
          >
            {displayVotes}
          </span>
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "rounded-full h-9 w-9 p-0 cursor-pointer",
              currentVote === -1
                ? "text-pink-500 bg-pink-500/10"
                : "hover:text-pink-500",
            )}
            onClick={() => handleVote(-1)}
          >
            <ArrowBigDown
              className={cn("h-6 w-6", currentVote === -1 && "fill-current")}
            />
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="rounded-full gap-2 font-bold cursor-pointer"
          >
            <MessageSquare className="h-4 w-4" />
            {post.commentsCount || 0}{" "}
            <span className="hidden sm:inline">Комментариев</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="rounded-full gap-2 font-bold cursor-pointer"
          >
            <Share2 className="h-4 w-4" />
            <span className="hidden sm:inline">Поделиться</span>
          </Button>
        </div>
      </div>

      <AlertDialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Удалить пост?</AlertDialogTitle>
            <AlertDialogDescription>
              Это действие нельзя будет отменить.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl cursor-pointer">
              Отмена
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive hover:bg-destructive/90 rounded-xl cursor-pointer"
            >
              {isDeleting ? "Удаление..." : "Да, удалить"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <section className="mt-12 space-y-8">
        <div className="flex flex-col gap-4">
          <h3 className="text-lg font-bold">Комментарии</h3>

          {/* Поле ввода нового комментария */}
          <div className="relative overflow-hidden rounded-2xl border bg-muted/20 focus-within:border-primary/50 transition-all p-4">
            <textarea
              placeholder="Что вы об этом думаете?"
              className="w-full bg-transparent border-none focus:ring-0 resize-none min-h-[100px] text-sm"
            />
            <div className="flex justify-end mt-2">
              <Button size="sm" className="rounded-full px-6 font-bold">
                Отправить
              </Button>
            </div>
          </div>
        </div>

        {/* Список комментариев (имитация) */}
        <div className="space-y-8 pt-4">
          <CommentItem />
          <CommentItem />
        </div>
      </section>
    </div>
  );
}
