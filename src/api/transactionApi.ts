// src/api/transactionApi.ts

import api from '@/api/http.ts'; // axios 인스턴스 import
import type {
    TransactionDetailResponse,
    PageResponse,
    TransactionListParams,
    TransactionStats,
    BackendTransactionResponse
} from '@/types/transaction';

// 카테고리명 -> 카테고리 ID 매핑
const categoryNameToId: Record<string, number> = {
    '카페': 1,
    '편의점': 2,
    '교통': 3,
    '쇼핑': 4,
    '음식': 5,
    '기타': 6
};

// 상호명 정리 함수
const cleanStoreName = (merchantName: string): string => {
    // 1. 영어/한글 브랜드명 매핑
    const brandMap: Record<string, string> = {
        'STARBUCKS': '스타벅스',
        'GS25': 'GS25',
        'OLIVEYOUNG': '올리브영',
        'DONGDAEMART': '동대마트'
    };

    // 2. 지점명 패턴 제거 (점, 역점, 로점 등)
    const cleanName = merchantName
        .replace(/\s+점$/, '')          // 끝의 "점" 제거
        .replace(/\s+역점$/, '')        // 끝의 "역점" 제거
        .replace(/\s+로점$/, '')        // 끝의 "로점" 제거
        .replace(/\s+[가-힣]+점$/, ''); // 기타 지점명 패턴 제거

    // 3. 영어 브랜드명을 한글로 변환
    let result = cleanName;
    for (const [english, korean] of Object.entries(brandMap)) {
        // "STARBUCKS 스타벅스" -> "스타벅스"로 변환
        const pattern = new RegExp(`${english}\\s+${korean}`, 'gi');
        result = result.replace(pattern, korean);

        // "GS25 GS25" -> "GS25"로 변환 (중복 제거)
        const duplicatePattern = new RegExp(`${english}\\s+${english}`, 'gi');
        result = result.replace(duplicatePattern, english);
    }

    // 4. 일반적인 중복 단어 제거 (같은 단어가 연속으로 나오는 경우)
    result = result.replace(/(\S+)\s+\1/g, '$1');

    // 5. 여러 공백을 하나로 정리
    result = result.replace(/\s+/g, ' ').trim();

    return result || merchantName; // 정리 실패 시 원본 반환
};

// 백엔드 응답을 프론트엔드 타입으로 변환
const transformTransactionData = (backendData: BackendTransactionResponse): TransactionDetailResponse => {
    return {
        id: backendData.txId.toString(),
        storeName: cleanStoreName(backendData.merchantName),
        amount: backendData.paidAmount,
        cardCompany: backendData.paymentCardName,
        category: backendData.categoryName,
        categoryId: categoryNameToId[backendData.categoryName] || 99, // 매핑되지 않은 카테고리는 기타(99)로
        reward: backendData.totalSavedAmount,
        txTime: backendData.txTime,
        cardName: backendData.paymentCardName,
        merchantCode: undefined // 백엔드에서 제공하지 않음
    };
};

// 백엔드 페이징 응답을 프론트엔드 타입으로 변환
const transformPageResponse = (
    backendPageResponse: PageResponse<BackendTransactionResponse>
): PageResponse<TransactionDetailResponse> => {
    return {
        ...backendPageResponse,
        content: backendPageResponse.content.map(transformTransactionData)
    };
};



// 사용자 거래 내역 조회
export const getUserTransactions = async (
    params: Omit<TransactionListParams, 'userId'> // userId 제거
): Promise<PageResponse<TransactionDetailResponse>> => {
    try {
        const response = await api.get('/transactions/list', {
            params: {
                ...(params.yearMonth && { yearMonth: params.yearMonth }),
                ...(params.categoryId && { categoryId: params.categoryId }),
                ...(params.page !== undefined && { page: params.page }),
                ...(params.size !== undefined && { size: params.size }),
                ...(params.sort && { sort: params.sort }),
            }
        });

        // 백엔드 응답을 프론트엔드 타입으로 변환
        const transformedResponse = transformPageResponse(response.data);
        return transformedResponse;

    } catch (error) {
        console.error('거래 내역 조회 실패:', error);
        throw error;
    }
};

// 월별 추천 사용률 조회
export const getRecommendationUsageRate = async (
    yearMonth: string
): Promise<number> => {
    try {
        const response = await api.get('/transactions/recommendation-rate', {
            params: { yearMonth }
        });

        return response.data;

    } catch (error) {
        console.error('추천 사용률 조회 실패:', error);
        throw error;
    }
};

// 월별 총 절약금액 조회
export const getTotalSavedAmount = async (
    yearMonth: string
): Promise<number> => {
    try {
        const response = await api.get('/transactions/total-saved', {
            params: { yearMonth }
        });

        return response.data;

    } catch (error) {
        console.error('총 절약금액 조회 실패:', error);
        throw error;
    }
};

// 월별 거래 통계 일괄 조회
export const getTransactionStats = async (
    yearMonth: string
): Promise<TransactionStats> => {
    try {
        const [usageRate, savedAmount] = await Promise.all([
            getRecommendationUsageRate(yearMonth),
            getTotalSavedAmount(yearMonth)
        ]);

        return {
            recommendationUsageRate: usageRate,
            totalSavedAmount: savedAmount
        };

    } catch (error) {
        console.error('거래 통계 조회 실패:', error);
        throw error;
    }
};

// 최근 거래 내역 조회
export const getRecentTransactions = async (
    yearMonth?: string,
    limit: number = 5
): Promise<TransactionDetailResponse[]> => {
    try {
        const params: Omit<TransactionListParams, 'userId'> = {
            yearMonth,
            page: 0,
            size: limit,
            sort: 'txTime,desc' // 최신순 정렬
        };

        const result = await getUserTransactions(params);
        return result.content;

    } catch (error) {
        console.error('최근 거래 내역 조회 실패:', error);
        throw error;
    }
};