import { collection, onSnapshot, orderBy, query, limit } from "firebase/firestore";
import { useEffect, useState } from "react";

import { db } from "@/lib/firebase";
import { IMessage } from "@/types/types";

export function useMessages(convId: string | null, limitCount = 100) {
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!convId) {
      setMessages([]);
      return;
    }

    setLoading(true);

    const q = query(
      collection(db, "conversations", convId, "messages"),
      orderBy("createdAt", "asc"),
      limit(limitCount)
    );

    const unsubscribe = onSnapshot(q, (snap) => {
      setMessages(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as IMessage));
      setLoading(false);
    });

    return unsubscribe;
  }, [convId, limitCount]);

  return { messages, loading };
}
