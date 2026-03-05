"use client";

import { User } from "firebase/auth";

import { Label } from "@/components/ui/label";
import { UserAvatar } from "@/components/UserAvatar";

interface IProfilePreviewProps {
  user: User;
}

export const ProfilePreview = ({ user }: IProfilePreviewProps) => {
  return (
    <div className="hidden lg:flex flex-col items-center gap-6 p-6 rounded-2xl bg-muted/30 border border-dashed h-fit sticky top-24">
      <Label className="text-muted-foreground uppercase text-[10px] tracking-widest font-bold">
        Превью
      </Label>

      <UserAvatar photoURL={user.photoURL} displayName={user.displayName} size={200} />

      <div className="text-center space-y-1">
        <p className="font-bold text-sm truncate max-w-50">{user.displayName || "Без имени"}</p>
        <p className="text-[10px] text-muted-foreground truncate max-w-50">{user.email}</p>
      </div>
    </div>
  );
};
