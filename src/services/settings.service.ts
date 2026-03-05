import { updateProfile, updateEmail, updatePassword, signOut } from "firebase/auth";
import { doc, getDoc, setDoc, deleteDoc, updateDoc } from "firebase/firestore";

import { auth, db } from "@/lib/firebase";
import { UserProfileCache } from "@/lib/userProfileCache";

export const SettingsService = {
  async updatePublicProfile(name: string, photoURL: string) {
    if (!auth.currentUser) throw new Error("No user");

    const trimmedName = name.trim();
    const oldName = auth.currentUser.displayName ?? "";
    const { uid } = auth.currentUser;

    if (trimmedName.toLowerCase() !== oldName.toLowerCase()) {
      const ref = doc(db, "usernames", trimmedName.toLowerCase());
      const snap = await getDoc(ref);

      if (snap.exists() && snap.data().uid !== uid) {
        throw new Error("Это имя уже занято. Придумай другое!");
      }

      const ops: Promise<any>[] = [
        setDoc(doc(db, "usernames", trimmedName.toLowerCase()), {
          uid,
          displayName: trimmedName,
        }),
      ];

      if (oldName) {
        const oldSnap = await getDoc(doc(db, "usernames", oldName.toLowerCase()));
        if (oldSnap.exists() && oldSnap.data().uid === uid) {
          ops.push(deleteDoc(doc(db, "usernames", oldName.toLowerCase())));
        }
      }

      await Promise.all(ops);
    }

    await updateDoc(doc(db, "users", uid), { displayName: trimmedName, photoURL });
    await updateProfile(auth.currentUser, { displayName: trimmedName, photoURL });

    UserProfileCache.invalidate(uid);
  },

  async updateSecurity(email: string, newPassword?: string) {
    if (!auth.currentUser) throw new Error("No user");
    if (email !== auth.currentUser.email) await updateEmail(auth.currentUser, email);
    if (newPassword) await updatePassword(auth.currentUser, newPassword);
  },

  async logout() {
    await signOut(auth);
    await fetch("/api/auth/logout", { method: "POST" });
  },
};
