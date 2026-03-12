import { Timestamp } from "firebase/firestore";

export interface ICommunity {
  id?: string;
  name: string;
  description: string;
  creatorId: string;
  createdAt: Timestamp;
  membersCount: number;
  subscribers: string[];
  avatarUrl?: string;
  bannerUrl?: string;
}

export interface IPost {
  id: string;
  title: string;
  content: string;
  communityId: string;
  communityName: string;
  authorId: string;
  createdAt: Timestamp;
  votes: number;
  commentsCount: number;
  imageUrl?: string;
  tags?: string[];
  updatedAt?: Timestamp;
  isEdited?: boolean;
}

export interface IComment {
  id: string;
  postId: string;
  parentId: string | null;
  authorId: string;
  text: string;
  createdAt: Timestamp;
  votes: number;
  depth: number;
  isEdited?: boolean;
  updatedAt?: Timestamp;
  replies?: IComment[];
}

export interface INotification {
  id: string;
  recipientId: string;
  issuerId: string;
  type: "REPLY" | "POST_VOTE" | "COMMENT_VOTE";
  postId: string;
  commentId?: string;
  read: boolean;
  createdAt: Timestamp;
  communityName: string;
}

export interface IMessage {
  id: string;
  text: string;
  senderId: string;
  createdAt: Timestamp;
  read: boolean;
  reactions?: Record<string, string[]>;
  isPending?: boolean;
  isFailed?: boolean;
}

export interface IConversation {
  id: string;
  participants: [string, string];
  lastMessageAt: Timestamp | null;
  lastMessagePreview: string;
  lastMessageSenderId: string;
  unreadCount: Record<string, number>;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface IChatListItem extends IConversation {
  otherParticipantId: string;
  otherParticipant: {
    displayName: string;
    photoURL: string;
  };
}
