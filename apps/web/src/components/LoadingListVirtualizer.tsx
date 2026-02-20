import { IPost } from "@repo/types";
import { Loader2 } from "lucide-react";

interface ILoadingListVirtualizerProps {
  isFetchingMore: boolean;
  hasMore: boolean;
  posts: IPost[];
  textEnd?: string;
  textLoading?: string;
}

export const LoadingListVirtualizer = ({
  isFetchingMore,
  hasMore,
  posts,
  textEnd,
  textLoading,
}: ILoadingListVirtualizerProps) => {
  return (
    <>
      {isFetchingMore ? (
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <span className="text-[10px] text-muted-foreground animate-pulse">
            {textLoading || "ЗАГРУЗКА..."}
          </span>
        </div>
      ) : !hasMore && posts.length > 0 ? (
        <p className="text-center text-[10px] text-muted-foreground/40 uppercase tracking-[0.3em]">
          {textEnd || "Вы просмотрели все публикации"}
        </p>
      ) : null}
    </>
  );
};
