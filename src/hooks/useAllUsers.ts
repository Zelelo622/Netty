import { collection, getDocs } from "firebase/firestore";
import { useEffect, useState } from "react";

import { db } from "@/lib/firebase";
import { IUserProfile } from "@/services/users.service";

export function useAllUsers(currentUid: string | undefined) {
  const [users, setUsers] = useState<IUserProfile[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!currentUid) return;

    setLoading(true);
    getDocs(collection(db, "users"))
      .then((snap) => {
        const all = snap.docs
          .map((d) => ({ uid: d.id, ...d.data() }) as IUserProfile)
          .filter((u) => u.uid !== currentUid);
        setUsers(all);
      })
      .finally(() => setLoading(false));
  }, [currentUid]);

  return { users, loading };
}
