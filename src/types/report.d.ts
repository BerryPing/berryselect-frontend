// src/types/report.d.ts

/**
 * 카테고리별 지출 데이터 타입 (도넛차트용)
 */
export interface CategorySpendingData {
    categoryId: number;
    categoryName: string;
    totalAmount: number;
    percentage: number;         // 전체 대비 비율 (0.0 ~ 100.0)
    color: string;              // 차트 색상
}

/**
 * 월별 리포트 데이터 타입
 */
export interface MonthlyReportData {
    yearMonth: string;          // YYYY-MM 형식
    totalSpending: number;      // 총 지출 금액
    totalSaved: number;         // 총 절약 금액
    recommendationUsageRate: number; // 추천 사용률 (0.0 ~ 1.0)
    categorySpending: CategorySpendingData[]; // 카테고리별 지출
    recentTransactions: RecentTransaction[]; // 최근 거래
}

/**
 * 최근 거래 데이터 타입 (요약된 형태)
 */
export interface RecentTransaction {
    id: string;
    storeName: string;
    amount: number;
    cardCompany: string;
    category: string;
    reward: number;
    txTime: string;             // ISO string
}

/**
 * AI 분석 요청 타입 (JWT 인증 적용 - userId 제거됨)
 */
export interface AiAnalysisRequest {
    yearMonth: string;          // YYYY-MM 형식
    categorySpending: CategorySpendingData[];
    totalSpending: number;
    previousMonthData?: MonthlyReportData; // 이전 월 비교용 (선택사항)
}

/**
 * AI 분석 응답 타입
 */
export interface AiAnalysisResponse {
    summary: string;            // AI 분석 요약 텍스트
    insights?: string[];        // 주요 인사이트 배열 (선택사항)
    recommendations?: string[]; // 추천 사항 배열 (선택사항)
}

/**
 * 통계 카드 데이터 타입
 */
export interface StatCardData {
    title: string;
    value: string;
    change?: number;            // 전월 대비 변화량 (선택사항)
    changeType?: 'increase' | 'decrease' | 'same'; // 변화 유형 (선택사항)
}

/**
 * 리포트 페이지 전체 데이터 타입
 */
export interface ReportPageData {
    monthlyReport: MonthlyReportData;
    aiAnalysis: AiAnalysisResponse;
    stats: {
        savedAmount: StatCardData;
        usageRate: StatCardData;
    };
}

/**
 * 백엔드 월별 리포트 응답 타입 (BudgetReportController의 MonthlyReportDetailResponse)
 */
export interface BackendMonthlyReportResponse {
    yearMonth: string;
    totalSpent: number;
    totalSaved: number;
    recommendationUsageRate: number;
    categorySpending: CategorySpendingData[];
    recentTrans
}

/**
 * 카테고리별 지출 데이터 타입 (도넛차트용)
 */
export interface CategorySpendingData {
    categoryId: number;
    categoryName: string;
    totalAmount: number;
    percentage: number;         // 전체 대비 비율 (0.0 ~ 100.0)
    color: string;              // 차트 색상
}

/**
 * 월별 리포트 데이터 타입
 */
export interface MonthlyReportData {
    yearMonth: string;          // YYYY-MM 형식
    totalSpending: number;      // 총 지출 금액
    totalSaved: number;         // 총 절약 금액
    recommendationUsageRate: number; // 추천 사용률 (0.0 ~ 1.0)
    categorySpending: CategorySpendingData[]; // 카테고리별 지출
    recentTransactions: RecentTransaction[]; // 최근 거래
}

/**
 * 최근 거래 데이터 타입 (요약된 형태)
 */
export interface RecentTransaction {
    id: string;
    storeName: string;
    amount: number;
    cardCompany: string;
    category: string;
    reward: number;
    txTime: string;             // ISO string
}

/**
 * AI 분석 요청 타입 (JWT 인증 적용 - userId 제거됨)
 */
export interface AiAnalysisRequest {
    yearMonth: string;          // YYYY-MM 형식
    categorySpending: CategorySpendingData[];
    totalSpending: number;
    previousMonthData?: MonthlyReportData; // 이전 월 비교용 (선택사항)
}

/**
 * AI 분석 응답 타입
 */
export interface AiAnalysisResponse {
    summary: string;            // AI 분석 요약 텍스트
    insights?: string[];        // 주요 인사이트 배열 (선택사항)
    recommendations?: string[]; // 추천 사항 배열 (선택사항)
}

/**
 * 통계 카드 데이터 타입
 */
export interface StatCardData {
    title: string;
    value: string;
    change?: number;            // 전월 대비 변화량 (선택사항)
    changeType?: 'increase' | 'decrease' | 'same'; // 변화 유형 (선택사항)
}

/**
 * 리포트 페이지 전체 데이터 타입
 */
export interface ReportPageData {
    monthlyReport: MonthlyReportData;
    aiAnalysis: AiAnalysisResponse;
    stats: {
        savedAmount: StatCardData;
        usageRate: StatCardData;
    };
}

/**
 * 백엔드 월별 리포트 응답 타입 (BudgetReportController의 MonthlyReportDetailResponse)
 */
export interface BackendMonthlyReportResponse {
    yearMonth: string;
    totalSpent: number;
    totalSaved: number;
    recommendationUsageRate: number;
    categorySpending: CategorySpendingData[];
    recentTransactions: RecentTransaction[];
    aiSummary?: string;         // AI 분석 요약 (선택사항)
}
