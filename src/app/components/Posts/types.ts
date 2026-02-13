import { IPost } from "@/types/types";

export interface IPostCardProps {
  post: IPost;
}

export interface IPostListProps {
  posts: IPost[];
  isLoading?: boolean;
}
