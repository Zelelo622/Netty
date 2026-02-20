import { ICommunity } from "@repo/types";
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
} from "firebase/firestore";

import { db } from "@/lib/firebase";

import { PostsService } from "./posts.service";

const communityConverter: FirestoreDataConverter<ICommunity> = {
  toFirestore: (community: ICommunity) => community,
  fromFirestore: (snapshot, options) => {
    const data = snapshot.data(options)!;
    return { ...data, id: snapshot.id } as ICommunity;
  },
};

const communitiesRef = collection(db, "communities").withConverter(communityConverter);

const cleanCommunityName = (name: string) => name.trim();
const mapSnapshot = (snapshot: QuerySnapshot<ICommunity>) => snapshot.docs.map((doc) => doc.data());

export const CommunityService = {
  async getCommunitiesBatch(
    limitCount = 10,
    lastVisibleDoc: QueryDocumentSnapshot<ICommunity> | null = null
  ) {
    let q = query(communitiesRef, orderBy("membersCount", "desc"), limit(limitCount));

    if (lastVisibleDoc) {
      q = query(q, startAfter(lastVisibleDoc));
    }

    const snapshot = await getDocs(q);

    const lastDoc = snapshot.docs[snapshot.docs.length - 1] as QueryDocumentSnapshot<ICommunity>;

    return {
      communities: mapSnapshot(snapshot),
      lastDoc: lastDoc || null,
      hasMore: snapshot.docs.length === limitCount,
    };
  },

  subscribeToUserCommunities(userId: string, callback: (communities: ICommunity[]) => void) {
    const q = query(communitiesRef, where("subscribers", "array-contains", userId));

    return onSnapshot(
      q,
      (snapshot) => {
        callback(mapSnapshot(snapshot));
      },
      (error) => {
        console.error("Subscription error:", error);
      }
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

  async toggleSubscription(communityId: string, userId: string, isSubscribed: boolean) {
    const communityRef = doc(communitiesRef, communityId);
    const userRef = doc(db, "users", userId);

    try {
      await runTransaction(db, async (transaction) => {
        const communityDoc = await transaction.get(communityRef);
        if (!communityDoc.exists()) throw new Error("Сообщество не существует");

        const communityData = communityDoc.data();

        if (communityData.creatorId === userId && isSubscribed) {
          throw new Error(
            "Создатель не может покинуть своё сообщество. Вы можете только удалить его."
          );
        }

        const communityUpdate = isSubscribed
          ? { subscribers: arrayRemove(userId), membersCount: increment(-1) }
          : { subscribers: arrayUnion(userId), membersCount: increment(1) };

        const userUpdate = {
          subscribedCommunities: isSubscribed ? arrayRemove(communityId) : arrayUnion(communityId),
        };

        transaction.update(communityRef, communityUpdate);
        transaction.update(userRef, userUpdate);
      });
    } catch (error) {
      console.error("Toggle subscription error:", error);
      throw error;
    }
  },

  async createCommunity(data: {
    name: string;
    creatorId: string;
    description?: string;
    avatarUrl?: string;
    bannerUrl?: string;
  }) {
    const nameToSearch = cleanCommunityName(data.name);
    const userRef = doc(db, "users", data.creatorId);
    const newCommunityRef = doc(communitiesRef);

    try {
      return await runTransaction(db, async (transaction) => {
        const nameQuery = query(communitiesRef, where("name", "==", nameToSearch));
        const nameCheck = await getDocs(nameQuery);

        if (!nameCheck.empty) {
          throw new Error("Это название уже занято");
        }

        const newCommunityData: ICommunity = {
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

        transaction.set(newCommunityRef, newCommunityData);
        transaction.update(userRef, {
          subscribedCommunities: arrayUnion(newCommunityRef.id),
        });

        return nameToSearch;
      });
    } catch (error) {
      console.error("Create community error:", error);
      throw error;
    }
  },

  async getCommunityData(communityName: string) {
    const cleanName = cleanCommunityName(communityName);
    const q = query(communitiesRef, where("name", "==", cleanName));
    const snapshot = await getDocs(q);

    return snapshot.empty ? null : snapshot.docs[0].data();
  },

  async updateCommunity(communityId: string, data: Partial<ICommunity>) {
    const communityRef = doc(communitiesRef, communityId);

    if (data.name) {
      data.name = cleanCommunityName(data.name);
      const nameQuery = query(communitiesRef, where("name", "==", data.name));
      const nameCheck = await getDocs(nameQuery);
      const isTaken = nameCheck.docs.some((d) => d.id !== communityId);
      if (isTaken) throw new Error("Название уже занято");
    }

    await runTransaction(db, async (transaction) => {
      transaction.update(communityRef, {
        ...data,
      });
    });

    return data.name;
  },

  async deleteCommunity(communityId: string) {
    await PostsService.deleteAllCommunityPosts(communityId);

    await runTransaction(db, async (transaction) => {
      const communityRef = doc(communitiesRef, communityId);
      const communityDoc = await transaction.get(communityRef);

      if (!communityDoc.exists()) throw new Error("Сообщество не найдено");

      transaction.delete(communityRef);
    });
  },
};
