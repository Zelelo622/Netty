import { useEffect, useState } from "react";

import { UserProfileCache } from "@/lib/userProfileCache";
import { IUserProfile } from "@/services/users.service";

export function useUserProfile(uid: string | undefined) {
  const [profile, setProfile] = useState<IUserProfile | null>(
    uid ? UserProfileCache.get(uid) : null
  );
  const [loading, setLoading] = useState(!profile && !!uid);

  useEffect(() => {
    if (!uid) return;

    const cached = UserProfileCache.get(uid);
    if (cached) {
      setProfile(cached);
      setLoading(false);
      return;
    }

    setLoading(true);
    UserProfileCache.fetch(uid).then((p) => {
      setProfile(p);
      setLoading(false);
    });
  }, [uid]);

  return { profile, loading };
}
