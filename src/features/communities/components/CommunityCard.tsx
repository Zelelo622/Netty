"use client";

import { Users, Loader2 } from "lucide-react";
import Link from "next/link";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ROUTES } from "@/lib/routes";
import { ICommunity } from "@/types/types";

interface ICommunityCardProps {
  community: ICommunity;
  isSubscribed: boolean;
  isSubmitting: boolean;
  onToggleSubscription: (e: React.MouseEvent, community: ICommunity) => void;
}

export const CommunityCard = ({
  community,
  isSubscribed,
  isSubmitting,
  onToggleSubscription,
}: ICommunityCardProps) => {
  return (
    <Link href={ROUTES.COMMUNITY(community.name)}>
      <Card className="hover:border-primary/50 transition-colors cursor-pointer h-full group">
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center gap-4 space-y-0 p-4 sm:p-6">
          <div className="flex items-center gap-4 flex-1 min-w-0 w-full">
            <Avatar className="h-12 w-12 border shrink-0 shadow-sm group-hover:scale-105 transition-transform">
              <AvatarImage
                src={community.avatarUrl}
                alt={community.name}
                className="object-cover"
              />
              <AvatarFallback className="bg-muted text-muted-foreground font-bold uppercase text-lg">
                {community.name[0]}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              <CardTitle className="text-lg truncate">n/{community.name}</CardTitle>
              <CardDescription className="line-clamp-1">{community.description}</CardDescription>
              <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                <Users className="h-3 w-3" />
                {community.membersCount} участников
              </div>
            </div>
          </div>

          <Button
            className="w-full sm:w-auto cursor-pointer relative z-20"
            variant={isSubscribed ? "secondary" : "outline"}
            size="sm"
            disabled={isSubmitting}
            onClick={(e) => onToggleSubscription(e, community)}
          >
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : isSubscribed ? (
              "Вы подписаны"
            ) : (
              "Подписаться"
            )}
          </Button>
        </CardHeader>
      </Card>
    </Link>
  );
};
