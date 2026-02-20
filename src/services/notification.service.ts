import {
  addDoc,
  collection,
  doc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";

import { db } from "@/lib/firebase";
import { INotification, IPost } from "@/types/types";

export const NotificationService = {
  async createNotification(notificationData: Omit<INotification, "id" | "createdAt" | "read">) {
    if (notificationData.recipientId === notificationData.issuerId) {
      return;
    }

    try {
      await addDoc(collection(db, "notifications"), {
        ...notificationData,
        read: false,
        createdAt: serverTimestamp(),
      });
    } catch (e) {
      console.error("Ошибка при записи уведомления:", e);
    }
  },

  async processMentions(text: string, post: IPost, issuer: { uid: string; displayName: string }) {
    const mentions = text.match(/u\/([a-zA-Z0-9_]+)/g);
    if (!mentions) return;

    const usernames = [...new Set(mentions.map((m) => m.replace("u/", "")))];

    for (const username of usernames) {
      if (username === issuer.displayName) continue;

      const q = query(collection(db, "users"), where("displayName", "==", username));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const recipientId = querySnapshot.docs[0].id;

        await this.createNotification({
          recipientId,
          issuerId: issuer.uid,
          issuerName: issuer.displayName,
          type: "TAG",
          postId: post.id,
          postSlug: post.slug,
          communityName: post.communityName,
        });
      }
    }
  },

  subscribeToNotifications(userId: string, callback: (data: INotification[]) => void) {
    const q = query(
      collection(db, "notifications"),
      where("recipientId", "==", userId),
      orderBy("createdAt", "desc")
    );

    return onSnapshot(q, (snapshot) => {
      const notifications = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as INotification[];
      callback(notifications);
    });
  },

  async markAsRead(notificationId: string) {
    await updateDoc(doc(db, "notifications", notificationId), { read: true });
  },
};
