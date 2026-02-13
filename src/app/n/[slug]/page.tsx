"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Loader2, Plus, Settings, Users } from "lucide-react";
import { CommunityService } from "@/services/community";
import { ICommunity, IPost } from "@/types/types";
import PostList from "@/app/components/Posts/PostList";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { CreateCommunityModal } from "@/app/components/Communities/CreateCommunityModal";
import { PostsService } from "@/services/posts";
import { ROUTES } from "@/lib/routes";

export default function CommunityPage() {
  const { slug } = useParams();
  const router = useRouter();
  const { user } = useAuth();

  const [community, setCommunity] = useState<ICommunity | null>(null);
  const [loading, setLoading] = useState(true);
  const [postsLoading, setPostsLoading] = useState(false);
  const [posts, setPosts] = useState<IPost[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const isSubscribed = user && community?.subscribers?.includes(user.uid);
  const isOwner = user?.uid === community?.creatorId;

  useEffect(() => {
    const fetchData = async () => {
      if (!slug) return;
      setLoading(true);
      setPostsLoading(true);
      try {
        const communityData = await CommunityService.getCommunityData(
          slug as string,
        );
        setCommunity(communityData);

        if (communityData?.id) {
          const communityPosts = await PostsService.getCommunityPosts(
            communityData.id,
          );
          setPosts(communityPosts);
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

  const handleJoinLeave = async () => {
    if (!user) {
      toast.error("Войдите в аккаунт");
      return;
    }
    if (!community) return;
    setSubmitting(true);
    try {
      await CommunityService.toggleSubscription(
        community.id!,
        user.uid,
        !!isSubscribed,
      );
      setCommunity((prev) => {
        if (!prev) return null;
        const isSub = prev.subscribers.includes(user.uid);
        return {
          ...prev,
          subscribers: isSub
            ? prev.subscribers.filter((id) => id !== user.uid)
            : [...prev.subscribers, user.uid],
          membersCount: isSub ? prev.membersCount - 1 : prev.membersCount + 1,
        };
      });
      toast.success(isSubscribed ? "Вы вышли" : "Вы вступили!");
    } catch (e) {
      toast.error("Ошибка обновления подписки");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreatePostRedirect = () => {
    if (community) {
      router.push(ROUTES.CREATE_POST(community.name));
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );

  if (!community)
    return <div className="p-20 text-center">Сообщество не найдено</div>;

  return (
    <div className="flex flex-col w-full min-h-screen bg-muted/20">
      <CreateCommunityModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        initialData={community}
      />

      <div className="relative w-full overflow-hidden border-b bg-muted shadow-sm">
        <div className="absolute inset-0 w-full h-full">
          {community.bannerUrl ? (
            <img
              src={community.bannerUrl}
              className="w-full h-full object-cover"
              alt="banner"
            />
          ) : (
            <div className="w-full h-full bg-linear-to-r from-slate-800 to-slate-900" />
          )}
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />
        </div>

        <div className="relative max-w-5xl mx-auto px-4 pt-20 pb-8 sm:pt-32 sm:pb-10">
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6 text-white text-center sm:text-left">
            <Avatar className="h-32 w-32 sm:h-40 sm:w-40 border-4 border-background shadow-2xl rounded-full shrink-0">
              <AvatarImage src={community.avatarUrl} className="object-cover" />
              <AvatarFallback className="text-4xl font-black bg-primary">
                {community.name[0].toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <div className="flex flex-col sm:flex-row justify-between w-full gap-6">
              <div className="space-y-2">
                <h1 className="text-3xl sm:text-5xl font-black tracking-tighter">
                  n/{community.name}
                </h1>
                <div className="flex items-center justify-center sm:justify-start gap-4 text-white/80 font-semibold">
                  <div className="flex items-center gap-1.5">
                    <Users className="h-5 w-5" />
                    <span>
                      {community.membersCount.toLocaleString()} участников
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 self-center sm:self-end pt-2">
                {isOwner && (
                  <Button
                    variant="outline"
                    onClick={() => setIsEditModalOpen(true)}
                    className="cursor-pointer rounded-full font-bold gap-2 bg-white/10 hover:bg-white text-white hover:text-black border-white/20 backdrop-blur-md"
                  >
                    <Settings className="h-5 w-5" /> Настроить
                  </Button>
                )}

                {user && (
                  <Button
                    onClick={handleCreatePostRedirect}
                    variant="secondary"
                    className="cursor-pointer rounded-full font-bold gap-2 bg-white/10 hover:bg-white/20 text-white border-white/20 backdrop-blur-md"
                  >
                    <Plus className="h-5 w-5" /> Создать пост
                  </Button>
                )}

                <Button
                  onClick={handleJoinLeave}
                  disabled={submitting}
                  className={`cursor-pointer rounded-full font-bold px-10 transition-all ${
                    isSubscribed
                      ? "bg-emerald-500/20 border-2 border-emerald-500/50 text-emerald-400 hover:bg-emerald-500 hover:text-white"
                      : "bg-primary text-white hover:opacity-90"
                  }`}
                >
                  {submitting ? (
                    <Loader2 className="h-5 w-4 animate-spin" />
                  ) : isSubscribed ? (
                    "Следите"
                  ) : (
                    "Вступить"
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-center flex-col max-w-5xl mx-auto px-4 py-8 w-full">
        <div className="max-w-2xl mx-auto">
          <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground/70 mb-4">
            Лента сообщества
          </h3>
        </div>
        <PostList posts={posts} isLoading={postsLoading} />
      </div>
    </div>
  );
}
