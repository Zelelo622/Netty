import {
  arrayRemove,
  arrayUnion,
  collection,
  doc,
  getDoc,
  getDocs,
  increment,
  limit,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
  where,
  writeBatch,
} from "firebase/firestore";

import { db } from "@/lib/firebase";
import { IConversation, IMessage } from "@/types/types";

const CONVERSATIONS_COLLECTION = "conversations";

export function getConvId(uid1: string, uid2: string) {
  return [uid1, uid2].sort().join("_");
}

export const ChatService = {
  async getOrCreateConversation(uid1: string, uid2: string): Promise<IConversation> {
    const participants = [uid1, uid2].sort() as [string, string];
    const convId = participants.join("_");

    const convRef = doc(db, CONVERSATIONS_COLLECTION, convId);
    const convSnap = await getDoc(convRef);

    if (convSnap.exists()) {
      return { id: convId, ...convSnap.data() } as IConversation;
    }

    const now = serverTimestamp() as Timestamp;
    const newConv: Omit<IConversation, "id"> = {
      participants,
      lastMessageAt: null,
      lastMessagePreview: "",
      lastMessageSenderId: "",
      unreadCount: { [uid1]: 0, [uid2]: 0 },
      createdAt: now,
      updatedAt: now,
    };

    await setDoc(convRef, newConv);
    return { id: convId, ...newConv };
  },

  async sendMessage(
    convId: string,
    senderId: string,
    recipientId: string,
    text: string
  ): Promise<string> {
    const messagesColl = collection(db, CONVERSATIONS_COLLECTION, convId, "messages");
    const msgRef = doc(messagesColl);
    const batch = writeBatch(db);

    const msgData: Omit<IMessage, "id"> = {
      text,
      senderId,
      createdAt: serverTimestamp() as Timestamp,
    };

    batch.set(msgRef, msgData);

    batch.update(doc(db, CONVERSATIONS_COLLECTION, convId), {
      lastMessageAt: serverTimestamp(),
      lastMessagePreview: text.slice(0, 100) + (text.length > 100 ? "..." : ""),
      lastMessageSenderId: senderId,
      updatedAt: serverTimestamp(),
      [`unreadCount.${senderId}`]: 0,
      [`unreadCount.${recipientId}`]: increment(1),
    });

    await batch.commit();
    return msgRef.id;
  },

  async getUserConversations(uid: string, maxResults = 30): Promise<IConversation[]> {
    const q = query(
      collection(db, CONVERSATIONS_COLLECTION),
      where("participants", "array-contains", uid),
      orderBy("lastMessageAt", "desc"),
      limit(maxResults)
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as IConversation);
  },

  async markAsRead(convId: string, uid: string): Promise<void> {
    await updateDoc(doc(db, CONVERSATIONS_COLLECTION, convId), {
      [`unreadCount.${uid}`]: 0,
    });
  },

  async toggleReaction(
    convId: string,
    messageId: string,
    uid: string,
    emoji: string,
    action: "add" | "remove"
  ): Promise<void> {
    const msgRef = doc(db, CONVERSATIONS_COLLECTION, convId, "messages", messageId);
    await updateDoc(msgRef, {
      [`reactions.${emoji}`]: action === "add" ? arrayUnion(uid) : arrayRemove(uid),
    });
  },
};
