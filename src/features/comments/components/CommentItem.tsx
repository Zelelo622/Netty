"use client";

import { formatDistanceToNow } from "date-fns";
import { ru } from "date-fns/locale";
import { MessageSquare } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";
import { CommentsService } from "@/services/comments.service";
import { IComment } from "@/types/types";

import { CommentVote } from "./CommentVote";

interface ICommentItemProps {
  comment: IComment;
  onReply: (parentId: string, text: string, authorId: string) => Promise<void>;
}

export default function CommentItem({ comment, onReply }: ICommentItemProps) {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(comment.text);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isReplying, setIsReplying] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isAuthor = user?.uid === comment.authorId;

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
    } catch (_error) {
      toast.error("Ошибка при обновлении");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSubmitReply = async () => {
    if (!replyText.trim()) return;
    setIsSubmitting(true);
    await onReply(comment.id, replyText, comment.authorId);
    setReplyText("");
    setIsReplying(false);
    setIsSubmitting(false);
  };

  const handleReplyClick = () => {
    setIsReplying(!isReplying);
    if (!isReplying) {
      setReplyText(`u/${comment.authorName} `);
    } else {
      setReplyText("");
    }
  };

  const renderText = (text: string) => {
    const parts = text.split(/(u\/[a-zA-Z0-9_]+)/g);
    return parts.map((part, i) => {
      if (part.startsWith("u/")) {
        return (
          <span key={i} className="text-blue-500 font-medium hover:underline cursor-pointer">
            {part}
          </span>
        );
      }
      return part;
    });
  };

  const commentDate = comment.createdAt?.toDate ? comment.createdAt.toDate() : new Date();

  return (
    <div
      className={cn(
        "flex flex-col gap-3",
        comment.depth > 0 && "mt-4 ml-2 md:ml-6 pl-4 border-l-2 border-muted transition-colors"
      )}
    >
      <div className="flex items-center gap-2">
        <Avatar className="h-6 w-6">
          <AvatarImage src={comment.authorImage} />
          <AvatarFallback>{comment.authorName[0]}</AvatarFallback>
        </Avatar>
        <span className="text-xs font-bold">u/{comment.authorName}</span>
        <span className="text-[10px] text-muted-foreground">
          {formatDistanceToNow(commentDate, { addSuffix: true, locale: ru })}
        </span>
        {comment.isEdited && (
          <span className="text-[10px] text-muted-foreground italic">• Изменено</span>
        )}
      </div>

      {isEditing ? (
        <div className="space-y-2">
          <Textarea
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            className="min-h-[80px] bg-muted/20 border-none focus-visible:ring-1 focus-visible:ring-primary/50 rounded-xl resize-none text-sm"
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
        <div className="text-sm leading-relaxed text-foreground/90 whitespace-pre-wrap">
          {renderText(comment.text)}
        </div>
      )}

      <div className="flex items-center gap-4">
        <CommentVote commentId={comment.id} initialVotes={comment.votes} />

        <Button
          variant="ghost"
          size="sm"
          className="cursor-pointer h-7 gap-1.5 text-xs text-muted-foreground"
          onClick={handleReplyClick}
        >
          {comment.depth < 3 && (
            <>
              <MessageSquare className="h-3.5 w-3.5" />
              Ответить
            </>
          )}
        </Button>
        {isAuthor && !isEditing && (
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs text-muted-foreground hover:text-primary"
            onClick={() => setIsEditing(true)}
          >
            Изменить
          </Button>
        )}
      </div>

      {isReplying && (
        <div className="mt-2 space-y-2 pl-4 border-l-2 border-primary/20">
          <Textarea
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder="Ваш ответ..."
            className="min-h-[80px] bg-muted/20 border-none focus-visible:ring-1 focus-visible:ring-primary/50 rounded-xl resize-none text-sm"
          />
          <div className="flex justify-end gap-2">
            <Button
              size="sm"
              variant="ghost"
              className="cursor-pointer rounded-full"
              onClick={() => setIsReplying(false)}
            >
              Отмена
            </Button>
            <Button
              size="sm"
              className="cursor-pointer rounded-full px-4"
              onClick={handleSubmitReply}
              disabled={isSubmitting || !replyText.trim()}
            >
              {isSubmitting ? "..." : "Ответить"}
            </Button>
          </div>
        </div>
      )}

      {comment.replies && comment.replies.length > 0 && (
        <div className="space-y-4">
          {comment.replies.map((reply) => (
            <CommentItem key={reply.id} comment={reply} onReply={onReply} />
          ))}
        </div>
      )}
    </div>
  );
}
