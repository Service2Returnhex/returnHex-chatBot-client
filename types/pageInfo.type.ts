export type connectionStatus = "stop" | "pending" | "start";

export interface IPageInfo {
  _id: string;
  pageName: string;
  address?: string;
  phone?: string;
  email?: string;
  pageCategory: string;
  shopId?: string;
  ownerId?: string;
  moreInfo?: string;
  summary?: string;
  dmSystemPromt?: string;
  cmntSystemPromt?: string;
  isVerified?: boolean;
  isStarted?: boolean;
  connected: connectionStatus;
  accessToken?: string;
  verifyToken?: string;
  createdAt?: string;
  updatedAt?: string;
}
