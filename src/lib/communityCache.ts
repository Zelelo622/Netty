import { CommunityService } from "@/services/community.service";
import { ICommunity } from "@/types/types";

interface ICacheEntry {
  data: ICommunity;
  fetchedAt: number;
}
const CACHE_TTL_MS = 10 * 60 * 1000;

const cache = new Map<string, ICacheEntry>();
const inFlight = new Map<string, Promise<ICommunity | null>>();

function isExpired(entry: ICacheEntry) {
  return Date.now() - entry.fetchedAt > CACHE_TTL_MS;
}

export const CommunityCache = {
  get(name: string): ICommunity | null {
    const entry = cache.get(name);
    if (!entry || isExpired(entry)) return null;
    return entry.data;
  },

  fetch(name: string): Promise<ICommunity | null> {
    const cached = this.get(name);
    if (cached) return Promise.resolve(cached);

    if (inFlight.has(name)) return inFlight.get(name)!;

    const promise = CommunityService.getCommunityData(name).then((data) => {
      inFlight.delete(name);
      if (data) cache.set(name, { data, fetchedAt: Date.now() });
      return data;
    });

    inFlight.set(name, promise);
    return promise;
  },

  invalidate(name: string) {
    cache.delete(name);
  },
};
