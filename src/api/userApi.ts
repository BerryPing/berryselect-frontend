// src/api/userApi.ts -> 회원 관련 (내 정보 조회/회원 탈퇴/알림, 카테고리 조회)
import api from "./http";
import {isAxiosError} from "axios";

export async function deleteAccount(){
    const token = localStorage.getItem("accessToken");
    if(!token) throw new Error("로그인이 필요합니다.");

    const res = await api.delete("/user/me",{
        headers : {
            Authorization : `Bearer ${token}`,
        },
    });

    if(res.status !== 204){
        throw new Error("회원 탈퇴 실패");
    }

    // 탈퇴 성공 -> 로컬 토큰 삭제
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
}

export type UserSettingsResponse = {
    preferredCategories: string[];
    warnOverBudget: boolean | null;
    gifticonExpireAlert: boolean | null;
    eventAlert: boolean | null;
    allowKakaoAlert: boolean | null;
    marketingOptIn: boolean | null;
};

export type UpdateUserSettingsRequest = {
    preferredCategories?: string[];
    preferredCategoryIds?: number[];
    warnOverBudget?: boolean;
    gifticonExpireAlert?: boolean;
    eventAlert?: boolean;
    allowKakaoAlert?: boolean;
    marketingOptIn?: boolean;
};

// GET /users/me/settings
export async function getUserSettings(): Promise<UserSettingsResponse> {
    try {
        const { data } = await api.get<UserSettingsResponse>("/users/me/settings");
        return data;
    } catch (err: unknown) {
        const status = isAxiosError(err) ? err.response?.status : undefined;
        console.warn("[getUserSettings] fallback due to error", status);
        return {
            preferredCategories: [],
            warnOverBudget: true,
            gifticonExpireAlert: true,
            eventAlert: false,
            allowKakaoAlert: true,
            marketingOptIn: false,
        };
    }
}

// PUT /users/me/settings
export async function updateUserSettings(
    body: UpdateUserSettingsRequest
): Promise<UserSettingsResponse> {
    const token = localStorage.getItem("accessToken");
    if (!token) throw new Error("로그인이 필요합니다.");

    const { data } = await api.put<UserSettingsResponse>(
        "/users/me/settings",
        body,
        { headers: { Authorization: `Bearer ${token}` } }
    );

    return data;
}