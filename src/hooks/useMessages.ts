import {
  collection,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  QueryDocumentSnapshot,
  startAfter,
} from "firebase/firestore";
import { useCallback, useEffect, useRef, useState } from "react";

import { db } from "@/lib/firebase";
import { IMessage } from "@/types/types";

export function useMessages(convId: string | null, pageSize = 100) {
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const oldestCursorRef = useRef<QueryDocumentSnapshot | null>(null);
  const convIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!convId) {
      setMessages([]);
      setHasMore(false);
      setLoading(false);
      oldestCursorRef.current = null;
      return;
    }

    if (convIdRef.current !== convId) {
      convIdRef.current = convId;
      oldestCursorRef.current = null;
      setMessages([]);
      setHasMore(false);
    }

    setLoading(true);

    const q = query(
      collection(db, "conversations", convId, "messages"),
      orderBy("createdAt", "desc"),
      limit(pageSize)
    );

    const unsubscribe = onSnapshot(
      q,
      { includeMetadataChanges: false },
      (snap) => {
        const latestMsgs = snap.docs.map((d) => ({ id: d.id, ...d.data() }) as IMessage).reverse();

        if (snap.docs.length > 0) {
          oldestCursorRef.current = snap.docs[snap.docs.length - 1];
        }

        setHasMore(snap.docs.length === pageSize);

        setMessages((prev) => {
          const latestIds = new Set(latestMsgs.map((m) => m.id));
          const olderPageMsgs = prev.filter((m) => !latestIds.has(m.id));
          return [...olderPageMsgs, ...latestMsgs];
        });

        setLoading(false);
      },
      (error) => {
        console.warn("[useMessages] snapshot error:", error.code);
        setLoading(false);
        setMessages([]);
      }
    );

    return () => {
      unsubscribe();
    };
  }, [convId, pageSize]);

  const loadMore = useCallback(async () => {
    if (!convId || !hasMore || loadingMore || !oldestCursorRef.current) return;

    setLoadingMore(true);

    try {
      const q = query(
        collection(db, "conversations", convId, "messages"),
        orderBy("createdAt", "desc"),
        startAfter(oldestCursorRef.current),
        limit(pageSize)
      );

      const snap = await getDocs(q);

      if (snap.docs.length > 0) {
        oldestCursorRef.current = snap.docs[snap.docs.length - 1];

        const olderMsgs = snap.docs.map((d) => ({ id: d.id, ...d.data() }) as IMessage).reverse(); // oldest-first for display

        setMessages((prev) => [...olderMsgs, ...prev]);
      }

      setHasMore(snap.docs.length === pageSize);
    } catch (err) {
      console.error("[useMessages] loadMore failed:", err);
    } finally {
      setLoadingMore(false);
    }
  }, [convId, hasMore, loadingMore, pageSize]);

  return { messages, loading, loadingMore, hasMore, loadMore };
}
