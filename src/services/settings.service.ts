import { auth } from "@/lib/firebase";
import {
  updateProfile,
  updateEmail,
  updatePassword,
  signOut,
} from "firebase/auth";

export const SettingsService = {
  async updatePublicProfile(name: string, photoURL: string) {
    if (!auth.currentUser) throw new Error("No user");
    return await updateProfile(auth.currentUser, {
      displayName: name,
      photoURL: photoURL,
    });
  },

  async updateSecurity(email: string, newPassword?: string) {
    if (!auth.currentUser) throw new Error("No user");

    if (email !== auth.currentUser.email) {
      await updateEmail(auth.currentUser, email);
    }

    if (newPassword) {
      await updatePassword(auth.currentUser, newPassword);
    }
  },

  async logout() {
    await signOut(auth);
    await fetch("/api/auth/logout", { method: "POST" });
  },
};
