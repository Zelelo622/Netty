"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Search, Users, Loader2 } from "lucide-react";
import Link from "next/link";
import { ROUTES } from "@/lib/routes";
import { ICommunity } from "@/types/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CommunityService } from "@/services/community";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

export default function AllCommunitiesPage() {
  const { user } = useAuth();
  const [communities, setCommunities] = useState<ICommunity[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [submittingId, setSubmittingId] = useState<string | null>(null);

  useEffect(() => {
    CommunityService.getAllCommunities()
      .then(setCommunities)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filteredCommunities = communities.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.title.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleSubscribe = async (
    e: React.MouseEvent,
    community: ICommunity,
  ) => {
    e.preventDefault();
    if (!user) {
      toast.info("Войдите, чтобы подписываться на сообщества");
      return;
    }

    const isSubscribed = community.subscribers.includes(user.uid);
    setSubmittingId(community.id!);

    try {
      await CommunityService.toggleSubscription(
        community.id!,
        user.uid,
        isSubscribed,
      );

      setCommunities((prev) =>
        prev.map((c) => {
          if (c.id === community.id) {
            return {
              ...c,
              subscribers: isSubscribed
                ? c.subscribers.filter((id) => id !== user.uid)
                : [...c.subscribers, user.uid],
              membersCount: isSubscribed
                ? c.membersCount - 1
                : c.membersCount + 1,
            };
          }
          return c;
        }),
      );
    } finally {
      setSubmittingId(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Все сообщества</h1>
        <p className="text-muted-foreground">
          Найдите группу по своим интересам
        </p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Поиск сообществ..."
          className="pl-10 h-12"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredCommunities.map((community) => (
            <Link key={community.id} href={ROUTES.COMMUNITY(community.name)}>
              <Card className="hover:border-primary/50 transition-colors cursor-pointer h-full">
                <CardHeader className="flex flex-row items-center gap-4 space-y-0">
                  <Avatar className="h-12 w-12 border shadow-sm">
                    <AvatarImage
                      src={community.imgUrl}
                      alt={community.name}
                      className="object-cover"
                    />
                    <AvatarFallback className="bg-muted text-muted-foreground font-bold uppercase text-lg">
                      {community.name[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <CardTitle className="text-lg">
                      n/{community.name}
                    </CardTitle>
                    <CardDescription className="line-clamp-1">
                      {community.title}
                    </CardDescription>
                    <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                      <Users className="h-3 w-3" />
                      {community.membersCount} участников
                    </div>
                  </div>
                  <Button
                    className="cursor-pointer z-10"
                    variant={
                      community.subscribers.includes(user?.uid || "")
                        ? "secondary"
                        : "outline"
                    }
                    size="sm"
                    disabled={submittingId === community.id}
                    onClick={(e) => handleSubscribe(e, community)}
                  >
                    {submittingId === community.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : community.subscribers.includes(user?.uid || "") ? (
                      "Вы подписаны"
                    ) : (
                      "Подписаться"
                    )}
                  </Button>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {!loading && filteredCommunities.length === 0 && (
        <div className="text-center py-20">
          <p className="text-muted-foreground">Сообщества не найдены :(</p>
        </div>
      )}
    </div>
  );
}
