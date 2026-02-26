"use client";

import { QueryDocumentSnapshot } from "firebase/firestore";
import { Search, Loader2 } from "lucide-react";
import { useEffect, useState, useMemo, useRef, useCallback } from "react";
import { toast } from "sonner";

import { LoadingSpinner } from "@/components/LoadingSpinner";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthContext";
import { CommunityList } from "@/features/communities/components/CommunityList";
import { CommunityService } from "@/services/community.service";
import { ICommunity } from "@/types/types";

export default function AllCommunitiesPage() {
  const { user } = useAuth();
  const [communities, setCommunities] = useState<ICommunity[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [submittingId, setSubmittingId] = useState<string | null>(null);

  const [lastDoc, setLastDoc] = useState<QueryDocumentSnapshot<ICommunity> | null>(null);
  const [hasMore, setHasMore] = useState(true);

  const observer = useRef<IntersectionObserver | null>(null);
  const lastElementRef = useCallback(
    (node: HTMLDivElement) => {
      if (loading || loadingMore) return;
      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          loadMoreCommunities();
        }
      });

      if (node) observer.current.observe(node);
    },
    [loading, loadingMore, hasMore]
  );

  useEffect(() => {
    loadInitialCommunities();
  }, []);

  const loadInitialCommunities = async () => {
    try {
      setLoading(true);
      const res = await CommunityService.getCommunitiesBatch(10);
      setCommunities(res.communities);
      setLastDoc(res.lastDoc);
      setHasMore(res.hasMore);
    } catch (_error) {
      toast.error("Ошибка загрузки");
    } finally {
      setLoading(false);
    }
  };

  const loadMoreCommunities = async () => {
    if (loadingMore || !hasMore) return;

    try {
      setLoadingMore(true);
      const res = await CommunityService.getCommunitiesBatch(10, lastDoc);

      setCommunities((prev) => [...prev, ...res.communities]);
      setLastDoc(res.lastDoc);
      setHasMore(res.hasMore);
    } catch (_error) {
      toast.error("Не удалось подгрузить еще");
    } finally {
      setLoadingMore(false);
    }
  };

  const filteredCommunities = useMemo(() => {
    const query = searchQuery.toLowerCase();
    return communities.filter(
      (c) => c.name.toLowerCase().includes(query) || c.description.toLowerCase().includes(query)
    );
  }, [communities, searchQuery]);

  const handleToggleSubscription = async (e: React.MouseEvent, community: ICommunity) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      toast.info("Войдите, чтобы подписываться");
      return;
    }

    const isSubscribed = community.subscribers.includes(user.uid);
    setSubmittingId(community.id!);

    try {
      await CommunityService.toggleSubscription(community.id!, user.uid, isSubscribed);
      setCommunities((prev) =>
        prev.map((c) =>
          c.id === community.id
            ? {
                ...c,
                subscribers: isSubscribed
                  ? c.subscribers.filter((id) => id !== user.uid)
                  : [...c.subscribers, user.uid],
                membersCount: isSubscribed ? c.membersCount - 1 : c.membersCount + 1,
              }
            : c
        )
      );
    } catch (_err) {
      toast.error("Ошибка обновления");
    } finally {
      setSubmittingId(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <header className="space-y-2">
        <h1 className="text-3xl tracking-tight text-primary uppercase font-black">Сообщества</h1>
      </header>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Поиск среди загруженных..."
          className="pl-10 h-12"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {loading ? (
        <LoadingSpinner description="Ищем сообщества..." />
      ) : (
        <>
          <CommunityList
            communities={filteredCommunities}
            currentUserId={user?.uid}
            submittingId={submittingId}
            onToggleSubscription={handleToggleSubscription}
          />

          <div ref={lastElementRef} className="h-10 flex justify-center items-center">
            {loadingMore && <Loader2 className="h-6 w-6 animate-spin text-primary" />}
            {!hasMore && communities.length > 0 && (
              <p className="text-xs text-muted-foreground uppercase font-bold tracking-widest">
                Это все сообщества, которые мы нашли
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
