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
