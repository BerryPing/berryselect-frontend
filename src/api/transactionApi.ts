// src/api/transactionApi.ts

import api from '@/api/http.ts'; // axios 인스턴스 import
import type {
    TransactionDetailResponse,
    PageResponse,
    TransactionListParams,
    TransactionStats
} from '@/types/transaction';

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

        return response.data;

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