"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { PostsService } from "@/services/posts";
import { IPost } from "@/types/types";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/app/components/LoadingSpinner";
import { Share2, ArrowBigUp, ArrowBigDown, MessageSquare } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ru } from "date-fns/locale";

export default function PostPage() {
  const { postSlug } = useParams();
  const [post, setPost] = useState<IPost | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPostData = async () => {
      if (!postSlug) return;
      try {
        setIsLoading(true);
        const postData = await PostsService.getPostBySlug(postSlug as string);
        setPost(postData);
      } catch (error) {
        console.error("Ошибка при загрузке поста:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPostData();
  }, [postSlug]);

  if (isLoading) return <LoadingSpinner />;
  if (!post) return <div className="text-center py-20">Пост не найден</div>;

  // Безопасное получение даты из Firebase Timestamp или JS Date
  const postDate = post.createdAt?.toDate
    ? post.createdAt.toDate()
    : new Date(post.createdAt);

  return (
    <div className="max-w-4xl mx-auto py-6 px-4 lg:grid-cols-[1fr_300px] gap-6">
      <div className="space-y-4">
        <Card className="rounded-2xl border-2 overflow-hidden shadow-none md:shadow-sm">
          <div className="flex">
            <div className="hidden md:flex flex-col items-center w-12 bg-muted/20 py-4 gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 hover:text-orange-600"
              >
                <ArrowBigUp className="h-6 w-6" />
              </Button>
              <span className="text-xs font-bold">{post.votes || 0}</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 hover:text-blue-600"
              >
                <ArrowBigDown className="h-6 w-6" />
              </Button>
            </div>

            <div className="flex-1">
              <CardHeader className="p-4 flex-row items-center gap-3 space-y-0">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={post.authorImage} />
                  <AvatarFallback>{post.authorName[0]}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <span className="text-sm font-bold">
                    n/{post.communityName}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    Автор: {post.authorName} •{" "}
                    {formatDistanceToNow(postDate, {
                      addSuffix: true,
                      locale: ru,
                    })}
                  </span>
                </div>
              </CardHeader>

              <CardContent className="p-4 pt-0 space-y-4">
                <h1 className="text-2xl font-extrabold tracking-tight">
                  {post.title}
                </h1>

                {post.imageUrl && (
                  <div className="rounded-xl overflow-hidden border">
                    <img
                      src={post.imageUrl}
                      alt={post.title}
                      className="w-full object-cover max-h-[500px]"
                    />
                  </div>
                )}

                <p className="text-foreground/90 whitespace-pre-wrap leading-relaxed">
                  {post.content}
                </p>

                <div className="flex items-center gap-4 pt-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="rounded-full gap-2 text-muted-foreground"
                  >
                    <MessageSquare className="h-4 w-4" />
                    {post.commentsCount || 0} Комментариев
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    className="rounded-full gap-2 text-muted-foreground cursor-pointer"
                  >
                    <Share2 className="h-4 w-4" />
                    Поделиться
                  </Button>
                </div>
              </CardContent>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
