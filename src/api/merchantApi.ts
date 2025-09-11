import http from './http';

export interface Merchant {
  id: number;
  name: string;
  brandId: number;
  brandName: string;
  categoryId: number;
  categoryName: string;
  address?: string | null;
  lat?: number | null;
  lng?: number | null;
  kakaoPlaceId?: string | null;
  distanceMeters: number;
  distanceText?: string | null;
}

// merchantApi.ts 수정
interface MerchantSearchResponse {
  merchants: Merchant[];
  hasMore: boolean;
  lastId: number | null;
}

export const merchantApi = {
  search: (keyword: string) =>
    http.get<MerchantSearchResponse>('/merchants/search', {
      params: { keyword },
    }),
};
