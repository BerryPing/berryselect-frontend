// src/api/authApi.ts
import api from "./http";
import { isAxiosError } from "axios";


// 전역: 재발급 단일화용 잠금(싱글톤)
let refreshPromise: Promise<string> | null = null;

export async function logout() {
    try {
        const accessToken = localStorage.getItem("accessToken");
        const refreshToken = localStorage.getItem("refreshToken");

        // 서버가 Authorization을 요구할 수도 있으니 가능하면 동봉
        if (refreshToken) {
            await api.post(
                "/auth/logout",
                { refreshToken },
                accessToken
                    ? { headers: { Authorization: `Bearer ${accessToken}` } }
                    : undefined
            );
        }
    } catch (err) {
        console.error("로그아웃 API 실패(무시하고 클라이언트 세션만 정리):", err);
    } finally {
        // ✅ 클라이언트 세션 완전 초기화
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        sessionStorage.removeItem("pendingRegister"); // 온보딩 플래그 정리

        // 필요 시 앱 전역 상태(Store) 초기화도 여기서
        // store.reset() 등...

        // 하드 리로드가 깔끔함(라우트/캐시 이슈 예방)
        window.location.href = "/auth/login";
    }
}

export async function refreshAccessToken(): Promise<string> {
    // 이미 갱신 중이면 그 Promise를 재사용(동시호출 방지)
    if (refreshPromise) return refreshPromise;

    refreshPromise = (async () => {
        const currentRefresh = localStorage.getItem("refreshToken");
        if (!currentRefresh) {
            throw new Error("refreshToken 없음");
        }

        try {
            const { data } = await api.post("/auth/token/refresh", { refreshToken: currentRefresh });

            // 서버가 rotate 한다면 새 refreshToken도 저장
            if (data.refreshToken) {
                localStorage.setItem("refreshToken", data.refreshToken);
            }
            if (!data.accessToken) {
                throw new Error("accessToken 갱신 실패");
            }
            localStorage.setItem("accessToken", data.accessToken);
            return data.accessToken as string;
        } catch (err: unknown) {
            let status: number | undefined;
            if (isAxiosError(err)) {
                status = err.response?.status;
            }

            console.error("토큰 재발급 실패, 강제 로그아웃:", status, err);

            await logout(); // 위에서 스토리지/상태 모두 초기화
            throw err;
        } finally {
            refreshPromise = null;
        }
    })();

    return refreshPromise;
}