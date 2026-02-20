"use client";

import { HelpCircle } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { toast } from "sonner";

import { ImageUploader } from "@/components/ImageUploader";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/context/AuthContext";
import { CommunitySelect } from "@/features/communities/components/CommunitySelect";
import { PostRules } from "@/features/communities/components/PostRules";
import { FlairSelect } from "@/features/posts/components/FlairSelect";
import { ROUTES } from "@/lib/routes";
import { cn, generateSlug } from "@/lib/utils";
import { CommunityService } from "@/services/community.service";
import { PostsService } from "@/services/posts.service";
import { ICommunity } from "@/types/types";

export default function CreatePostPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { slug } = useParams() as { slug?: string };

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [selectedCommunity, setSelectedCommunity] = useState<string>("");
  const [communities, setCommunities] = useState<ICommunity[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDataFetching, setIsDataFetching] = useState(true);
  const [selectedFlair, setSelectedFlair] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      try {
        const userSubs = await CommunityService.getUserCommunities(user.uid);
        setCommunities(userSubs);
        if (slug) {
          const target = userSubs.find((c) => c.name.toLowerCase() === slug.toLowerCase());
          if (target) {
            setSelectedCommunity(target.id!);
          } else {
            const communityData = await CommunityService.getCommunityData(slug);
            if (communityData) {
              setCommunities((prev) => [...prev, communityData]);
              setSelectedCommunity(communityData.id!);
            }
          }
        }
      } catch (_error) {
        toast.error("Ошибка при загрузке сообществ");
      } finally {
        setIsDataFetching(false);
      }
    };

    fetchData();
  }, [user, slug]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedCommunity || !title.trim()) return;

    setIsLoading(true);
    try {
      const community = communities.find((c) => c.id === selectedCommunity);
      const postSlug = `${generateSlug(title)}-${Math.random().toString(36).substring(2, 8)}`;

      await PostsService.createPost({
        title: title.trim(),
        slug: postSlug,
        content: content.trim(),
        communityId: selectedCommunity,
        communityName: community?.name || "unknown",
        authorId: user.uid,
        authorName: user.displayName || "User",
        authorImage: user.photoURL || "",
        imageUrl: imageUrl.trim() || undefined,
        tags: selectedFlair ? [selectedFlair] : [],
      });

      router.push(ROUTES.POST(community?.name || selectedCommunity, postSlug));
    } catch (_error) {
      toast.error("Не удалось создать пост");
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
      <div className="space-y-6 min-w-0">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Создать публикацию</h1>

          <div className="lg:hidden">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="icon" className="rounded-full shrink-0">
                  <HelpCircle className="h-5 w-5 text-muted-foreground" />
                </Button>
              </PopoverTrigger>
              <PopoverContent
                align="end"
                className="w-[calc(100vw-2rem)] sm:w-80 p-6 rounded-2xl shadow-2xl border-2"
              >
                <PostRules />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 flex flex-col">
          <CommunitySelect
            communities={communities}
            selectedId={selectedCommunity}
            onSelect={setSelectedCommunity}
            isLoading={isDataFetching}
          />

          <Card className="rounded-2xl border-2 overflow-hidden">
            <CardContent className="p-4 md:p-6 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest ml-1">
                  Выберите флаер (необязательно)
                </label>
                <FlairSelect selectedFlairId={selectedFlair} onSelect={setSelectedFlair} />
                <Input
                  placeholder="Заголовок"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className={cn(
                    "text-lg md:text-xl h-auto py-4 font-extrabold transition-all",
                    "border-2 border-transparent hover:border-border focus-visible:border-primary focus-visible:ring-0 px-4 rounded-xl bg-transparent",
                    "placeholder:text-muted-foreground/30 tracking-tight"
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
                <ImageUploader url={imageUrl} onChange={setImageUrl} variant="compact" />
              </div>

              <Textarea
                placeholder="Текст поста (необязательно)..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className={cn(
                  "resize-none w-full p-4",
                  "min-h-[150px] max-h-[300px]",
                  "bg-muted/20 border-none focus-visible:ring-1 focus-visible:ring-primary rounded-xl",
                  "overflow-y-auto whitespace-pre-wrap wrap-break-word",
                  "field-sizing-content"
                )}
              />
            </CardContent>
          </Card>

          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="ghost"
              className="rounded-full cursor-pointer"
              onClick={() => router.back()}
            >
              Отмена
            </Button>
            <Button
              type="submit"
              className="rounded-full px-10 font-bold cursor-pointer"
              disabled={isLoading || !selectedCommunity || !title.trim()}
            >
              {isLoading ? "Публикую..." : "Опубликовать"}
            </Button>
          </div>
        </form>
      </div>

      <aside className="hidden lg:block">
        <PostRules />
      </aside>
    </div>
  );
}
