"use client";

import { doc, getDoc, DocumentData, QueryDocumentSnapshot } from "firebase/firestore";
import { Loader2 } from "lucide-react";
import { useEffect, useState, useRef, useCallback } from "react";

import { LoadingListVirtualizer } from "@/components/LoadingListVirtualizer";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { PostsService } from "@/services/posts.service";
import { IPost } from "@/types/types";

import PostList from "../features/posts/components/PostList";
import { TTabType } from "../features/posts/components/types";

export default function Home() {
  const { user, loading: authLoading } = useAuth();

  const [posts, setPosts] = useState<IPost[]>([]);
  const [lastVisible, setLastVisible] = useState<QueryDocumentSnapshot<DocumentData> | undefined>(
    undefined
  );

  const [loading, setLoading] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [activeTab, setActiveTab] = useState<TTabType>("all");

  const observerRef = useRef<HTMLDivElement>(null);

  const fetchPosts = useCallback(
    async (isFirstPage = false) => {
      if (authLoading) return;

      const currentLastVisible = isFirstPage ? undefined : lastVisible;
      if (!isFirstPage && (!hasMore || isFetchingMore)) return;

      if (isFirstPage) {
        setLoading(true);
        setPosts([]);
      } else {
        setIsFetchingMore(true);
      }

      try {
        let result;
        const LIMIT = 10;

        switch (activeTab) {
          case "all":
            result = await PostsService.getAllPosts(LIMIT, currentLastVisible);
            break;
          case "feed": {
            if (!user) {
              result = { posts: [], lastVisible: null };
              break;
            }
            const userDoc = await getDoc(doc(db, "users", user.uid));
            const communityIds = userDoc.data()?.subscribedCommunities || [];
            result =
              communityIds.length > 0
                ? await PostsService.getFeedPosts(communityIds, LIMIT, currentLastVisible)
                : { posts: [], lastVisible: null };
            break;
          }
          case "mine":
            result = user
              ? await PostsService.getUserPosts(user.uid, LIMIT, currentLastVisible)
              : { posts: [], lastVisible: null };
            break;
          default:
            result = { posts: [], lastVisible: null };
        }

        setPosts((prev) => (isFirstPage ? result.posts : [...prev, ...result.posts]));
        setLastVisible(result.lastVisible ?? undefined);
        setHasMore(result.posts.length === LIMIT);
      } catch (error) {
        console.error("Ошибка при загрузке постов:", error);
      } finally {
        setLoading(false);
        setIsFetchingMore(false);
      }
    },
    [user, activeTab, authLoading, lastVisible, hasMore, isFetchingMore]
  );

  useEffect(() => {
    fetchPosts(true);
  }, [activeTab, authLoading]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isFetchingMore && !loading) {
          fetchPosts();
        }
      },
      { threshold: 0.5 }
    );

    if (observerRef.current) observer.observe(observerRef.current);
    return () => observer.disconnect();
  }, [fetchPosts, hasMore, isFetchingMore, loading]);

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-6 px-4">
      <Tabs
        defaultValue="all"
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as TTabType)}
        className="mb-8"
      >
        <TabsList className="bg-transparent border-b border-border w-full justify-start rounded-none h-auto p-0 gap-6">
          <TabsTrigger
            value="all"
            className="cursor-pointer rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-1 pb-2 shadow-none"
          >
            Все посты
          </TabsTrigger>
          <TabsTrigger
            value="feed"
            className="cursor-pointer rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-1 pb-2 shadow-none"
          >
            Подписки
          </TabsTrigger>
          <TabsTrigger
            value="mine"
            className="cursor-pointer rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-1 pb-2 shadow-none"
          >
            Мои посты
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <PostList posts={posts} isLoading={loading} activeTab={activeTab} isAuth={!!user} />

      <div ref={observerRef} className="py-10 flex justify-center w-full">
        <LoadingListVirtualizer
          isFetchingMore={isFetchingMore}
          hasMore={hasMore}
          posts={posts}
          textEnd="Вы посмотрели все публикации"
          textLoading="Загружаем посты..."
        />
      </div>
    </div>
  );
}
