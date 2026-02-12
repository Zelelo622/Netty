export interface IPost {
  id: string;
  title: string;
  content: string;
  community: string;
  createdAt: string;
  votes: number;
  commentsCount: number;
  author: {
    id: string;
    name: string;
    image?: string;
  };
  imageUrl?: string;
}

export interface IPostCardProps {
  post: IPost;
}

export interface IPostListProps {
  posts: IPost[];
  isLoading?: boolean;
}
