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
  getDoc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";
import { ICommunity } from "@/types/types";
import { db } from "@/lib/firebase";

const communitiesRef = collection(db, "communities");

export const CommunityService = {
  async getAllCommunities() {
    const q = query(communitiesRef, orderBy("membersCount", "desc"));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as ICommunity[];
  },

  subscribeToUserCommunities(
    userId: string,
    callback: (communities: ICommunity[]) => void,
  ) {
    const q = query(
      communitiesRef,
      where("subscribers", "array-contains", userId),
    );

    return onSnapshot(
      q,
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as ICommunity[];
        callback(data);
      },
      (error) => {
        console.error("Ошибка подписки:", error);
      },
    );
  },

  async toggleSubscription(
    communityId: string,
    userId: string,
    isSubscribed: boolean,
  ) {
    const communityRef = doc(db, "communities", communityId);
    const userRef = doc(db, "users", userId);

    try {
      await runTransaction(db, async (transaction) => {
        const communityDoc = await transaction.get(communityRef);
        if (!communityDoc.exists()) {
          throw "Сообщество не существует";
        }

        if (isSubscribed) {
          transaction.update(communityRef, {
            subscribers: arrayRemove(userId),
            membersCount: increment(-1),
          });
          transaction.update(userRef, {
            subscribedCommunities: arrayRemove(communityId),
          });
        } else {
          transaction.update(communityRef, {
            subscribers: arrayUnion(userId),
            membersCount: increment(1),
          });
          transaction.update(userRef, {
            subscribedCommunities: arrayUnion(communityId),
          });
        }
      });
    } catch (error) {
      console.error("Ошибка при обновлении подписки:", error);
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
    const nameToSearch = data.name.toLowerCase().trim();
    const userRef = doc(db, "users", data.creatorId);

    try {
      return await runTransaction(db, async (transaction) => {
        const q = query(communitiesRef, where("name", "==", nameToSearch));

        const newCommunityRef = doc(collection(db, "communities"));

        const newCommunityData = {
          id: newCommunityRef.id,
          name: nameToSearch,
          description: data.description || "",
          creatorId: data.creatorId,
          createdAt: serverTimestamp(),
          membersCount: 1,
          subscribers: [data.creatorId],
          avatarUrl: data.avatarUrl || "",
          bannerUrl: data.bannerUrl || "",
        };

        // Создаем сообщество
        transaction.set(newCommunityRef, newCommunityData);

        // Сразу подписываем создателя в его профиле
        transaction.update(userRef, {
          subscribedCommunities: arrayUnion(newCommunityRef.id),
        });

        return nameToSearch;
      });
    } catch (error: any) {
      console.error("Ошибка при создании:", error);
      throw error;
    }
  },

  async getCommunityData(communityName: string) {
    try {
      const cleanName = communityName.toLowerCase().trim();
      const q = query(communitiesRef, where("name", "==", cleanName));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const communityDoc = querySnapshot.docs[0];
        return { id: communityDoc.id, ...communityDoc.data() } as ICommunity;
      }
      return null;
    } catch (error) {
      console.error("Ошибка при получении данных:", error);
      throw error;
    }
  },

  async updateCommunity(
    communityId: string,
    data: {
      name: string;
      description?: string;
      avatarUrl?: string;
      bannerUrl?: string;
    },
  ) {
    const nameToSearch = data.name.toLowerCase().trim();
    const communityRef = doc(db, "communities", communityId);

    try {
      return await runTransaction(db, async (transaction) => {
        const q = query(
          collection(db, "communities"),
          where("name", "==", nameToSearch),
        );
        const querySnapshot = await getDocs(q);

        const isNameTaken = querySnapshot.docs.some(
          (doc) => doc.id !== communityId,
        );
        if (isNameTaken) {
          throw new Error(`Название n/${nameToSearch} уже занято`);
        }

        transaction.update(communityRef, {
          name: nameToSearch,
          description: data.description || "",
          avatarUrl: data.avatarUrl || "",
          bannerUrl: data.bannerUrl || "",
        });

        return nameToSearch;
      });
    } catch (error: any) {
      throw error;
    }
  },
};
