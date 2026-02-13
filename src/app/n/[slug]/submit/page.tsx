"use client";

import { useState, useEffect, useLayoutEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { CommunityService } from "@/services/community";
import { PostsService } from "@/services/posts";
import { ICommunity } from "@/types/types";
import { ROUTES } from "@/lib/routes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Info, HelpCircle } from "lucide-react";
import { toast } from "sonner";
import { ImageUploader } from "@/app/components/ImageUploader";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { LoadingSpinner } from "@/app/components/LoadingSpinner";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const RulesContent = () => (
  <div className="space-y-4">
    <Card className="rounded-2xl border-2 shadow-sm border-none md:border-solid shadow-none md:shadow-sm">
      <CardHeader className="pb-3 flex-row items-center gap-2 space-y-0 font-bold px-0 md:px-6">
        <div className="h-6 w-1 bg-primary rounded-full" />
        Правила платформы
      </CardHeader>
      <CardContent className="text-sm space-y-4 text-muted-foreground px-0 md:px-6">
        <div className="flex gap-3">
          <span className="font-bold text-foreground">1.</span>
          <p>Будьте вежливы и уважайте других участников.</p>
        </div>
        <div className="flex gap-3 border-t pt-3 md:border-t">
          <span className="font-bold text-foreground">2.</span>
          <p>Не используйте кликбейтные заголовки.</p>
        </div>
      </CardContent>
    </Card>

    <div className="p-4 bg-muted/30 rounded-2xl flex gap-3 text-xs text-muted-foreground border">
      <Info className="h-4 w-4 shrink-0" />
      <p>Ваш пост будет доступен сразу после публикации.</p>
    </div>
  </div>
);

export default function CreatePostPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const slug = params.slug as string;

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [selectedCommunity, setSelectedCommunity] = useState<string>("");
  const [communities, setCommunities] = useState<ICommunity[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useLayoutEffect(() => {
    const initData = async () => {
      try {
        const allCommunities = await CommunityService.getAllCommunities();
        setCommunities(allCommunities);

        if (slug) {
          const target = allCommunities.find(
            (c) => c.name.toLowerCase() === slug.toLowerCase(),
          );

          if (target) {
            setSelectedCommunity(target.id!);
          }
        }
      } catch (err) {
        console.error("Ошибка инициализации:", err);
      }
    };

    initData();
  }, [slug]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedCommunity || !title.trim()) return;

    setIsLoading(true);
    try {
      const community = communities.find((c) => c.id === selectedCommunity);

      const postId = await PostsService.createPost({
        title: title.trim(),
        content: content.trim(),
        communityId: selectedCommunity,
        communityName: community?.name || "unknown",
        authorId: user.uid,
        authorName: user.displayName || user.email?.split("@")[0] || "User",
        authorImage: user.photoURL || "",
        imageUrl: imageUrl.trim() || undefined,
      });

      router.push(ROUTES.POST(selectedCommunity, postId));
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error("Не удалось создать пост. Попробуйте снова.");
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading) return <LoadingSpinner />;

  if (!user) {
    router.push(`${ROUTES.AUTH}?mode=login`);
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto py-10 px-4 grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-8">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">
            Создать публикацию
          </h1>

          <div className="lg:hidden">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="rounded-full shrink-0"
                >
                  <HelpCircle className="h-5 w-5 text-muted-foreground" />
                </Button>
              </PopoverTrigger>
              <PopoverContent
                align="end"
                className="w-[calc(100vw-2rem)] sm:w-80 p-6 rounded-2xl shadow-2xl border-2"
              >
                <RulesContent />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 flex flex-col">
          <Select
            value={selectedCommunity}
            onValueChange={setSelectedCommunity}
          >
            <SelectTrigger>
              <SelectValue placeholder="Выберите сообщество" />
            </SelectTrigger>
            <SelectContent position="popper">
              {communities.map((c) => (
                <SelectItem key={c.id} value={c.id!} className="flex">
                  <Avatar className="h-4 w-4 border">
                    <AvatarImage src={c.avatarUrl} />
                    <AvatarFallback className="bg-muted">
                      {c.name[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  n/{c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Card className="rounded-2xl border-2 overflow-hidden shadow-sm">
            <CardContent className="p-6 space-y-6">
              <div className="space-y-2">
                <Input
                  placeholder="Заголовок"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className={cn(
                    "text-lg md:text-xl h-auto py-4 font-extrabold transition-all",
                    "border-2 border-transparent hover:border-border focus-visible:border-primary focus-visible:ring-0 px-4 rounded-xl bg-transparent",
                    "placeholder:text-muted-foreground/30 tracking-tight",
                  )}
                  maxLength={300}
                />
                <div className="flex justify-between items-center px-1">
                  <div className="h-px bg-linear-to-r from-primary/50 to-transparent flex-1 mr-4" />
                  <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest opacity-60">
                    {title.length} / 300
                  </p>
                </div>
              </div>

              <div className="py-2">
                <ImageUploader
                  url={imageUrl}
                  onChange={setImageUrl}
                  variant="compact"
                />
              </div>

              <Textarea
                placeholder="Расскажите подробнее..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className={cn(
                  "resize-none h-80 w-full text-lg p-4 rounded-xl border-2",
                  "focus-visible:ring-0 focus-visible:border-primary transition-all",
                  "bg-muted/5 placeholder:text-muted-foreground/50",
                  "overflow-y-auto wrap-break-word",
                )}
              />
            </CardContent>
          </Card>

          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="ghost"
              className="rounded-full"
              onClick={() => router.back()}
              disabled={isLoading}
            >
              Отмена
            </Button>
            <Button
              type="submit"
              className="rounded-full px-10 font-bold"
              disabled={isLoading || !selectedCommunity || !title.trim()}
            >
              {isLoading ? (
                <>
                  <LoadingSpinner description="Публикации..." />
                </>
              ) : (
                "Опубликовать"
              )}
            </Button>
          </div>
        </form>
      </div>

      <aside className="hidden lg:block space-y-4">
        <RulesContent />
      </aside>
    </div>
  );
}
