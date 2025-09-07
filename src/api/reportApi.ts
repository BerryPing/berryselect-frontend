// src/api/reportApi.ts

import api from '@/api/http.ts'; // axios 인스턴스 import
import { CATEGORY_COLORS } from '@/constants';
import {
    getUserTransactions,
    getTransactionStats,
    getRecentTransactions
} from './transactionApi';

// 모든 타입을 별도로 type import
import type {
    MonthlyReportData,
    CategorySpendingData,
    AiAnalysisRequest,
    AiAnalysisResponse,
    ReportPageData,
    BackendMonthlyReportResponse
} from '@/types/report';
import type { TransactionDetailResponse } from '@/types/transaction';

/**
 * 거래 내역을 카테고리별로 집계하여 도넛차트 데이터 생성
 */
const aggregateTransactionsByCategory = (
    transactions: TransactionDetailResponse[]
): CategorySpendingData[] => {
    const categoryMap = new Map<string, { total: number; categoryId: number }>();

    transactions.forEach(transaction => {
        const key = transaction.category;
        const existing = categoryMap.get(key);

        if (existing) {
            existing.total += transaction.amount;
        } else {
            categoryMap.set(key, {
                total: transaction.amount,
                categoryId: transaction.categoryId
            });
        }
    });

    const totalSpending = Array.from(categoryMap.values())
        .reduce((sum, item) => sum + item.total, 0);

    const categoryData: CategorySpendingData[] = Array.from(categoryMap.entries())
        .map(([categoryName, data]) => ({
            categoryId: data.categoryId,
            categoryName,
            totalAmount: data.total,
            percentage: totalSpending > 0 ? (data.total / totalSpending) * 100 : 0,
            color: CATEGORY_COLORS[categoryName] || '#666666'
        }))
        .sort((a, b) => b.totalAmount - a.totalAmount);

    return categoryData;
};

/**
 * 백엔드 월별 리포트 API 호출 (새로운 엔드포인트 사용)
 * JWT 인증 및 토큰 갱신은 http.ts의 interceptor에서 자동 처리
 */
export const getMonthlyReportFromBackend = async (
    yearMonth: string
): Promise<BackendMonthlyReportResponse> => {
    try {
        const response = await api.get(`/myberry/reports/${yearMonth}`);
        return response.data;

    } catch (error) {
        console.error('백엔드 월별 리포트 조회 실패:', error);
        throw error;
    }
};

/**
 * 월별 리포트 데이터 조회 (기존 방식 + 백엔드 API 병행)
 * JWT 인증은 http.ts의 interceptor에서 자동 처리
 */
export const getMonthlyReportData = async (
    yearMonth: string
): Promise<MonthlyReportData> => {
    try {
        // 방법 1: 백엔드의 새로운 리포트 API 사용 (추천)
        try {
            const backendReport = await getMonthlyReportFromBackend(yearMonth);

            // 백엔드 응답을 프론트엔드 타입에 맞게 변환
            const result: MonthlyReportData = {
                yearMonth,
                totalSpending: backendReport.totalSpent || 0,
                totalSaved: backendReport.totalSaved || 0,
                recommendationUsageRate: (backendReport.recommendationUsageRate || 0) / 100, // 백엔드가 %로 주면 소수로 변환
                categorySpending: backendReport.categorySpending || [],
                recentTransactions: backendReport.recentTransactions || []
            };
            return result;
        } catch (backendError) {
            console.warn('백엔드 리포트 API 실패, 개별 API 호출로 대체:', backendError);

            // 방법 2: 개별 API들을 조합하여 데이터 구성 (폴백)
            const [transactionsResult, stats, recentTransactions] = await Promise.all([
                getUserTransactions({
                    yearMonth,
                    page: 0,
                    size: 1000,
                    sort: 'txTime,desc'
                }),
                getTransactionStats(yearMonth),
                getRecentTransactions(yearMonth, 5)
            ]);

            const categorySpending = aggregateTransactionsByCategory(transactionsResult.content);
            const totalSpending = categorySpending.reduce((sum, item) => sum + item.totalAmount, 0);

            const fallbackResult: MonthlyReportData = {
                yearMonth,
                totalSpending,
                totalSaved: stats.totalSavedAmount,
                recommendationUsageRate: stats.recommendationUsageRate,
                categorySpending,
                recentTransactions: recentTransactions.map(tx => ({
                    id: tx.id,
                    storeName: tx.storeName,
                    amount: tx.amount,
                    cardCompany: tx.cardCompany,
                    category: tx.category,
                    reward: tx.reward,
                    txTime: tx.txTime
                }))
            };
            return fallbackResult;
        }

    } catch (error) {
        console.error('월별 리포트 데이터 조회 실패:', error);
        throw error;
    }
};

/**
 * AI 분석 재생성 요청 (새로운 엔드포인트 사용)
 * JWT 인증은 http.ts의 interceptor에서 자동 처리
 */
export const regenerateAiAnalysis = async (
    yearMonth: string
): Promise<string> => {
    try {
        const response = await api.post(`/myberry/reports/${yearMonth}/ai-regenerate`);
        return response.data; // AI 분석은 문자열로 반환

    } catch (error) {
        console.error('AI 분석 재생성 실패:', error);
        throw error;
    }
};

/**
 * AI 분석 요청 (기존 방식 + 새로운 엔드포인트 병행)
 */
export const requestAiAnalysis = async (
    analysisRequest: {
        yearMonth: string;
        categorySpending: CategorySpendingData[];
        totalSpending: number;
        previousMonthData?: MonthlyReportData;
    }
): Promise<AiAnalysisResponse> => {
    try {
        // 방법 1: 백엔드의 AI 재생성 API 사용 (추천)
        try {
            const aiSummary = await regenerateAiAnalysis(analysisRequest.yearMonth);
            const result: AiAnalysisResponse = {
                summary: aiSummary,
                insights: [],
                recommendations: []
            };
            return result;
        } catch (backendError) {
            console.warn('백엔드 AI API 실패, 폴백 분석 사용:', backendError);

            // 방법 2: 폴백 분석 (개발용)
            const fallbackAnalysis = generateFallbackAnalysis(analysisRequest);
            return fallbackAnalysis;
        }

    } catch (error) {
        console.error('AI 분석 요청 실패:', error);
        throw error;
    }
};

/**
 * 임시 AI 분석 생성 (개발용)
 */
const generateFallbackAnalysis = (request: AiAnalysisRequest): AiAnalysisResponse => {
    const topCategory = request.categorySpending[0];
    const totalSpending = request.totalSpending;

    let summary = '';

    if (topCategory) {
        const percentage = topCategory.percentage.toFixed(1);
        summary += `${topCategory.categoryName} 지출이 전체의 ${percentage}%로 가장 높은 비중을 차지하고 있습니다. `;

        if (topCategory.categoryName === '식비') {
            summary += '외식보다는 집에서 요리하는 빈도를 늘려보는 것을 추천합니다.\n\n';
        } else if (topCategory.categoryName === '쇼핑') {
            summary += '계획적인 소비를 통해 불필요한 지출을 줄여보시기 바랍니다.\n\n';
        }
    }

    if (request.categorySpending.length >= 2) {
        const secondCategory = request.categorySpending[1];
        summary += `${secondCategory.categoryName} 비용도 상당한 비중을 차지하고 있어, `;

        if (secondCategory.categoryName === '교통비') {
            summary += '대중교통 이용이나 할인 혜택을 적극 활용해보시기 바랍니다.';
        } else {
            summary += '해당 영역에서의 절약 방안을 고려해보시기 바랍니다.';
        }
    }

    const result: AiAnalysisResponse = {
        summary: summary || '이번 달 지출 패턴을 분석한 결과, 전반적으로 안정적인 소비를 보이고 있습니다.',
        insights: [
            `총 지출: ${totalSpending.toLocaleString()}원`,
            `주요 지출 카테고리: ${topCategory?.categoryName || '없음'}`
        ],
        recommendations: [
            '가장 많이 지출하는 카테고리에서 절약 방안을 찾아보세요',
            '카드 혜택을 적극 활용하여 적립을 늘려보세요'
        ]
    };
    return result;
};

/**
 * 리포트 페이지 전체 데이터 조회 (통합 함수)
 * JWT 인증은 http.ts의 interceptor에서 자동 처리
 */
export const getReportPageData = async (
    yearMonth: string
): Promise<ReportPageData> => {
    try {
        // 1. 월별 리포트 데이터 조회
        const monthlyReport = await getMonthlyReportData(yearMonth);

        // 2. AI 분석 요청
        const aiAnalysisRequest = {
            yearMonth,
            categorySpending: monthlyReport.categorySpending,
            totalSpending: monthlyReport.totalSpending
        };

        const aiAnalysis = await requestAiAnalysis(aiAnalysisRequest);

        // 3. 통계 카드 데이터 구성
        const stats = {
            savedAmount: {
                title: '절감금액',
                value: `${monthlyReport.totalSaved.toLocaleString()}원`
            },
            usageRate: {
                title: '추천 사용률',
                value: `${Math.round(monthlyReport.recommendationUsageRate * 100)}%`
            }
        };

        const result: ReportPageData = {
            monthlyReport,
            aiAnalysis,
            stats
        };
        return result;

    } catch (error) {
        console.error('리포트 페이지 데이터 조회 실패:', error);
        throw error;
    }
};

/**
 * 년월 문자열을 Date 객체로 변환
 */
export const parseYearMonth = (yearMonth: string): Date => {
    const [year, month] = yearMonth.split('-').map(Number);
    return new Date(year, month - 1, 1);
};

/**
 * Date 객체를 년월 문자열로 변환
 */
export const formatYearMonth = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
};