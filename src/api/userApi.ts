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

type BackendUserSettingsResponse = Partial<{
    preferredCategories: string[];
    allowKakaoAlert: boolean | null;
    marketingOption: boolean | null;

    // BE v1 스타일
    notifyBudgetAlert: boolean | null;
    notifyGifticonExpire: boolean | null;
    notifyBenefitEvents: boolean | null;

    // BE v0/FE 스타일
    warnOverBudget: boolean | null;
    gifticonExpireAlert: boolean | null;
    eventAlert: boolean | null;
}>;

type BackendUpdateUserSettingsRequest = Partial<{
    allowKakaoAlert: boolean;
    marketingOption: boolean;

    // 둘 다 실어보냄(백엔드가 어느 쪽을 바인딩하든 맞게 들어가도록)
    notifyBudgetAlert: boolean;
    notifyGifticonExpire: boolean;
    notifyBenefitEvents: boolean;

    warnOverBudget: boolean;
    gifticonExpireAlert: boolean;
    eventAlert: boolean;

    preferredCategories: string[];
    preferredCategoryIds: number[];
}>;

const fromBackend = (be: BackendUserSettingsResponse): UserSettingsResponse => ({
    preferredCategories: be.preferredCategories ?? [],
    allowKakaoAlert: be.allowKakaoAlert ?? null,
    marketingOptIn: be.marketingOption ?? null,

    // 응답은 두 이름 중 존재하는 걸 채택
    warnOverBudget: (be.notifyBudgetAlert ?? be.warnOverBudget) ?? null,
    gifticonExpireAlert: (be.notifyGifticonExpire ?? be.gifticonExpireAlert) ?? null,
    eventAlert: (be.notifyBenefitEvents ?? be.eventAlert) ?? null,
});

const toBackend = (ui: UpdateUserSettingsRequest): BackendUpdateUserSettingsRequest => {
    const o: BackendUpdateUserSettingsRequest = {};
    if (ui.allowKakaoAlert !== undefined) o.allowKakaoAlert = ui.allowKakaoAlert;
    if (ui.marketingOptIn !== undefined) o.marketingOption = ui.marketingOptIn;

    if (ui.warnOverBudget !== undefined) {
        o.notifyBudgetAlert = ui.warnOverBudget;  // BE v1
        o.warnOverBudget = ui.warnOverBudget;     // BE v0/FE
    }
    if (ui.gifticonExpireAlert !== undefined) {
        o.notifyGifticonExpire = ui.gifticonExpireAlert;
        o.gifticonExpireAlert = ui.gifticonExpireAlert;
    }
    if (ui.eventAlert !== undefined) {
        o.notifyBenefitEvents = ui.eventAlert;
        o.eventAlert = ui.eventAlert;
    }

    if (ui.preferredCategories) o.preferredCategories = ui.preferredCategories;
    if (ui.preferredCategoryIds) o.preferredCategoryIds = ui.preferredCategoryIds;

    return o;
};

function authHeader() {
    const token = localStorage.getItem("accessToken");
    return token ? { headers: { Authorization: `Bearer ${token}` } } : undefined;
}

// GET /users/me/settings
export async function getUserSettings(): Promise<UserSettingsResponse> {
    try {
        const { data } = await api.get<BackendUserSettingsResponse>("/users/me/settings",
            authHeader()
        );
        return fromBackend(data);
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

    const { data } = await api.put<BackendUserSettingsResponse>(
        "/users/me/settings",
        toBackend(body),
        { headers: { Authorization: `Bearer ${token}` } }
    );

    return fromBackend(data);
}