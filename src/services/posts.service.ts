import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  increment,
  limit,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  setDoc,
  where,
  writeBatch,
  QuerySnapshot,
  FirestoreDataConverter,
  DocumentData,
  QueryDocumentSnapshot,
  startAfter,
  updateDoc,
} from "firebase/firestore";

import { db } from "@/lib/firebase";
import { IPost } from "@/types/types";

const postConverter: FirestoreDataConverter<IPost> = {
  toFirestore: (post: IPost) => post,
  fromFirestore: (snapshot, options) => {
    const data = snapshot.data(options)!;
    return { ...data, id: snapshot.id } as IPost;
  },
};

const postsRef = collection(db, "posts").withConverter(postConverter);
const FIRESTORE_IN_LIMIT = 30;

const mapSnapshot = (snapshot: QuerySnapshot<IPost>) => snapshot.docs.map((doc) => doc.data());

export const PostsService = {
  async getAllPosts(limitCount = 10, lastDoc?: QueryDocumentSnapshot<DocumentData>) {
    let q = query(postsRef, orderBy("createdAt", "desc"), limit(limitCount));

    if (lastDoc) {
      q = query(q, startAfter(lastDoc));
    }

    const snapshot = await getDocs(q);
    return {
      posts: mapSnapshot(snapshot),
      lastVisible: snapshot.docs[snapshot.docs.length - 1] || null,
    };
  },

  async getFeedPosts(
    subscribedCommunityIds: string[],
    limitCount = 10,
    lastDoc?: QueryDocumentSnapshot<DocumentData>
  ) {
    if (!subscribedCommunityIds?.length) return { posts: [], lastVisible: null };

    const limitedIds = subscribedCommunityIds.slice(0, FIRESTORE_IN_LIMIT);

    let q = query(
      postsRef,
      where("communityId", "in", limitedIds),
      orderBy("createdAt", "desc"),
      limit(limitCount)
    );

    if (lastDoc) {
      q = query(q, startAfter(lastDoc));
    }

    const snapshot = await getDocs(q);
    return {
      posts: mapSnapshot(snapshot),
      lastVisible: snapshot.docs[snapshot.docs.length - 1] || null,
    };
  },

  async getUserPosts(
    userId: string,
    limitCount = 10,
    lastDoc?: QueryDocumentSnapshot<DocumentData>
  ) {
    let q = query(
      postsRef,
      where("authorId", "==", userId),
      orderBy("createdAt", "desc"),
      limit(limitCount)
    );

    if (lastDoc) {
      q = query(q, startAfter(lastDoc));
    }

    const snapshot = await getDocs(q);
    return {
      posts: mapSnapshot(snapshot),
      lastVisible: snapshot.docs[snapshot.docs.length - 1] || null,
    };
  },

  async getCommunityPosts(
    communityId: string,
    limitCount = 10,
    lastDoc?: QueryDocumentSnapshot<DocumentData>
  ) {
    let q = query(
      postsRef,
      where("communityId", "==", communityId),
      orderBy("createdAt", "desc"),
      limit(limitCount)
    );

    if (lastDoc) {
      q = query(q, startAfter(lastDoc));
    }

    const snapshot = await getDocs(q);

    return {
      posts: mapSnapshot(snapshot),
      lastVisible: snapshot.docs[snapshot.docs.length - 1] || null,
    };
  },

  async getPostById(postId: string) {
    const postDoc = await getDoc(doc(postsRef, postId));
    return postDoc.exists() ? postDoc.data() : null;
  },

  async getPostBySlug(slug: string): Promise<IPost | null> {
    const q = query(postsRef, where("slug", "==", slug), limit(1));
    const snapshot = await getDocs(q);
    return snapshot.empty ? null : snapshot.docs[0].data();
  },

  async createPost(data: Partial<IPost>) {
    const postRef = doc(postsRef);

    const cleanData = Object.fromEntries(Object.entries(data).filter(([_, v]) => v !== undefined));

    const newPost = {
      ...cleanData,
      id: postRef.id,
      createdAt: serverTimestamp(),
      votes: 0,
      commentsCount: 0,
      tags: data.tags || [],
    } as IPost;

    await setDoc(postRef, newPost);
    return postRef.id;
  },

  async votePost(postId: string, userId: string, voteValue: 1 | -1 | 0, previousValue: number) {
    const postRef = doc(db, "posts", postId);
    const voteRef = doc(db, "posts", postId, "userVotes", userId);

    try {
      await runTransaction(db, async (transaction) => {
        const change = voteValue - previousValue;
        transaction.set(voteRef, { value: voteValue });
        transaction.update(postRef, { votes: increment(change) });
      });
    } catch (error) {
      console.error("Vote error:", error);
      throw error;
    }
  },

  async updatePost(postId: string, data: Partial<IPost>) {
    const postRef = doc(db, "posts", postId);
    await updateDoc(postRef, {
      ...data,
      updatedAt: serverTimestamp(),
    });
  },

  async getUserVoteStatus(postId: string, userId: string): Promise<number> {
    const voteRef = doc(db, "posts", postId, "userVotes", userId);
    const docSnap = await getDoc(voteRef);
    return docSnap.exists() ? docSnap.data().value : 0;
  },

  async deletePost(postId: string) {
    await deleteDoc(doc(db, "posts", postId));
  },

  async deleteAllCommunityPosts(communityId: string) {
    const q = query(postsRef, where("communityId", "==", communityId));
    const snapshot = await getDocs(q);
    const batch = writeBatch(db);

    snapshot.forEach((postDoc) => {
      batch.delete(postDoc.ref);
    });

    await batch.commit();
  },
};
