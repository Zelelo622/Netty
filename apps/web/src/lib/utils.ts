import { IComment, INotification } from "@repo/types";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const generateSlug = (text: string): string => {
  const rus = "а-б-в-г-д-е-ё-ж-з-и-й-к-л-м-н-о-п-р-с-т-у-ф-х-ц-ч-ш-щ-ъ-ы-ь-э-ю-я".split("-");
  const lat = "a-b-v-g-d-e-e-zh-z-i-y-k-l-m-n-o-p-r-s-t-u-f-h-ts-ch-sh-shch--y--e-yu-ya".split("-");

  let res = text.toLowerCase();

  // Транслитерация
  for (let i = 0; i < rus.length; i++) {
    res = res.split(rus[i]).join(lat[i]);
  }

  return res
    .replace(/[^a-z0-9]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
};

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
