import { db } from "@/lib/firebase";
import {
  collection,
  addDoc,
  serverTimestamp,
  increment,
  doc,
  updateDoc,
  query,
  where,
  orderBy,
  getDocs,
  runTransaction,
  getDoc,
} from "firebase/firestore";
import { IComment } from "@/types/types";

export const CommentsService = {
  async addComment(data: Omit<IComment, "id" | "createdAt" | "votes">) {
    const commentRef = await addDoc(collection(db, "comments"), {
      ...data,
      votes: 0,
      createdAt: serverTimestamp(),
    });

    const postRef = doc(db, "posts", data.postId);
    await updateDoc(postRef, {
      commentsCount: increment(1),
    });

    return commentRef.id;
  },

  async getPostComments(postId: string): Promise<IComment[]> {
    const q = query(collection(db, "comments"), where("postId", "==", postId));

    const snap = await getDocs(q);
    return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as IComment);
  },

  async updateComment(commentId: string, text: string) {
    const commentRef = doc(db, "comments", commentId);
    await updateDoc(commentRef, {
      text,
      isEdited: true,
      updatedAt: serverTimestamp(),
    });
  },

  async voteComment(
    commentId: string,
    userId: string,
    voteValue: 1 | -1 | 0,
    previousValue: number,
  ) {
    const commentRef = doc(db, "comments", commentId);
    const voteRef = doc(db, "comments", commentId, "userVotes", userId);

    try {
      await runTransaction(db, async (transaction) => {
        const change = voteValue - previousValue;

        transaction.set(voteRef, { value: voteValue });

        transaction.update(commentRef, { votes: increment(change) });
      });
    } catch (error) {
      console.error("Comment vote error:", error);
      throw error;
    }
  },

  async getCommentVoteStatus(
    commentId: string,
    userId: string,
  ): Promise<number> {
    const voteRef = doc(db, "comments", commentId, "userVotes", userId);
    const docSnap = await getDoc(voteRef);
    return docSnap.exists() ? docSnap.data().value : 0;
  },
};
