import { IUserProfile, UsersService } from "@/services/users.service";

interface ICacheEntry {
  profile: IUserProfile;
  fetchedAt: number;
}

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 минут

const cache = new Map<string, ICacheEntry>();
const inFlight = new Map<string, Promise<IUserProfile | null>>();
const pendingBatch = new Set<string>();
let batchTimer: ReturnType<typeof setTimeout> | null = null;
const batchListeners = new Map<string, Set<(profile: IUserProfile | null) => void>>();

function isExpired(entry: ICacheEntry) {
  return Date.now() - entry.fetchedAt > CACHE_TTL_MS;
}

async function flushBatch() {
  batchTimer = null;
  const ids = [...pendingBatch];
  pendingBatch.clear();

  if (!ids.length) return;

  const profiles = await UsersService.getProfilesByIds(ids);

  ids.forEach((uid) => {
    const profile = profiles[uid] ?? null;
    if (profile) {
      cache.set(uid, { profile, fetchedAt: Date.now() });
    }
    inFlight.delete(uid);
    batchListeners.get(uid)?.forEach((cb) => cb(profile));
    batchListeners.delete(uid);
  });
}

export const UserProfileCache = {
  get(uid: string): IUserProfile | null {
    const entry = cache.get(uid);
    if (!entry || isExpired(entry)) return null;
    return entry.profile;
  },

  fetch(uid: string): Promise<IUserProfile | null> {
    const cached = this.get(uid);
    if (cached) return Promise.resolve(cached);

    if (inFlight.has(uid)) return inFlight.get(uid)!;

    const promise = new Promise<IUserProfile | null>((resolve) => {
      if (!batchListeners.has(uid)) batchListeners.set(uid, new Set());
      batchListeners.get(uid)!.add(resolve);
    });

    inFlight.set(uid, promise);
    pendingBatch.add(uid);

    if (!batchTimer) {
      batchTimer = setTimeout(flushBatch, 0);
    }

    return promise;
  },

  invalidate(uid: string) {
    cache.delete(uid);
  },

  set(profile: IUserProfile) {
    cache.set(profile.uid, { profile, fetchedAt: Date.now() });
  },
};
