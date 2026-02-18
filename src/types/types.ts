export interface ICommunity {
  id?: string;
  name: string;
  description: string;
  creatorId: string;
  createdAt: any;
  membersCount: number;
  subscribers: string[];
  avatarUrl?: string;
  bannerUrl?: string;
}

export interface IPost {
  id: string;
  slug: string;
  title: string;
  content: string;
  communityId: string;
  communityName: string;
  authorId: string;
  authorName: string;
  authorImage?: string;
  createdAt: any;

  votes: number;
  commentsCount: number;

  imageUrl?: string;
  tags?: string[];
}
