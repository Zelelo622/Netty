"use client";

import { MessageCircle, UserPlus, Calendar, Pencil } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

import { MascotAvatar } from "@/components/MascotAvatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/context/AuthContext";
import { ROUTES } from "@/lib/routes";
import { IUserProfile, UsersService } from "@/services/users.service";
import { isMascotURL, mascotURLToConfig, DEFAULT_MASCOT_CONFIG } from "@/types/mascot";

function ProfileSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <div className="h-40 sm:h-52 w-full bg-muted animate-pulse" />
      <div className="max-w-2xl mx-auto px-4 sm:px-6 -mt-14">
        <div className="flex items-end justify-between mb-5">
          <Skeleton className="w-28 h-28 sm:w-36 sm:h-36 rounded-2xl shadow-xl" />
          <div className="hidden sm:flex gap-2 pb-1">
            <Skeleton className="h-10 w-28 rounded-xl" />
            <Skeleton className="h-10 w-28 rounded-xl" />
          </div>
        </div>
        <Skeleton className="h-8 w-52 rounded-lg mb-2" />
        <Skeleton className="h-4 w-32 rounded-lg mb-6" />
        <Skeleton className="h-px w-full mb-8" />
        <Skeleton className="h-44 w-full rounded-2xl" />
      </div>
    </div>
  );
}

function ProfileNotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center text-center px-4">
      <div className="space-y-4">
        <div className="text-6xl">👤</div>
        <h2 className="text-2xl font-black text-foreground">Такого пользователя нет</h2>
        <p className="text-sm text-muted-foreground max-w-xs mx-auto leading-relaxed">
          Возможно, аккаунт был удалён или ссылка неверна
        </p>
      </div>
    </div>
  );
}

export default function UserProfilePage() {
  const { username } = useParams<{ username: string }>();
  const { user: currentUser } = useAuth();

  const [profile, setProfile] = useState<IUserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!username) return;
    setLoading(true);
    UsersService.getProfileByUsername(username)
      .then((data) => {
        if (!data) setNotFound(true);
        else setProfile(data);
      })
      .finally(() => setLoading(false));
  }, [username]);

  if (loading) return <ProfileSkeleton />;
  if (notFound || !profile) return <ProfileNotFound />;

  const isOwnProfile = currentUser?.uid === profile.uid;

  const mascotConfig = isMascotURL(profile.photoURL)
    ? mascotURLToConfig(profile.photoURL)
    : DEFAULT_MASCOT_CONFIG;

  const joinedDate = profile.createdAt
    ? profile.createdAt.toDate().toLocaleDateString("ru-RU", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : null;

  return (
    <div className="min-h-screen bg-background">
      <div className="relative h-40 sm:h-52 w-full overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-br from-violet-500/30 via-primary/20 to-sky-500/30" />
        <div className="absolute inset-0 bg-linear-to-t from-background/60 to-transparent" />
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage: "radial-gradient(circle, var(--foreground) 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6">
        <div className="-mt-14 sm:-mt-18 mb-4 flex items-end justify-between">
          <div className="relative">
            <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-2xl border-4 border-background bg-muted shadow-2xl overflow-hidden flex items-center justify-center">
              <MascotAvatar config={mascotConfig} size={144} />
            </div>
            <span className="absolute bottom-2 right-2 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-background shadow-sm" />
          </div>

          {!isOwnProfile && (
            <div className="hidden sm:flex items-center gap-2 pb-1">
              <Button
                variant="outline"
                disabled
                className="gap-2 h-10 rounded-xl text-sm font-semibold opacity-50 cursor-not-allowed"
              >
                <MessageCircle size={15} />
                Написать
              </Button>
              <Button
                disabled
                className="gap-2 h-10 rounded-xl text-sm font-semibold opacity-50 cursor-not-allowed"
              >
                <UserPlus size={15} />
                Добавить
              </Button>
            </div>
          )}
        </div>

        <div className="space-y-1.5 mb-5">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight leading-none">
              {profile.displayName}
            </h1>
            {isOwnProfile && (
              <Link href={ROUTES.SETTINGS} className="p-2 rounded-lg hover:bg-gray-800">
                <Pencil size={16} />
              </Link>
            )}
          </div>

          {joinedDate && (
            <p className="text-sm text-muted-foreground flex items-center gap-1.5">
              <Calendar size={13} />
              На сайте с {joinedDate}
            </p>
          )}
        </div>

        {!isOwnProfile && (
          <div className="flex sm:hidden gap-2 mb-6">
            <Button
              variant="outline"
              disabled
              className="flex-1 gap-2 h-11 rounded-xl font-semibold opacity-50 cursor-not-allowed"
            >
              <MessageCircle size={15} />
              Написать
            </Button>
            <Button
              disabled
              className="flex-1 gap-2 h-11 rounded-xl font-semibold opacity-50 cursor-not-allowed"
            >
              <UserPlus size={15} />
              Добавить
            </Button>
          </div>
        )}

        <div className="border-t border-border/60 mb-8" />

        <div className="pb-16">
          <div className="rounded-2xl border border-dashed border-border bg-muted/20 py-20 flex flex-col items-center gap-3 text-center px-4">
            <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center">
              <MessageCircle size={22} className="text-muted-foreground/40" />
            </div>
            <p className="text-sm font-semibold text-muted-foreground">Пока ничего нет</p>
            <p className="text-xs text-muted-foreground/50 max-w-xs leading-relaxed">
              Здесь будет активность пользователя — посты, комментарии и другое
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
