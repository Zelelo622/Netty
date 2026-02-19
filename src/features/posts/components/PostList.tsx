"use client";

import { IPostListProps } from "./types";
import { MaskotIcon } from "../../../components/icons/MaskotIcon";
import { PostCard } from "./PostCard";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ROUTES } from "@/lib/routes";
import { LoadingSpinner } from "../../../components/LoadingSpinner";
import { useLayoutEffect, useRef, useState } from "react";
import { useWindowVirtualizer } from "@tanstack/react-virtual";

const PostList = ({ posts, isLoading, activeTab, isAuth }: IPostListProps) => {
  const listRef = useRef<HTMLDivElement>(null);
  const [marginTop, setMarginTop] = useState(0);

  useLayoutEffect(() => {
    if (listRef.current) {
      setMarginTop(listRef.current.offsetTop);
    }
  }, [isLoading]);

  const virtualizer = useWindowVirtualizer({
    count: posts.length,
    estimateSize: () => 280,
    scrollMargin: marginTop,
    overscan: 5,
  });

  if (isLoading) {
    return <LoadingSpinner description="Ищем интересное..." />;
  }

  if (!isAuth && (activeTab === "feed" || activeTab === "mine")) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center space-y-6">
        <MaskotIcon className="h-24 w-auto opacity-20 grayscale" />
        <div className="px-6 space-y-4 max-w-sm">
          <h3 className="text-xl font-bold">Нужно войти в систему</h3>
          <p className="text-muted-foreground text-sm">
            Чтобы просматривать{" "}
            {activeTab === "feed" ? "свои подписки" : "свои публикации"},
            необходимо авторизоваться или создать аккаунт.
          </p>
          <div className="flex flex-col gap-2 pt-2">
            <Button asChild className="rounded-full px-10">
              <Link href={`${ROUTES.AUTH}?mode=login`}>Войти</Link>
            </Button>
            <Button asChild variant="ghost">
              <Link href={`${ROUTES.AUTH}?mode=register`}>
                Нет аккаунта? Регистрация
              </Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center space-y-6">
        <MaskotIcon className="h-24 w-auto opacity-10 grayscale" />
        <div className="px-6 space-y-2 max-w-sm">
          <h3 className="text-xl font-bold tracking-tight">
            {activeTab === "feed"
              ? "Ваша лента пуста"
              : "Здесь пока ничего нет"}
          </h3>
          <p className="text-muted-foreground text-sm leading-relaxed">
            {activeTab === "feed" &&
              "Подпишитесь на сообщества, чтобы видеть посты от единомышленников."}
            {activeTab === "mine" &&
              "Вы еще не поделились своими мыслями. Самое время начать!"}
            {activeTab === "all" &&
              "Похоже, в этой вселенной еще никто не создал ни одного поста."}
          </p>
          <div className="pt-4 flex flex-col gap-2 items-center">
            {isAuth && activeTab === "mine" && (
              <Button asChild className="rounded-full px-8">
                <Link href={ROUTES.CREATE_POST("")}>Создать пост</Link>
              </Button>
            )}
            {isAuth && activeTab === "feed" && (
              <Button asChild variant="outline" className="rounded-full">
                <Link href={ROUTES.ALL_COMMUNITIES}>Найти сообщества</Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div ref={listRef} className="w-full max-w-2xl mx-auto py-6 px-4 sm:px-0">
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: "100%",
          position: "relative",
        }}
      >
        {virtualizer.getVirtualItems().map((virtualItem) => (
          <div
            key={virtualItem.key}
            data-index={virtualItem.index}
            ref={virtualizer.measureElement}
            className="absolute top-0 left-0 w-full pb-6"
            style={{
              transform: `translateY(${
                virtualItem.start - virtualizer.options.scrollMargin
              }px)`,
            }}
          >
            <PostCard post={posts[virtualItem.index]} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default PostList;
