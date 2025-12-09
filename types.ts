export interface GiftRecommendation {
  name: string;
  reason: string;
  price_range: string;
}

export interface GiftHistoryItem {
  id: string;
  timestamp: number;
  description: string;
  recommendations: GiftRecommendation[];
}

export enum LoadingState {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}