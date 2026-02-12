"use client";

import { IPostListProps } from "./types";
import { MaskotIcon } from "../Icons/MaskotIcon";
import { PostCard } from "./PostCard";

const PostList = ({ posts, isLoading }: IPostListProps) => {
  if (isLoading) {
    return (
      <div className="flex flex-col gap-4 w-full max-w-2xl mx-auto py-10 items-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <p className="text-sm text-muted-foreground animate-pulse">
          Ищем посты...
        </p>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
        <MaskotIcon className="h-20 w-auto opacity-20 grayscale" />
        <div className="px-6">
          <h3 className="text-xl font-bold">Здесь пока пусто</h3>
          <p className="text-muted-foreground text-sm">
            Стань легендой — создай первый пост!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 w-full max-w-2xl mx-auto py-6 px-4 sm:px-0">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
};

export default PostList;
