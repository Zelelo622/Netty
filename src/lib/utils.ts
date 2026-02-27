import { IComment, INotification } from "@/types/types";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function buildCommentTree(flatComments: IComment[]): IComment[] {
  const map = new Map<string, IComment>();
  const roots: IComment[] = [];

  const sorted = [...flatComments].sort((a, b) => {
    const aTime = a.createdAt?.seconds || 0;
    const bTime = b.createdAt?.seconds || 0;
    return aTime - bTime;
  });

  sorted.forEach((comment) => {
    map.set(comment.id, { ...comment, replies: [] });
  });

  sorted.forEach((comment) => {
    const node = map.get(comment.id)!;
    if (comment.parentId) {
      const parent = map.get(comment.parentId);
      if (parent) {
        parent.replies?.push(node);
      }
    } else {
      roots.push(node);
    }
  });

  return roots.sort((a, b) => b.votes - a.votes);
}

export function findCommentDepth(comments: IComment[], targetId: string): number {
  for (const comment of comments) {
    if (comment.id === targetId) {
      return comment.depth;
    }
    if (comment.replies && comment.replies.length > 0) {
      const foundDepth = findCommentDepth(comment.replies, targetId);
      if (foundDepth !== -1) {
        return foundDepth;
      }
    }
  }
  return -1;
}

export const getNotificationText = (type: INotification["type"]) => {
  switch (type) {
    case "REPLY":
      return "ответил(а) на ваш комментарий";
    case "POST_VOTE":
      return "оценил(а) ваш пост";
    case "COMMENT_VOTE":
      return "оценил(а) ваш комментарий";
    default:
      return "новое уведомление";
  }
};

export const getBaseUrl = () => (typeof window !== "undefined" ? window.location.origin : "");
