"use client";

import React from "react";

import { MascotAvatar } from "@/components/MascotAvatar";
import { isMascotURL, mascotURLToConfig } from "@/types/mascot";

interface UserAvatarProps {
  photoURL?: string | null;
  displayName?: string | null;
  size?: number;
  className?: string;
}

export const UserAvatar: React.FC<UserAvatarProps> = ({
  photoURL,
  displayName,
  size = 40,
  className,
}) => {
  const url = photoURL ?? "";

  if (isMascotURL(url)) {
    return <MascotAvatar config={mascotURLToConfig(url)} size={size} className={className} />;
  }

  if (url) {
    return (
      <img
        src={url}
        alt={displayName ?? "avatar"}
        width={size}
        height={size}
        className={className}
        style={{ borderRadius: "50%", objectFit: "cover" }}
      />
    );
  }

  const initials = (displayName ?? "?")[0].toUpperCase();
  return (
    <div
      className={className}
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: "#E5E5EA",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontWeight: 900,
        fontSize: size * 0.4,
        color: "#8E8E93",
        userSelect: "none",
      }}
    >
      {initials}
    </div>
  );
};
