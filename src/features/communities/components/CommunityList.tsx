"use client";

import { ICommunity } from "@/types/types";

import { CommunityCard } from "./CommunityCard";
import { useAuth } from "@/context/AuthContext";

interface ICommunityListProps {
  communities: ICommunity[];
  currentUserId?: string;
  submittingId: string | null;
  onToggleSubscription: (e: React.MouseEvent, community: ICommunity) => void;
}

export const CommunityList = ({
  communities,
  currentUserId,
  submittingId,
  onToggleSubscription,
}: ICommunityListProps) => {
  const { user } = useAuth();

  if (communities.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground">Сообщества не найдены :(</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {communities.map((community) => (
        <CommunityCard
          key={community.id}
          community={community}
          isSubscribed={community.subscribers.includes(currentUserId || "")}
          isSubmitting={submittingId === community.id}
          isOwner={user?.uid === community.creatorId}
          onToggleSubscription={onToggleSubscription}
        />
      ))}
    </div>
  );
};
