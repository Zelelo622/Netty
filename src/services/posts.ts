import { db } from "@/lib/firebase";
import { IPost } from "@/types/types";
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  increment,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  setDoc,
  where,
} from "firebase/firestore";

const postsRef = collection(db, "posts");

export const PostsService = {
  async getAllPosts() {
    try {
      const q = query(postsRef, orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      })) as IPost[];
    } catch (error) {
      console.error("Ошибка при получении всех постов:", error);
      throw error;
    }
  },

  async getFeedPosts(subscribedCommunityIds: string[]) {
    try {
      if (!subscribedCommunityIds || subscribedCommunityIds.length === 0)
        return [];

      const limitedIds = subscribedCommunityIds.slice(0, 30);

      const q = query(
        postsRef,
        where("communityId", "in", limitedIds),
        orderBy("createdAt", "desc"),
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      })) as IPost[];
    } catch (error) {
      console.error("Ошибка при получении ленты:", error);
      throw error;
    }
  },

  async getUserPosts(userId: string) {
    try {
      const q = query(
        postsRef,
        where("authorId", "==", userId),
        orderBy("createdAt", "desc"),
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      })) as IPost[];
    } catch (error) {
      console.error("Ошибка при получении постов пользователя:", error);
      throw error;
    }
  },

  async getCommunityPosts(communityId: string) {
    try {
      const q = query(
        postsRef,
        where("communityId", "==", communityId),
        orderBy("createdAt", "desc"),
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      })) as IPost[];
    } catch (error) {
      console.error("Ошибка при выборке сообщений:", error);
      throw error;
    }
  },

  async getPostById(postId: string) {
    try {
      const postDoc = await getDoc(doc(db, "posts", postId));
      return postDoc.exists()
        ? ({ ...postDoc.data(), id: postDoc.id } as IPost)
        : null;
    } catch (error) {
      throw error;
    }
  },

  async createPost(data: {
    title: string;
    content: string;
    communityId: string;
    communityName: string;
    authorId: string;
    authorName: string;
    authorImage?: string;
    imageUrl?: string;
    tags?: string[];
  }) {
    const postRef = doc(collection(db, "posts"));

    const newPost: IPost = {
      ...data,
      id: postRef.id,
      createdAt: serverTimestamp(),
      votes: 0,
      commentsCount: 0,
      tags: data.tags || [],
    };

    await setDoc(postRef, newPost);

    return postRef.id;
  },

  async votePost(
    postId: string,
    userId: string,
    voteValue: 1 | -1 | 0,
    previousValue: number,
  ) {
    const postRef = doc(db, "posts", postId);
    const voteRef = doc(db, "posts", postId, "userVotes", userId);

    try {
      await runTransaction(db, async (transaction) => {
        const change = voteValue - previousValue;

        transaction.set(voteRef, { value: voteValue });
        transaction.update(postRef, {
          votes: increment(change),
        });
      });
    } catch (error) {
      console.error("Ошибка при голосовании:", error);
      throw error;
    }
  },

  async getUserVoteStatus(postId: string, userId: string) {
    const voteRef = doc(db, "posts", postId, "userVotes", userId);
    const docSnap = await getDoc(voteRef);
    return docSnap.exists() ? docSnap.data().value : 0;
  },

  async deletePost(postId: string) {
    try {
      const postRef = doc(db, "posts", postId);
      await deleteDoc(postRef);
    } catch (error) {
      console.error("Ошибка при удалении поста:", error);
      throw error;
    }
  },
};
