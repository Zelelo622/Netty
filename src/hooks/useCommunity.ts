import { useEffect, useState } from "react";

import { CommunityCache } from "@/lib/communityCache";
import { ICommunity } from "@/types/types";

export function useCommunity(communityName: string | undefined) {
  const [community, setCommunity] = useState<ICommunity | null>(
    communityName ? CommunityCache.get(communityName) : null
  );

  useEffect(() => {
    if (!communityName) return;

    const cached = CommunityCache.get(communityName);
    if (cached) {
      setCommunity(cached);
      return;
    }

    CommunityCache.fetch(communityName).then(setCommunity);
  }, [communityName]);

  return community;
}
