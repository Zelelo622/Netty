import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  sendPasswordResetEmail,
} from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";

import { auth, db } from "@/lib/firebase";

export const AuthService = {
  async isNameTaken(name: string): Promise<boolean> {
    const ref = doc(db, "usernames", name.trim().toLowerCase());
    const snap = await getDoc(ref);
    return snap.exists();
  },

  async login(email: string, pass: string) {
    const userCredential = await signInWithEmailAndPassword(auth, email.trim(), pass.trim());
    const token = await userCredential.user.getIdToken();

    await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    });
    return userCredential;
  },

  async register(email: string, pass: string, name: string) {
    const trimmedName = name.trim();

    if (await this.isNameTaken(trimmedName)) {
      throw new Error("Это имя уже занято. Придумай другое!");
    }

    const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), pass.trim());
    const { uid } = userCredential.user;

    await Promise.all([
      updateProfile(userCredential.user, { displayName: trimmedName }),
      setDoc(doc(db, "usernames", trimmedName.toLowerCase()), {
        uid,
        displayName: trimmedName,
      }),

      setDoc(doc(db, "users", uid), {
        displayName: trimmedName,
        photoURL: "",
        createdAt: serverTimestamp(),
      }),
    ]);

    return userCredential;
  },

  async resetPassword(email: string) {
    await sendPasswordResetEmail(auth, email.trim());
  },
};
