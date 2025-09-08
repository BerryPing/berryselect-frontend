// src/types/transaction.d.ts

/**
 * 거래 상세 응답 타입 (백엔드 TransactionDetailResponse 대응)
 */
export interface TransactionDetailResponse {
    id: string;
    storeName: string;           // 상호명
    amount: number;              // 거래 금액
    cardCompany: string;         // 카드사
    category: string;            // 카테고리명
    categoryId: number;          // 카테고리 ID
    reward: number;              // 적립/혜택 금액
    txTime: string;              // 거래 시간 (ISO string)
    cardName?: string;           // 카드명 (선택사항)
    merchantCode?: string;       // 가맹점 코드 (선택사항)
}

/**
 * 페이징 응답 타입 (Spring Page 대응)
 */
export interface PageResponse<T> {
    content: T[];                // 실제 데이터 배열
    pageable: {
        pageNumber: number;        // 현재 페이지 번호 (0부터 시작)
        pageSize: number;          // 페이지 크기
        sort: {
            empty: boolean;
            sorted: boolean;
            unsorted: boolean;
        };
        offset: number;
        unpaged: boolean;
        paged: boolean;
    };
    totalPages: number;          // 전체 페이지 수
    totalElements: number;       // 전체 요소 수
    last: boolean;               // 마지막 페이지 여부
    first: boolean;              // 첫 번째 페이지 여부
    numberOfElements: number;    // 현재 페이지 요소 수
    size: number;                // 페이지 크기
    number: number;              // 현재 페이지 번호
    sort: {
        empty: boolean;
        sorted: boolean;
        unsorted: boolean;
    };
    empty: boolean;              // 빈 페이지 여부
}

/**
 * 거래 조회 요청 파라미터 (JWT 인증 적용 - userId 제거됨)
 */
export interface TransactionListParams {
    yearMonth?: string;          // YYYY-MM 형식
    categoryId?: number;
    page?: number;               // 기본값: 0
    size?: number;               // 기본값: 20
    sort?: string;               // 기본값: 'txTime'
}

/**
 * 프론트엔드에서 사용하는 간소화된 거래 타입
 */
export interface Transaction {
    id: string;
    storeName: string;
    amount: number;
    cardCompany: string;
    category: string;
    reward: number;
    txTime?: Date;
}

/**
 * 거래 통계 타입
 */
export interface TransactionStats {
    recommendationUsageRate: number;  // 추천 사용률 (0.0 ~ 1.0)
    totalSavedAmount: number;         // 총 절약금액
}

/**
 * JWT 토큰 관련 타입
 */
export interface AuthToken {
    accessToken: string;
    refreshToken?: string;
    tokenType?: string;
    expiresIn?: number;
}

/**
 * API 에러 응답 타입
 */
export interface ApiErrorResponse {
    status: number;
    message: string;
    timestamp: string;
    path?: string;
}