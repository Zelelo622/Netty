import { collection, onSnapshot, orderBy, query, where } from "firebase/firestore";
import { useEffect, useState } from "react";

import { db } from "@/lib/firebase";
import { IConversation } from "@/types/types";

export function useUserConversations(uid?: string) {
  const [conversations, setConversations] = useState<IConversation[]>([]);

  useEffect(() => {
    if (!uid) return;

    const q = query(
      collection(db, "conversations"),
      where("participants", "array-contains", uid),
      orderBy("lastMessageAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snap) => {
      const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() }) as IConversation);
      setConversations(docs);
    });

    return () => unsubscribe();
  }, [uid]);

  return { conversations };
}
