// src/constants/index.ts

/**
 * 카테고리 색상 맵핑 (프론트엔드에서 관리)
 */
export const CATEGORY_COLORS: Record<string, string> = {
    '카페': '#5F0080',
    '편의점': '#9B4DCC',
    '교통': '#B983DB',
    '쇼핑': '#E5D5F0',
    '음식': '#7B6EF6',
    '기타': '#166534',
} as const;

/**
 * API 관련 상수
 */
export const API_ENDPOINTS = {
    TRANSACTIONS: '/myberry/transactions',
    RECOMMENDATION_RATE: '/myberry/transactions/recommendation-rate',
    TOTAL_SAVED: '/myberry/transactions/total-saved',
    AI_ANALYSIS: '/myberry/ai-analysis',
    MONTHLY_REPORT: '/myberry/reports'
} as const;

/**
 * 페이징 기본값
 */
export const PAGINATION_DEFAULTS = {
    PAGE_SIZE: 20,
    SORT_FIELD: 'txTime',
    SORT_DIRECTION: 'desc'
} as const;

/**
 * 날짜 형식
 */
export const DATE_FORMATS = {
    YEAR_MONTH: 'YYYY-MM',
    FULL_DATE: 'YYYY-MM-DD',
    DISPLAY_DATE: 'YYYY년 MM월'
} as const;