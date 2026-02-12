import {
  collection,
  getDocs,
  query,
  orderBy,
  where,
  onSnapshot,
  QuerySnapshot,
  DocumentData,
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
        console.error("Subscription error:", error);
      },
    );
  },

  async toggleSubscription(
    communityId: string,
    userId: string,
    isSubscribed: boolean,
  ) {
    const communityRef = doc(db, "communities", communityId);

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
        } else {
          transaction.update(communityRef, {
            subscribers: arrayUnion(userId),
            membersCount: increment(1),
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
    title: string;
    creatorId: string;
  }) {
    const communityId = data.name.toLowerCase().trim();
    const communityRef = doc(db, "communities", communityId);

    const docSnap = await getDoc(communityRef);
    if (docSnap.exists()) {
      throw new Error("Сообщество с таким названием уже существует");
    }

    await setDoc(communityRef, {
      name: communityId,
      title: data.title,
      creatorId: data.creatorId,
      createdAt: serverTimestamp(),
      membersCount: 1,
      subscribers: [data.creatorId],
      imgUrl: "",
    });

    return communityId;
  },
};
