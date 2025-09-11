// src/api/myberryApi.ts
import http from "./http"; // 방금 보여준 axios 인스턴스

// 페이지에서 쓰는 타입과 호환되게 정의 (BudgetGoalForm의 Budget과 동일 구조면 OK)
export type UserProfile = {
    id: number;
    name?: string | null;
    phone?: string | null;
    birth?: string | null;
};

export type Budget = {
    yearMonth : string;
    amountTarget: number;
    amountSpent: number;
    amountRemaining: number;
    exceeded: boolean;
    updatedAt?: string;
};

const API_BASE = import.meta.env.VITE_API_BASE_URL;

/**
 * 내 프로필 조회
 * - http.ts 응답 인터셉터가 Envelope를 언랩하므로 res.data가 곧 실제 데이터임
 * - apiBaseUrl을 넘기면 해당 호출만 baseURL을 override 함(선택)
 */
export async function fetchMyProfile() {
    const res = await http.get<UserProfile>("/users/me", {
        baseURL: API_BASE,
    });
    return res.data; // UserProfile
}

/**
 * 예산 조회 (이번 달 기본, yearMonth "YYYY-MM" 지원)
 */
export async function fetchBudget(yearMonth?: string) {
    const res = await http.get<Budget>("/myberry/budgets", {
        baseURL : API_BASE,
        params: yearMonth ? { yearMonth } : undefined,
    });
    return res.data; // Budget
}

/** 예산 저장/갱신 */
export async function upsertBudget(yearMonth: string, amountTarget: number) {
    const res = await http.post<Budget>(
        "/myberry/budgets",
        { yearMonth, amountTarget },
        { baseURL: API_BASE }
    );
    return res.data;
}