import {
  collection,
  addDoc,
  serverTimestamp,
  increment,
  doc,
  updateDoc,
  query,
  where,
  getDoc,
  orderBy,
  onSnapshot,
} from "firebase/firestore";

import { db } from "@/lib/firebase";
import { IComment, IPost } from "@/types/types";

import { NotificationService } from "./notification.service";
import { voteOnDocument } from "./posts.service";

export const CommentsService = {
  async addComment(
    data: Omit<IComment, "id" | "createdAt" | "votes">,
    post: IPost,
    parentCommentAuthorId?: string
  ) {
    const commentRef = await addDoc(collection(db, "comments"), {
      ...data,
      votes: 0,
      createdAt: serverTimestamp(),
    });

    await updateDoc(doc(db, "posts", data.postId), {
      commentsCount: increment(1),
    });

    if (data.parentId && parentCommentAuthorId) {
      await NotificationService.createNotification({
        issuerId: data.authorId,
        issuerName: data.authorName,
        postId: post.id,
        communityName: post.communityName,
        commentId: commentRef.id,
        recipientId: parentCommentAuthorId,
        type: "REPLY",
      });
    }

    return commentRef.id;
  },

  async updateComment(commentId: string, text: string) {
    await updateDoc(doc(db, "comments", commentId), {
      text,
      isEdited: true,
      updatedAt: serverTimestamp(),
    });
  },

  async voteComment(
    commentId: string,
    userId: string,
    voteValue: 1 | -1 | 0,
    previousValue: number
  ) {
    await voteOnDocument("comments", commentId, userId, voteValue, previousValue);
  },

  async getCommentVoteStatus(commentId: string, userId: string): Promise<number> {
    const voteRef = doc(db, "comments", commentId, "userVotes", userId);
    const docSnap = await getDoc(voteRef);
    return docSnap.exists() ? docSnap.data().value : 0;
  },

  subscribeToPostComments(postId: string, callback: (comments: IComment[]) => void) {
    const q = query(
      collection(db, "comments"),
      where("postId", "==", postId),
      orderBy("createdAt", "asc")
    );

    return onSnapshot(q, (snapshot) => {
      const comments = snapshot.docs.map((doc) => ({
        id: doc.id,

        ...doc.data({ serverTimestamps: "estimate" }),
      })) as IComment[];

      callback(comments);
    });
  },
};
