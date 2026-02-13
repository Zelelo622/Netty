import { db } from "@/lib/firebase";
import { IPost } from "@/types/types";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  where,
} from "firebase/firestore";

const postsRef = collection(db, "posts");

export const PostsService = {
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
};
