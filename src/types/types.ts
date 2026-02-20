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
  recipientId: string; // Кому уведомление
  issuerId: string; // От кого (кто лайкнул/тэгнул)
  issuerName: string; // Имя для отображения
  type: "REPLY" | "TAG" | "POST_VOTE" | "COMMENT_VOTE" | "NEW_COMMENT";
  postId: string; // Ссылка на пост, где произошло событие
  commentId?: string; // (Опционально) если это ответ на коммент
  read: boolean; // Прочитано или нет
  createdAt: any;
  communityName: string; // Новое
  postSlug: string; // Новое
}
