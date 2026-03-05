"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { LoadingSpinner } from "@/components/LoadingSpinner";
import { useAuth } from "@/context/AuthContext";
import CommentItem from "@/features/comments/components/CommentItem";
import { ROUTES } from "@/lib/routes";
import { UserProfileCache } from "@/lib/userProfileCache";
import { buildCommentTree, getDescendants } from "@/lib/utils";
import { CommentsService } from "@/services/comments.service";
import { PostsService } from "@/services/posts.service";
import { IComment, IPost } from "@/types/types";

export default function CommentThreadPage() {
  const params = useParams();
  const slug = Array.isArray(params.slug) ? params.slug[0] : params.slug;
  const postId = Array.isArray(params.postId) ? params.postId[0] : params.postId;
  const commentId = Array.isArray(params.commentId) ? params.commentId[0] : params.commentId;

  const { user } = useAuth();

  const [post, setPost] = useState<IPost | null>(null);
  const [rootComment, setRootComment] = useState<IComment | null>(null);
  const [allComments, setAllComments] = useState<IComment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!postId) return;
    PostsService.getPostById(postId).then(setPost);
  }, [postId]);

  useEffect(() => {
    if (!postId) return;

    const unsubscribe = CommentsService.subscribeToPostComments(postId, (flatComments) => {
      setAllComments(flatComments);

      const root = flatComments.find((c) => c.id === commentId);

      if (!root) {
        setIsLoading(false);
        return;
      }

      const descendants = getDescendants(flatComments, commentId!);
      const branchComments = [root, ...descendants];

      const uniqueAuthorIds = [...new Set(branchComments.map((c) => c.authorId))];
      uniqueAuthorIds.forEach((uid) => UserProfileCache.fetch(uid));

      const depthOffset = root.depth;
      const normalize = branchComments.map((c) => ({
        ...c,
        depth: c.depth - depthOffset,
        parentId: c.id === root.id ? null : c.parentId,
      }));

      const tree = buildCommentTree(normalize);

      setRootComment(tree[0] ?? null);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [postId, commentId]);

  const handleReply = async (parentId: string, text: string, parentCommentAuthorId: string) => {
    if (!user || !post) {
      toast.info("Нужно войти в аккаунт");
      return;
    }

    const parentComment = allComments.find((c) => c.id === parentId);
    const depth = parentComment ? parentComment.depth + 1 : 0;

    await CommentsService.addComment(
      { postId: post.id, parentId, text, authorId: user.uid, depth },
      post,
      parentCommentAuthorId
    );
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center mb-6">
        <Link
          href={post ? ROUTES.POST(slug!, postId!) : ROUTES.COMMUNITY(slug!)}
          className="text-base flex items-center gap-3 hover:opacity-80"
        >
          <ArrowLeft width={16} height={16} className="shrink-0" />
          {post ? `Вернуться к посту «${post.title}»` : "Назад"}
        </Link>
      </div>
      <div className="flex flex-col gap-2 mb-6">
        <div className="flex items-center gap-4">
          <span className="inline-block w-12 h-2 rounded-lg bg-primary" />
          <h1 className="text-2xl">Ветка обсуждения</h1>
        </div>
        <div className="flex items-center gap-2">
          <span className="opacity-50">Вы просматриваете отдельную ветку комментариев.</span>
        </div>
      </div>
      {rootComment ? (
        <CommentItem comment={rootComment} onReply={handleReply} isThreadPage={true} />
      ) : (
        <div className="text-center py-20 text-muted-foreground">Комментарий не найден</div>
      )}
    </div>
  );
}
