"use client";

import { formatDistanceToNow } from "date-fns";
import { ru } from "date-fns/locale";
import { MoreHorizontal, Languages, Trash2, Pencil } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { DeletePostModal } from "@/components/DeletePostModal";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/context/AuthContext";
import CommentItem from "@/features/comments/components/CommentItem";
import { EditPostForm } from "@/features/posts/components/EditPostForm";
import { PostActions } from "@/features/posts/components/PostActions";
import { PostVote } from "@/features/posts/components/PostVote";
import { useCommunity } from "@/hooks/useCommunity";
import { useHighlightComment } from "@/hooks/useHighlightComment";
import { useUserProfile } from "@/hooks/useUserProfile";
import { CommunityCache } from "@/lib/communityCache";
import { POST_FLAIRS } from "@/lib/constants";
import { ROUTES } from "@/lib/routes";
import { UserProfileCache } from "@/lib/userProfileCache";
import { buildCommentTree, cn, findCommentDepth, getBaseUrl } from "@/lib/utils";
import { CommentsService } from "@/services/comments.service";
import { PostsService } from "@/services/posts.service";
import { IComment, IPost } from "@/types/types";

export default function PostPage() {
  const searchParams = useSearchParams();
  const highlightId = searchParams.get("highlight");
  const autoTranslate = searchParams.get("translate") === "true";
  const { postId } = useParams();
  const router = useRouter();
  const { user } = useAuth();

  const [post, setPost] = useState<IPost | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [comments, setComments] = useState<IComment[]>([]);
  const [rootCommentText, setRootCommentText] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  const [translatedData, setTranslatedData] = useState<{ title: string; content: string } | null>(
    null
  );
  const [isTranslating, setIsTranslating] = useState(false);
  const [isShowingTranslation, setIsShowingTranslation] = useState(false);

  const { profile } = useUserProfile(post?.authorId);
  const community = useCommunity(post?.communityName);
  const isAuthor = user?.uid === post?.authorId;
  const flair = POST_FLAIRS.find((f) => post?.tags?.includes(f.id));

  useHighlightComment(highlightId, isLoading, comments.length);

  useEffect(() => {
    if (!postId) return;

    const fetchPostData = async () => {
      try {
        setIsLoading(true);
        const postData = await PostsService.getPostById(postId as string);
        if (postData) {
          setPost(postData);
          UserProfileCache.fetch(postData.authorId);
          CommunityCache.fetch(postData.communityName);
        }
      } catch (error) {
        console.error("Ошибка при загрузке поста:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPostData();
  }, [postId]);

  useEffect(() => {
    if (!post?.id) return;

    const unsubscribe = CommentsService.subscribeToPostComments(post.id, (flatComments) => {
      const uniqueAuthorIds = [...new Set(flatComments.map((c) => c.authorId))];
      uniqueAuthorIds.forEach((uid) => UserProfileCache.fetch(uid));

      setComments(buildCommentTree(flatComments));
    });

    return () => unsubscribe();
  }, [post?.id]);

  useEffect(() => {
    if (autoTranslate && post && !translatedData && !isTranslating) {
      handleTranslateToggle();

      const newUrl = window.location.pathname;
      window.history.replaceState({}, "", newUrl);
    }
  }, [post, autoTranslate]);

  const handleUpdatePost = async (newContent: string, newImageUrl: string) => {
    if (!post) return;
    setIsUpdating(true);
    try {
      await PostsService.updatePost(post.id, {
        content: newContent,
        imageUrl: newImageUrl,
      });
      setPost((prev) => (prev ? { ...prev, content: newContent, imageUrl: newImageUrl } : null));
      setIsEditing(false);
      toast.success("Пост обновлен");
    } catch {
      toast.error("Ошибка при обновлении поста");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSendComment = async (
    parentId: string | null = null,
    text: string,
    parentCommentAuthorId?: string
  ) => {
    if (!user || !post) {
      toast.info("Нужно войти в аккаунт");
      return;
    }

    const depth = parentId ? findCommentDepth(comments, parentId) + 1 : 0;

    try {
      await CommentsService.addComment(
        { postId: post.id, parentId, text, authorId: user.uid, depth },
        post,
        parentCommentAuthorId
      );
      toast.success("Комментарий добавлен");
    } catch {
      toast.error("Ошибка при отправке");
    }
  };

  const handleSendRootComment = async () => {
    if (!rootCommentText.trim()) return;
    setIsSubmittingComment(true);
    try {
      await handleSendComment(null, rootCommentText);
      setRootCommentText("");
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleDelete = async () => {
    if (!post) return;
    setIsDeleting(true);
    try {
      await PostsService.deletePost(post.id);
      toast.success("Пост удален");
      router.push(ROUTES.COMMUNITY(post.communityName));
    } catch {
      toast.error("Ошибка при удалении");
      setIsDeleting(false);
    }
  };

  const handleTranslateToggle = async () => {
    if (translatedData) {
      setIsShowingTranslation(!isShowingTranslation);
      return;
    }

    if (!post) return;

    setIsTranslating(true);
    try {
      const response = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: post.title,
          content: post.content,
          targetLang: "en",
        }),
      });

      if (!response.ok) throw new Error("Ошибка API");

      const data = await response.json();
      setTranslatedData({ title: data.title, content: data.content });
      setIsShowingTranslation(true);
      toast.success("Переведено на английский");
    } catch (error) {
      toast.error("Не удалось перевести пост");
      console.error(error);
    } finally {
      setIsTranslating(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }
  if (!post) {
    return <div className="text-center py-20">Пост не найден</div>;
  }

  const postDate = post.createdAt?.toDate
    ? post.createdAt.toDate()
    : new Date(post.createdAt as any);
  const updatedDate = post.updatedAt?.toDate
    ? post.updatedAt.toDate()
    : post.updatedAt
      ? new Date(post.updatedAt as any)
      : null;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 shrink-0">
            <AvatarImage src={community?.avatarUrl} />
            <AvatarFallback className="text-sm font-bold">
              {post.communityName[0].toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <Link
                href={ROUTES.COMMUNITY(post.communityName)}
                className="font-bold text-sm hover:underline cursor-pointer text-foreground"
              >
                n/{post.communityName}
              </Link>
              <Badge variant="secondary" className="text-[10px] h-5">
                Community
              </Badge>
            </div>
            <span className="text-xs text-muted-foreground flex flex-wrap items-center gap-1">
              <Link
                href={profile?.displayName ? ROUTES.PROFILE(profile.displayName) : "#"}
                className="text-xs font-bold text-muted-foreground z-10 hover:text-foreground hover:underline transition-colors"
              >
                u/{profile?.displayName ?? "..."}
              </Link>
              <span>•</span>
              <span>{formatDistanceToNow(postDate, { addSuffix: true, locale: ru })}</span>
              {updatedDate && (
                <span className="italic text-muted-foreground/70">
                  (изм. {formatDistanceToNow(updatedDate, { addSuffix: true, locale: ru })})
                </span>
              )}
            </span>
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full cursor-pointer">
              <MoreHorizontal className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 rounded-xl">
            <DropdownMenuItem
              className="cursor-pointer gap-2"
              onClick={handleTranslateToggle}
              disabled={isTranslating}
            >
              <Languages className={cn("h-4 w-4", isTranslating && "animate-pulse")} />
              <span>
                {isTranslating
                  ? "Переводим..."
                  : isShowingTranslation
                    ? "Показать оригинал"
                    : "Перевести (EN)"}
              </span>
            </DropdownMenuItem>
            {isAuthor && (
              <>
                <DropdownMenuItem
                  className="cursor-pointer gap-2"
                  onSelect={() => setIsEditing(true)}
                >
                  <Pencil className="h-4 w-4" />
                  <span>Редактировать</span>
                </DropdownMenuItem>
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

      <div className="space-y-3 mb-6">
        {flair && (
          <Badge
            className={cn(
              "rounded-md px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider border-none",
              flair.color,
              flair.textColor
            )}
          >
            {flair.label}
          </Badge>
        )}
        <h1 className="text-xl md:text-2xl font-black mb-6 leading-tight">
          {isShowingTranslation && translatedData ? translatedData.title : post.title}
        </h1>
      </div>

      {isEditing ? (
        <EditPostForm
          initialContent={post.content}
          initialImageUrl={post.imageUrl}
          isUpdating={isUpdating}
          onSave={handleUpdatePost}
          onCancel={() => setIsEditing(false)}
        />
      ) : (
        <div className="space-y-6">
          {post.imageUrl && (
            <div className="rounded-2xl overflow-hidden border bg-muted shadow-md">
              <img
                src={post.imageUrl}
                alt={post.title}
                className="w-full h-auto max-h-175 object-contain mx-auto"
              />
            </div>
          )}
          {post.content && (
            <p className="text-base wrap-break-word md:text-lg text-foreground/80 whitespace-pre-wrap leading-relaxed">
              {isShowingTranslation && translatedData ? translatedData.content : post.content}
            </p>
          )}

          {isShowingTranslation && (
            <p className="text-xs text-muted-foreground italic">
              Переведено автоматически через Google Translate
            </p>
          )}
        </div>
      )}

      <Separator className="my-8" />

      <div className="flex items-center justify-between">
        <PostVote postId={post.id} initialVotes={post.votes} />
        <PostActions
          commentsCount={post.commentsCount}
          title={post.title}
          shareUrl={`${getBaseUrl()}${ROUTES.POST(post.communityName, post.id)}`}
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
          <h3 className="text-lg font-bold">Комментарии ({post.commentsCount})</h3>

          <div className="group relative overflow-hidden rounded-2xl border bg-muted/20 focus-within:border-primary/50 transition-all p-2">
            <Textarea
              placeholder={user ? "Что вы об этом думаете?" : "Войдите, чтобы оставить комментарий"}
              value={rootCommentText}
              onChange={(e) => setRootCommentText(e.target.value)}
              disabled={!user || isSubmittingComment}
              className="min-h-[100px] w-full border-none bg-transparent shadow-none focus-visible:ring-0 resize-none text-sm placeholder:text-muted-foreground/60"
            />
            <div className="flex justify-end p-2">
              <Button
                size="sm"
                onClick={handleSendRootComment}
                disabled={!user || !rootCommentText.trim() || isSubmittingComment}
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
              <CommentItem key={comment.id} comment={comment} onReply={handleSendComment} />
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
