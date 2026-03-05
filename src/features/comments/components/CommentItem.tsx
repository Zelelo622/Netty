"use client";

import { formatDistanceToNow } from "date-fns";
import { ru } from "date-fns/locale";
import { ArrowRight, MessageSquare, ChevronDown, Pencil } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { UserAvatar } from "@/components/UserAvatar";
import { useAuth } from "@/context/AuthContext";
import { useUserProfile } from "@/hooks/useUserProfile";
import { ROUTES } from "@/lib/routes";
import { cn, getTotalRepliesCount } from "@/lib/utils";
import { CommentsService } from "@/services/comments.service";
import { IComment } from "@/types/types";

import { CommentVote } from "./CommentVote";

interface ICommentItemProps {
  comment: IComment;
  onReply: (parentId: string, text: string, authorId: string) => Promise<void>;
  isThreadPage?: boolean;
  isParentHovered?: boolean;
}

const MAX_VISUAL_DEPTH = 4;

export default function CommentItem({
  comment,
  onReply,
  isThreadPage = false,
  isParentHovered = false,
}: ICommentItemProps) {
  const { user } = useAuth();
  const params = useParams();
  const communitySlug = Array.isArray(params.slug) ? params.slug[0] : params.slug;
  const postId = Array.isArray(params.postId) ? params.postId[0] : params.postId;

  const { profile: author } = useUserProfile(comment.authorId);

  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(comment.text);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isReplying, setIsReplying] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isSelfHovered, setIsSelfHovered] = useState(false);

  const replyTextareaRef = useRef<HTMLTextAreaElement>(null);
  const isAuthor = user?.uid === comment.authorId;

  const totalReplies = useMemo(() => getTotalRepliesCount(comment.replies), [comment.replies]);
  const isHighlighted = isSelfHovered || isParentHovered;

  useEffect(() => {
    if (isReplying) {
      setTimeout(() => replyTextareaRef.current?.focus(), 0);
    }
  }, [isReplying]);

  const handleUpdate = async () => {
    if (!editText.trim() || editText === comment.text) {
      setIsEditing(false);
      return;
    }
    setIsUpdating(true);
    try {
      await CommentsService.updateComment(comment.id, editText);
      comment.text = editText;
      comment.isEdited = true;
      setIsEditing(false);
      toast.success("Изменено");
    } catch {
      toast.error("Ошибка при обновлении");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSubmitReply = async () => {
    if (!replyText.trim()) return;
    setIsSubmitting(true);
    setIsReplying(false);
    setReplyText("");
    try {
      await onReply(comment.id, replyText, comment.authorId);
    } catch {
      toast.error("Ошибка при отправке");
    } finally {
      setIsSubmitting(false);
    }
  };

  const commentDate = comment.createdAt?.toDate ? comment.createdAt.toDate() : new Date();

  const hasDeepReplies =
    comment.replies && comment.replies.length > 0 && comment.depth >= MAX_VISUAL_DEPTH;

  const threadUrl =
    communitySlug && postId ? ROUTES.COMMENT_THREAD(communitySlug, postId, comment.id) : null;

  return (
    <div
      id={comment.id}
      className={cn(
        "relative scroll-mt-24 transition-all duration-300 flex flex-col gap-3",
        comment.depth > 0 && "mt-4 ml-1 md:ml-6 pl-3"
      )}
    >
      {comment.depth > 0 && (
        <>
          <div
            className={cn(
              "absolute left-0 top-0 bottom-0 w-[1.5px] transition-colors duration-200",
              isHighlighted ? "bg-primary/60" : "bg-muted-foreground/20"
            )}
          />
          <div
            onMouseEnter={() => setIsSelfHovered(true)}
            onMouseLeave={() => setIsSelfHovered(false)}
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="absolute -left-1 top-0 bottom-0 w-4 cursor-pointer z-10"
          />
        </>
      )}

      <div
        className="flex items-center gap-2 cursor-pointer select-none hover:opacity-80"
        onClick={() => setIsCollapsed((prev) => !prev)}
      >
        <UserAvatar
          photoURL={author?.photoURL}
          displayName={author?.displayName}
          size={24}
          className="rounded-full shrink-0"
        />
        <Link
          href={author?.displayName ? ROUTES.PROFILE(author.displayName) : "#"}
          className="text-xs font-bold text-muted-foreground z-10 hover:text-foreground hover:underline transition-colors"
        >
          u/{author?.displayName ?? "..."}
        </Link>
        <span className="text-[10px] text-muted-foreground">
          {formatDistanceToNow(commentDate, { addSuffix: true, locale: ru })}
        </span>
        {isCollapsed && totalReplies > 0 && (
          <span className="text-[10px] text-primary font-medium flex items-center gap-1 bg-primary/5 px-2 py-0.5 rounded-full">
            <ChevronDown className="h-3 w-3" />
            Развернуть {totalReplies} {totalReplies === 1 ? "ответ" : "ответов"}
          </span>
        )}
      </div>

      {!isCollapsed && (
        <>
          <div className="overflow-hidden">
            {isEditing ? (
              <div className="space-y-2">
                <Textarea
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  className="min-h-20 bg-muted/20 border-none focus-visible:ring-1 focus-visible:ring-primary/50 rounded-xl resize-none text-sm"
                />
                <div className="flex gap-2">
                  <Button size="sm" variant="ghost" onClick={() => setIsEditing(false)}>
                    Отмена
                  </Button>
                  <Button size="sm" onClick={handleUpdate} disabled={isUpdating}>
                    Сохранить
                  </Button>
                </div>
              </div>
            ) : (
              <p className="text-sm leading-relaxed text-foreground/90 whitespace-pre-wrap wrap-break-word">
                {comment.text}
              </p>
            )}
          </div>

          <div className="flex items-center gap-4">
            <CommentVote commentId={comment.id} initialVotes={comment.votes} />
            <Button
              variant="ghost"
              size="sm"
              className="h-7 gap-1.5 text-xs text-muted-foreground hover:bg-transparent hover:text-primary"
              onClick={() => setIsReplying((prev) => !prev)}
            >
              <MessageSquare className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Ответить</span>
            </Button>
            {isAuthor && !isEditing && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs text-muted-foreground hover:text-primary"
                onClick={() => setIsEditing(true)}
              >
                <Pencil className="h-3.5 w-3.5 sm:hidden" />
                <span className="hidden sm:inline">Изменить</span>
              </Button>
            )}
          </div>

          {isReplying && (
            <div className="mt-2 space-y-2 pl-4 border-l-2 border-primary/20">
              <Textarea
                ref={replyTextareaRef}
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Напишите ответ..."
                className="min-h-20 bg-muted/20 border-none focus-visible:ring-1 focus-visible:ring-primary/50 rounded-xl resize-none text-sm"
              />
              <div className="flex justify-end gap-2">
                <Button size="sm" variant="ghost" onClick={() => setIsReplying(false)}>
                  Отмена
                </Button>
                <Button
                  size="sm"
                  onClick={handleSubmitReply}
                  disabled={isSubmitting || !replyText.trim()}
                >
                  {isSubmitting ? "..." : "Ответить"}
                </Button>
              </div>
            </div>
          )}

          <div className="flex flex-col">
            {hasDeepReplies && threadUrl ? (
              <Link
                href={threadUrl}
                className="mt-2 flex items-center gap-2 p-2 rounded-lg bg-muted/30 hover:bg-muted/50 text-xs font-bold text-primary transition-colors w-fit"
              >
                <ArrowRight className="h-4 w-4" />
                Продолжить ветку ({totalReplies} {totalReplies === 1 ? "ответ" : "ответов"})
              </Link>
            ) : (
              comment.replies?.map((reply) => (
                <CommentItem
                  key={reply.id}
                  comment={reply}
                  onReply={onReply}
                  isThreadPage={isThreadPage}
                  isParentHovered={isHighlighted}
                />
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}
