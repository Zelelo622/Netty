import { IPost } from "@/types/types";

export interface IPostCardProps {
  post: IPost;
}

export type TTabType = "feed" | "all" | "mine";

export interface IPostListProps {
  posts: IPost[];
  isLoading?: boolean;
  activeTab?: TTabType;
  isAuth?: boolean;
}
