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
  Query,
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

function withPagination(
  baseQuery: Query<IPost>,
  limitCount: number,
  lastDoc?: QueryDocumentSnapshot<DocumentData>
) {
  let q = query(baseQuery, orderBy("createdAt", "desc"), limit(limitCount));
  if (lastDoc) q = query(q, startAfter(lastDoc));
  return q;
}

function buildPaginatedResult(snapshot: QuerySnapshot<IPost>, limitCount: number) {
  return {
    posts: mapSnapshot(snapshot),
    lastVisible: snapshot.docs[snapshot.docs.length - 1] ?? null,
    hasMore: snapshot.docs.length === limitCount,
  };
}

export async function voteOnDocument(
  collectionName: string,
  docId: string,
  userId: string,
  voteValue: 1 | -1 | 0,
  previousValue: number
) {
  const docRef = doc(db, collectionName, docId);
  const voteRef = doc(db, collectionName, docId, "userVotes", userId);

  await runTransaction(db, async (transaction) => {
    const change = voteValue - previousValue;
    transaction.set(voteRef, { value: voteValue });
    transaction.update(docRef, { votes: increment(change) });
  });
}

export const PostsService = {
  async getAllPosts(limitCount = 10, lastDoc?: QueryDocumentSnapshot<DocumentData>) {
    const snapshot = await getDocs(withPagination(postsRef, limitCount, lastDoc));
    return buildPaginatedResult(snapshot, limitCount);
  },

  async getFeedPosts(
    subscribedCommunityIds: string[],
    limitCount = 10,
    lastDoc?: QueryDocumentSnapshot<DocumentData>
  ) {
    if (!subscribedCommunityIds?.length) return { posts: [], lastVisible: null, hasMore: false };

    const limitedIds = subscribedCommunityIds.slice(0, FIRESTORE_IN_LIMIT);
    const base = query(postsRef, where("communityId", "in", limitedIds));
    const snapshot = await getDocs(withPagination(base, limitCount, lastDoc));
    return buildPaginatedResult(snapshot, limitCount);
  },

  async getUserPosts(
    userId: string,
    limitCount = 10,
    lastDoc?: QueryDocumentSnapshot<DocumentData>
  ) {
    const base = query(postsRef, where("authorId", "==", userId));
    const snapshot = await getDocs(withPagination(base, limitCount, lastDoc));
    return buildPaginatedResult(snapshot, limitCount);
  },

  async getCommunityPosts(
    communityId: string,
    limitCount = 10,
    lastDoc?: QueryDocumentSnapshot<DocumentData>
  ) {
    const base = query(postsRef, where("communityId", "==", communityId));
    const snapshot = await getDocs(withPagination(base, limitCount, lastDoc));
    return buildPaginatedResult(snapshot, limitCount);
  },

  async getPostById(postId: string) {
    const postDoc = await getDoc(doc(postsRef, postId));
    return postDoc.exists() ? postDoc.data() : null;
  },

  async createPost(data: Omit<IPost, "id" | "createdAt" | "votes" | "commentsCount">) {
    const postRef = doc(postsRef);

    const cleanData = Object.fromEntries(Object.entries(data).filter(([, v]) => v !== undefined));

    const newPost = {
      ...cleanData,
      id: postRef.id,
      createdAt: serverTimestamp(),
      votes: 0,
      commentsCount: 0,
      tags: data.tags ?? [],
    } as IPost;

    await setDoc(postRef, newPost);
    return postRef.id;
  },

  async votePost(postId: string, userId: string, voteValue: 1 | -1 | 0, previousValue: number) {
    await voteOnDocument("posts", postId, userId, voteValue, previousValue);
  },

  async updatePost(postId: string, data: Partial<Omit<IPost, "id" | "createdAt">>) {
    const postRef = doc(db, "posts", postId);
    await updateDoc(postRef, {
      ...data,
      isEdited: true,
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
    snapshot.forEach((postDoc) => batch.delete(postDoc.ref));
    await batch.commit();
  },
};
