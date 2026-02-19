"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { PostsService } from "@/services/posts.service";
import { IComment, IPost } from "@/types/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { MoreHorizontal, Languages, Trash2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ru } from "date-fns/locale";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import CommentItem from "@/features/comments/components/CommentItem";
import { PostVote } from "@/features/posts/components/PostVote";
import { PostActions } from "@/features/posts/components/PostActions";
import { DeletePostModal } from "@/components/DeletePostModal";
import { ROUTES } from "@/lib/routes";
import { CommentsService } from "@/services/comments.service";
import { buildCommentTree, findCommentDepth } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";

export default function PostPage() {
  const { postSlug } = useParams();
  const router = useRouter();
  const { user } = useAuth();

  const [post, setPost] = useState<IPost | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [comments, setComments] = useState<IComment[]>([]);
  const [rootCommentText, setRootCommentText] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  const isAuthor = user?.uid === post?.authorId;

  useEffect(() => {
    if (post?.id) {
      CommentsService.getPostComments(post.id).then((data) => {
        setComments(buildCommentTree(data));
      });
    }
  }, [post?.id]);

  const handleSendComment = async (
    parentId: string | null = null,
    text: string,
  ) => {
    if (!user || !post) {
      toast.info("Нужно войти в аккаунт");
      return;
    }

    try {
      const depth = parentId ? findCommentDepth(comments, parentId) + 1 : 0;

      if (depth > 3) {
        toast.error("Достигнута максимальная глубина обсуждения");
        return;
      }

      await CommentsService.addComment({
        postId: post.id,
        parentId,
        text,
        authorId: user.uid,
        authorName: user.displayName || "Аноним",
        authorImage: user.photoURL || "",
        depth,
      });

      const updatedFlat = await CommentsService.getPostComments(post.id);
      setComments(buildCommentTree(updatedFlat));
      toast.success("Комментарий добавлен");
    } catch (e) {
      toast.error("Ошибка при отправке");
    }
  };

  const handleSendRootComment = async () => {
    if (!rootCommentText.trim()) {
      return;
    }
    setIsSubmittingComment(true);
    try {
      await handleSendComment(null, rootCommentText);
      setRootCommentText("");
    } finally {
      setIsSubmittingComment(false);
    }
  };

  useEffect(() => {
    const fetchPostData = async () => {
      if (!postSlug) {
        return;
      }
      try {
        setIsLoading(true);
        const postData = await PostsService.getPostBySlug(postSlug as string);
        if (postData) {
          setPost(postData);
          if (user) {
            await PostsService.getUserVoteStatus(postData.id, user.uid);
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
    <div className="max-w-3xl mx-auto px-4 py-8">
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

      <h1 className="text-xl md:text-2xl font-black mb-6 leading-tight">
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
        <p className="text-base break-all md:text-lg text-foreground/80 whitespace-pre-wrap leading-relaxed">
          {post.content}
        </p>
      </div>

      <Separator className="my-8" />

      <div className="flex items-center justify-between">
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

      <section id="comments" className="mt-12 space-y-8 pb-20">
        <div className="flex flex-col gap-4">
          <h3 className="text-lg font-bold">
            Комментарии ({post.commentsCount})
          </h3>

          <div className="group relative overflow-hidden rounded-2xl border bg-muted/20 focus-within:border-primary/50 transition-all p-2">
            <Textarea
              placeholder={
                user
                  ? "Что вы об этом думаете?"
                  : "Войдите, чтобы оставить комментарий"
              }
              value={rootCommentText}
              onChange={(e) => setRootCommentText(e.target.value)}
              disabled={!user || isSubmittingComment}
              className="min-h-[100px] w-full border-none bg-transparent shadow-none focus-visible:ring-0 resize-none text-sm placeholder:text-muted-foreground/60"
            />
            <div className="flex justify-end p-2">
              <Button
                size="sm"
                onClick={handleSendRootComment}
                disabled={
                  !user || !rootCommentText.trim() || isSubmittingComment
                }
                className="cursor-pointer rounded-full px-6 font-bold transition-all"
              >
                {isSubmittingComment ? "Отправка..." : "Отправить"}
              </Button>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {comments.length > 0 ? (
            comments.map((comment) => (
              <CommentItem
                key={comment.id}
                comment={comment}
                onReply={handleSendComment}
              />
            ))
          ) : (
            <div className="text-center py-10 text-muted-foreground border rounded-2xl border-dashed">
              Здесь пока пусто. Станьте первым, кто оставит комментарий!
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
