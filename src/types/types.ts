export interface ICommunity {
  id?: string;
  name: string;
  title: string;
  creatorId: string;
  createdAt: any;
  membersCount: number;
  subscribers: string[];
  imgUrl?: string;
}
