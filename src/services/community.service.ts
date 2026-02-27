import {
  collection,
  getDocs,
  query,
  orderBy,
  where,
  onSnapshot,
  doc,
  runTransaction,
  arrayRemove,
  increment,
  arrayUnion,
  serverTimestamp,
  FirestoreDataConverter,
  QuerySnapshot,
  QueryDocumentSnapshot,
  limit,
  startAfter,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";

import { db } from "@/lib/firebase";
import { ICommunity } from "@/types/types";

import { PostsService } from "./posts.service";

const communityConverter: FirestoreDataConverter<ICommunity> = {
  toFirestore: (community: ICommunity) => community,
  fromFirestore: (snapshot, options) => {
    const data = snapshot.data(options)!;
    return { ...data, id: snapshot.id } as ICommunity;
  },
};

const communitiesRef = collection(db, "communities").withConverter(communityConverter);

const cleanName = (name: string) => name.trim();
const mapSnapshot = (snapshot: QuerySnapshot<ICommunity>) => snapshot.docs.map((doc) => doc.data());

export const CommunityService = {
  async getCommunitiesBatch(
    limitCount = 10,
    lastVisibleDoc: QueryDocumentSnapshot<ICommunity> | null = null
  ) {
    let q = query(communitiesRef, orderBy("membersCount", "desc"), limit(limitCount));
    if (lastVisibleDoc) q = query(q, startAfter(lastVisibleDoc));

    const snapshot = await getDocs(q);

    return {
      communities: mapSnapshot(snapshot),
      lastDoc: (snapshot.docs[snapshot.docs.length - 1] ??
        null) as QueryDocumentSnapshot<ICommunity> | null,
      hasMore: snapshot.docs.length === limitCount,
    };
  },

  subscribeToUserCommunities(userId: string, callback: (communities: ICommunity[]) => void) {
    const q = query(communitiesRef, where("subscribers", "array-contains", userId));

    return onSnapshot(
      q,
      (snapshot) => callback(mapSnapshot(snapshot)),
      (error) => console.error("Subscription error:", error)
    );
  },

  async getUserCommunities(userId: string, limitCount = 100) {
    const q = query(
      communitiesRef,
      where("subscribers", "array-contains", userId),
      limit(limitCount)
    );
    const snapshot = await getDocs(q);
    return mapSnapshot(snapshot);
  },

  async getCommunityData(communityName: string) {
    const q = query(communitiesRef, where("name", "==", cleanName(communityName)));
    const snapshot = await getDocs(q);
    return snapshot.empty ? null : snapshot.docs[0].data();
  },

  async toggleSubscription(communityId: string, userId: string, isSubscribed: boolean) {
    const communityRef = doc(communitiesRef, communityId);
    const userRef = doc(db, "users", userId);

    await runTransaction(db, async (transaction) => {
      const communityDoc = await transaction.get(communityRef);
      if (!communityDoc.exists()) throw new Error("Сообщество не существует");

      const { creatorId } = communityDoc.data();
      if (creatorId === userId && isSubscribed) {
        throw new Error(
          "Создатель не может покинуть своё сообщество. Вы можете только удалить его."
        );
      }

      const communityUpdate = isSubscribed
        ? { subscribers: arrayRemove(userId), membersCount: increment(-1) }
        : { subscribers: arrayUnion(userId), membersCount: increment(1) };

      transaction.update(communityRef, communityUpdate);
      transaction.update(userRef, {
        subscribedCommunities: isSubscribed ? arrayRemove(communityId) : arrayUnion(communityId),
      });
    });
  },

  async createCommunity(data: {
    name: string;
    creatorId: string;
    description?: string;
    avatarUrl?: string;
    bannerUrl?: string;
  }) {
    const nameToSearch = cleanName(data.name);
    const userRef = doc(db, "users", data.creatorId);
    const newCommunityRef = doc(communitiesRef);

    return await runTransaction(db, async (transaction) => {
      const nameCheck = await getDocs(query(communitiesRef, where("name", "==", nameToSearch)));
      if (!nameCheck.empty) throw new Error("Это название уже занято");

      const newCommunity: ICommunity = {
        id: newCommunityRef.id,
        name: nameToSearch,
        description: data.description || "",
        creatorId: data.creatorId,
        createdAt: serverTimestamp() as any,
        membersCount: 1,
        subscribers: [data.creatorId],
        avatarUrl: data.avatarUrl || "",
        bannerUrl: data.bannerUrl || "",
      };

      transaction.set(newCommunityRef, newCommunity);
      transaction.update(userRef, {
        subscribedCommunities: arrayUnion(newCommunityRef.id),
      });

      return nameToSearch;
    });
  },

  async updateCommunity(communityId: string, data: Partial<ICommunity>) {
    const communityRef = doc(communitiesRef, communityId);

    if (data.name) {
      data.name = cleanName(data.name);
      const nameCheck = await getDocs(query(communitiesRef, where("name", "==", data.name)));
      if (nameCheck.docs.some((d) => d.id !== communityId)) {
        throw new Error("Название уже занято");
      }
    }

    await updateDoc(communityRef, data);

    return data.name;
  },

  async deleteCommunity(communityId: string) {
    await PostsService.deleteAllCommunityPosts(communityId);
    await deleteDoc(doc(communitiesRef, communityId));
  },
};
