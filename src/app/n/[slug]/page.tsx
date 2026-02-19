"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { CommunityService } from "@/services/community.service";
import { ICommunity, IPost } from "@/types/types";
import PostList from "@/features/posts/components/PostList";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { PostsService } from "@/services/posts.service";
import { ROUTES } from "@/lib/routes";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { CreateCommunityModal } from "@/features/communities/components/CreateCommunityModal";
import { CommunityHeader } from "@/features/communities/components/CommunityHeader";
import { CommunityActions } from "@/features/communities/components/CommunityActions";
import { DocumentData, QueryDocumentSnapshot } from "firebase/firestore";
import { LoadingListVirtualizer } from "@/components/LoadingListVirtualizer";

export default function CommunityPage() {
  const { slug } = useParams();
  const router = useRouter();
  const { user } = useAuth();

  const [community, setCommunity] = useState<ICommunity | null>(null);
  const [loading, setLoading] = useState(true);
  const [postsLoading, setPostsLoading] = useState(false);
  const [posts, setPosts] = useState<IPost[]>([]);
  const [lastVisible, setLastVisible] =
    useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const observerRef = useRef<HTMLDivElement>(null);

  const isSubscribed = !!(user && community?.subscribers?.includes(user.uid));
  const isOwner = user?.uid === community?.creatorId;

  useEffect(() => {
    if (!hasMore || posts.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isFetchingMore) {
          fetchMorePosts();
        }
      },
      { threshold: 0.1 },
    );

    if (observerRef.current) {
      observer.observe(observerRef.current);
    }

    return () => observer.disconnect();
  }, [hasMore, isFetchingMore, posts.length, lastVisible]);

  useEffect(() => {
    const fetchData = async () => {
      if (!slug) return;
      setLoading(true);
      try {
        const data = await CommunityService.getCommunityData(slug as string);
        setCommunity(data);
        if (data?.id) {
          setPostsLoading(true);
          const result = await PostsService.getCommunityPosts(data.id, 10);
          setPosts(result.posts);
          setLastVisible(result.lastVisible);
          setHasMore(result.posts.length === 10);
        }
      } catch (e) {
        toast.error("Ошибка загрузки данных");
      } finally {
        setLoading(false);
        setPostsLoading(false);
      }
    };
    fetchData();
  }, [slug]);

  const fetchMorePosts = async () => {
    if (!community?.id || !lastVisible || isFetchingMore) return;

    setIsFetchingMore(true);
    try {
      const result = await PostsService.getCommunityPosts(
        community.id,
        10,
        lastVisible,
      );

      setPosts((prev) => [...prev, ...result.posts]);
      setLastVisible(result.lastVisible);
      setHasMore(result.posts.length === 10);
    } catch (e) {
      toast.error("Не удалось загрузить больше постов");
    } finally {
      setIsFetchingMore(false);
    }
  };

  const handleJoinLeave = async () => {
    if (!user || !community) return toast.error("Войдите в аккаунт");
    setSubmitting(true);
    try {
      await CommunityService.toggleSubscription(
        community.id!,
        user.uid,
        isSubscribed,
      );
      setCommunity((prev) => {
        if (!prev) return null;
        const newSubs = isSubscribed
          ? prev.subscribers.filter((id) => id !== user.uid)
          : [...prev.subscribers, user.uid];
        return {
          ...prev,
          subscribers: newSubs,
          membersCount: isSubscribed
            ? prev.membersCount - 1
            : prev.membersCount + 1,
        };
      });
      toast.success(
        isSubscribed ? "Вы покинули сообщество" : "Добро пожаловать!",
      );
    } catch (e) {
      toast.error("Ошибка обновления подписки");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!community)
    return (
      <div className="py-20 text-center font-bold">Сообщество не найдено</div>
    );

  return (
    <div className="flex flex-col w-full min-h-screen bg-muted/20">
      <CreateCommunityModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        initialData={community}
      />

      <CommunityHeader community={community}>
        <CommunityActions
          hasUser={!!user}
          isOwner={isOwner}
          isSubscribed={isSubscribed}
          submitting={submitting}
          onEdit={() => setIsEditModalOpen(true)}
          onCreatePost={() => router.push(ROUTES.CREATE_POST(community.name))}
          onJoinLeave={handleJoinLeave}
        />
      </CommunityHeader>

      <div className="max-w-5xl mx-auto px-4 py-8 w-full flex flex-col items-center">
        <div className="w-full max-w-2xl">
          <h3 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground/50 mb-6">
            Последние публикации
          </h3>
          <PostList posts={posts} isLoading={postsLoading} />
          <div
            ref={observerRef}
            className="h-20 flex items-center justify-center mt-4"
          >
            <LoadingListVirtualizer
              isFetchingMore={isFetchingMore}
              hasMore={hasMore}
              posts={posts}
              textEnd="Вы посмотрели все публикации"
              textLoading="Загружаем посты..."
            />
          </div>
        </div>
      </div>
    </div>
  );
}
