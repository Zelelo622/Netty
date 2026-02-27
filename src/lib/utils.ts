import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

import { IComment, INotification } from "@/types/types";

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

  return roots.sort((a, b) => {
    const aTime = a.createdAt?.seconds || 0;
    const bTime = b.createdAt?.seconds || 0;
    return bTime - aTime;
  });
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

export function getDescendants(comments: IComment[], rootId: string): IComment[] {
  const childrenMap = new Map<string, IComment[]>();
  for (const c of comments) {
    if (!c.parentId) {
      continue;
    }
    if (!childrenMap.has(c.parentId)) {
      childrenMap.set(c.parentId, []);
    }
    childrenMap.get(c.parentId)!.push(c);
  }

  const result: IComment[] = [];
  const queue = childrenMap.get(rootId) ?? [];

  while (queue.length > 0) {
    const current = queue.shift()!;
    result.push(current);
    const children = childrenMap.get(current.id);
    if (children) {
      queue.push(...children);
    }
  }

  return result;
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
