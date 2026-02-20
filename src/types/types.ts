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

  updatedAt?: any;
  isEdited?: boolean;
}

export interface IComment {
  id: string;
  postId: string;
  parentId: string | null;
  authorId: string;
  authorName: string;
  authorImage?: string;
  text: string;
  createdAt: any;
  votes: number;
  depth: number;
  isEdited?: boolean;
  updatedAt?: any;
  replies?: IComment[];
}

export interface INotification {
  id: string;
  recipientId: string;
  issuerId: string;
  issuerName: string;
  type: "REPLY" | "POST_VOTE" | "COMMENT_VOTE";
  postId: string;
  commentId?: string;
  read: boolean;
  createdAt: any;
  communityName: string;
  postSlug: string;
}
