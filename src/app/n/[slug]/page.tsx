"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Check, Loader2, Plus, Users } from "lucide-react";
import { CommunityService } from "@/services/community";
import { ICommunity } from "@/types/types";
import { MOCK_POSTS } from "@/lib/mock-data";
import PostList from "@/app/components/Posts/PostList";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

export default function CommunityPage() {
  const { slug } = useParams();
  const { user } = useAuth();
  const [community, setCommunity] = useState<ICommunity | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const isSubscribed = user && community?.subscribers?.includes(user.uid);

  useEffect(() => {
    const fetchCommunity = async () => {
      if (!slug) return;
      setLoading(true);
      try {
        const data = await CommunityService.getCommunityData(slug as string);
        setCommunity(data);
      } catch (e) {
        console.error("Ошибка при загрузке:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchCommunity();
  }, [slug]);

  const handleJoinLeave = async () => {
    if (!user) {
      toast.error("Войдите в аккаунт, чтобы вступать в сообщества");
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
        const newSubscribers = isSubscribed
          ? prev.subscribers.filter((id) => id !== user.uid)
          : [...prev.subscribers, user.uid];

        return {
          ...prev,
          subscribers: newSubscribers,
          membersCount: isSubscribed
            ? prev.membersCount - 1
            : prev.membersCount + 1,
        };
      });

      toast.success(
        isSubscribed ? "Вы вышли из сообщества" : "Вы вступили в сообщество!",
      );
    } catch (e) {
      toast.error("Не удалось обновить подписку");
    } finally {
      setSubmitting(false);
    }
  };

  const communityPosts = MOCK_POSTS.filter((p) => p.community === slug);

  if (loading)
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );

  if (!community)
    return (
      <div className="p-20 text-center text-muted-foreground font-medium">
        Сообщество n/{slug} не найдено
      </div>
    );

  return (
    <div className="flex flex-col w-full min-h-screen bg-muted/20">
      <div className="relative w-full overflow-hidden border-b bg-muted shadow-sm">
        <div className="absolute inset-0 w-full h-full">
          {community.bannerUrl ? (
            <img
              src={community.bannerUrl}
              className="w-full h-full object-cover"
              alt="banner"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-orange-500 via-red-500 to-pink-600" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent backdrop-blur-[2px]" />
        </div>

        <div className="relative max-w-5xl mx-auto px-4 pt-20 pb-8 sm:pt-32 sm:pb-10">
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6 text-white text-center sm:text-left">
            <Avatar className="h-32 w-32 sm:h-40 sm:w-40 border-4 border-white/20 shadow-2xl rounded-full shrink-0">
              <AvatarImage src={community.avatarUrl} className="object-cover" />
              <AvatarFallback className="text-4xl font-black bg-primary text-primary-foreground">
                {community.name[0].toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <div className="flex flex-col sm:flex-row justify-between w-full gap-6">
              <div className="space-y-2 drop-shadow-md">
                <h1 className="text-3xl sm:text-5xl font-black tracking-tighter">
                  n/{community.name}
                </h1>
                {community.description && (
                  <p className="max-w-xl text-white/90 text-sm sm:text-lg leading-snug line-clamp-2 font-medium">
                    {community.description}
                  </p>
                )}
                <div className="flex items-center justify-center sm:justify-start gap-4 pt-1 text-sm text-white/80 font-semibold">
                  <div className="flex items-center gap-1.5">
                    <Users className="h-5 w-5" />
                    <span>
                      {community.membersCount.toLocaleString()} участников
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 self-center sm:self-end pt-2">
                {user && (
                  <Button
                    variant="secondary"
                    className="cursor-pointer rounded-full font-bold gap-2 bg-white/10 hover:bg-white/20 text-white border-white/20 backdrop-blur-md"
                  >
                    <Plus className="h-5 w-5" />
                    Создать пост
                  </Button>
                )}

                <Button
                  onClick={handleJoinLeave}
                  disabled={submitting}
                  variant="ghost"
                  className={`cursor-pointer rounded-full font-bold px-10 shadow-xl transition-all duration-300 ${
                    isSubscribed
                      ? "bg-emerald-500/20 border-2 border-emerald-500/50 text-emerald-400 hover:bg-emerald-500 hover:text-white"
                      : "bg-primary border-none text-white hover:opacity-90"
                  }`}
                >
                  {submitting ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : isSubscribed ? (
                    <span className="flex items-center gap-2">
                      <Check className="h-5 w-5 font-black" /> Следите
                    </span>
                  ) : (
                    "Вступить"
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8 w-full flex justify-center">
        <div className="max-w-2xl mx-auto md:mx-0">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground/70">
              Лента сообщества
            </h3>
          </div>
          <div className="items-center w-full">
            <PostList posts={communityPosts} isLoading={false} />
          </div>
        </div>
      </div>
    </div>
  );
}
