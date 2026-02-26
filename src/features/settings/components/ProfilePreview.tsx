"use client";

import { User } from "firebase/auth";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";

interface IProfilePreviewProps {
  user: User;
}

export const ProfilePreview = ({ user }: IProfilePreviewProps) => {
  return (
    <div className="flex flex-col items-center gap-6 p-6 rounded-2xl bg-muted/30 border border-dashed h-fit sticky top-24">
      <Label className="text-muted-foreground uppercase text-[10px] tracking-widest font-bold">
        Превью
      </Label>

      <Avatar className="h-40 w-40 border-4 border-background shadow-2xl transition-transform hover:scale-105">
        <AvatarImage src={user.photoURL || ""} className="object-cover" />
        <AvatarFallback className="text-4xl bg-primary/10 text-primary font-black">
          {user.displayName?.charAt(0) || "?"}
        </AvatarFallback>
      </Avatar>

      <div className="text-center space-y-1">
        <p className="font-bold text-sm truncate max-w-[200px]">
          {user.displayName || "Без имени"}
        </p>
        <p className="text-[10px] text-muted-foreground truncate max-w-[200px]">{user.email}</p>
      </div>
    </div>
  );
};
