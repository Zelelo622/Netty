import { doc, getDoc, Timestamp } from "firebase/firestore";

import { db } from "@/lib/firebase";

export interface IUserProfile {
  uid: string;
  displayName: string;
  photoURL: string;
  createdAt: Timestamp | null;
}

export const UsersService = {
  async getProfileByUsername(username: string): Promise<IUserProfile | null> {
    const usernameSnap = await getDoc(doc(db, "usernames", username.toLowerCase()));
    if (!usernameSnap.exists()) return null;

    const { uid } = usernameSnap.data();

    const userSnap = await getDoc(doc(db, "users", uid));
    if (!userSnap.exists()) return null;

    return { uid, ...userSnap.data() } as IUserProfile;
  },

  async getProfileById(uid: string): Promise<IUserProfile | null> {
    const userSnap = await getDoc(doc(db, "users", uid));
    if (!userSnap.exists()) return null;

    return { uid, ...userSnap.data() } as IUserProfile;
  },

  async getProfilesByIds(uids: string[]): Promise<Record<string, IUserProfile>> {
    if (!uids.length) return {};

    const uniqueUids = [...new Set(uids)];
    const snaps = await Promise.all(uniqueUids.map((uid) => getDoc(doc(db, "users", uid))));

    return Object.fromEntries(
      snaps
        .filter((snap) => snap.exists())
        .map((snap) => [snap.id, { uid: snap.id, ...snap.data() } as IUserProfile])
    );
  },
};
