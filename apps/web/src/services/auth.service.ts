import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  sendPasswordResetEmail,
} from "firebase/auth";

import { auth } from "@/lib/firebase";

export const AuthService = {
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
    const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), pass.trim());
    await updateProfile(userCredential.user, { displayName: name });
    return userCredential;
  },

  async resetPassword(email: string) {
    await sendPasswordResetEmail(auth, email.trim());
  },
};
