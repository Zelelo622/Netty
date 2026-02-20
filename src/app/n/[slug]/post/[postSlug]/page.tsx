"use client";

import { formatDistanceToNow } from "date-fns";
import { ru } from "date-fns/locale";
import { MoreHorizontal, Languages, Trash2, Pencil } from "lucide-react"; // Добавили Pencil
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
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
import { POST_FLAIRS } from "@/lib/constants";
import { ROUTES } from "@/lib/routes";
import { buildCommentTree, cn, findCommentDepth } from "@/lib/utils";
import { CommentsService } from "@/services/comments.service";
import { PostsService } from "@/services/posts.service";
import { IComment, IPost } from "@/types/types";

export default function PostPage() {
  const { postSlug } = useParams();
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

  const isAuthor = user?.uid === post?.authorId;
  const flair = POST_FLAIRS.find((f) => post?.tags?.includes(f.id));

  useEffect(() => {
    if (post?.id) {
      CommentsService.getPostComments(post.id).then((data) => {
        setComments(buildCommentTree(data));
      });
    }
  }, [post?.id]);

  useEffect(() => {
    const fetchPostData = async () => {
      if (!postSlug) return;
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

  useEffect(() => {
    const hash = window.location.hash;
    if (hash && !isLoading && comments.length > 0) {
      const id = hash.replace("#", "");
      const element = document.getElementById(id);
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: "smooth", block: "center" });
          element.classList.add("bg-primary/10");
          setTimeout(() => element.classList.remove("bg-primary/10"), 2000);
        }, 500);
      }
    }
  }, [isLoading, comments]);

  useEffect(() => {
    if (!post?.id) return;

    const unsubscribe = CommentsService.subscribeToPostComments(post.id, (flatComments) => {
      const tree = buildCommentTree(flatComments);
      setComments(tree);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [post?.id]);

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleUpdatePost = async (newContent: string, newImageUrl: string) => {
    if (!post) return;
    setIsUpdating(true);
    try {
      await PostsService.updatePost(post.id, {
        content: newContent,
        imageUrl: newImageUrl,
      });

      setPost((prev) =>
        prev
          ? {
              ...prev,
              content: newContent,
              imageUrl: newImageUrl,
              updatedAt: new Date(),
            }
          : null
      );
      setIsEditing(false);
      toast.success("Пост обновлен");
    } catch (_error) {
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

    try {
      const depth = parentId ? findCommentDepth(comments, parentId) + 1 : 0;
      if (depth > 3) {
        toast.error("Максимальная глубина обсуждения");
        return;
      }
      await CommentsService.addComment(
        {
          postId: post.id,
          parentId,
          text,
          authorId: user.uid,
          authorName: user.displayName || "Аноним",
          authorImage: user.photoURL || "",
          depth,
        },
        post,
        parentCommentAuthorId
      );

      toast.success("Комментарий добавлен");
    } catch (_error) {
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
      router.push(`/n/${post.communityName}`);
    } catch (_error) {
      toast.error("Ошибка при удалении");
      setIsDeleting(false);
    }
  };

  if (isLoading) return <LoadingSpinner />;
  if (!post) return <div className="text-center py-20">Пост не найден</div>;

  const postDate = post.createdAt?.toDate ? post.createdAt.toDate() : new Date(post.createdAt);

  const updatedDate = post.updatedAt?.toDate
    ? post.updatedAt.toDate()
    : post.updatedAt
      ? new Date(post.updatedAt)
      : null;

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
              <span>u/{post.authorName} •</span>
              <span>{formatDistanceToNow(postDate, { addSuffix: true, locale: ru })}</span>
              {updatedDate && (
                <span className="italic text-muted-foreground/70">
                  (изм.{" "}
                  {formatDistanceToNow(updatedDate, {
                    addSuffix: true,
                    locale: ru,
                  })}
                  )
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
              disabled
              className="cursor-pointer gap-2"
              onClick={() => toast.info("В разработке")}
            >
              <Languages className="h-4 w-4" />
              <span>Перевести</span>
            </DropdownMenuItem>

            {isAuthor && (
              <>
                <DropdownMenuItem className="cursor-pointer gap-2" onSelect={handleEditClick}>
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
        <h1 className="text-xl md:text-2xl font-black mb-6 leading-tight">{post.title}</h1>
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
            <p className="text-base break-words md:text-lg text-foreground/80 whitespace-pre-wrap leading-relaxed">
              {post.content}
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
