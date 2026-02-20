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
  writeBatch,
} from "firebase/firestore";

import { db } from "@/lib/firebase";
import { INotification } from "@/types/types";

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

  async clearAllNotifications(userId: string) {
    const q = query(collection(db, "notifications"), where("recipientId", "==", userId));
    const snapshot = await getDocs(q);

    const batch = writeBatch(db);
    snapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });

    await batch.commit();
  },
};
