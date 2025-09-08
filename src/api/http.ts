import axios, { AxiosError, AxiosHeaders, type AxiosRequestConfig, type AxiosResponse, type RawAxiosRequestHeaders } from "axios";

/** =========================
 *  환경 설정
 *  ========================= */
const rawBase = import.meta.env.VITE_API_BASE_URL as string | undefined;
const baseURL = rawBase ? rawBase.replace(/\/+$/, "") : undefined;

const api = axios.create({
    baseURL,
    withCredentials: true,
    timeout: 10000,
});

/** =========================
 *  공통 타입/유틸
 *  ========================= */
export type ApiEnvelope = {
    success: boolean;
    data?: unknown;
    message?: string;
    code?: string;
};

function isApiEnvelope(x: unknown): x is ApiEnvelope {
    if (x === null || typeof x !== "object") return false;
    return Object.prototype.hasOwnProperty.call(
        x as Record<string, unknown>,
        "success",
    );
}

/** 표준화된 에러 객체 */
export class ApiError extends Error {
    code?: string;
    status?: number;
    constructor(message: string, opts?: { code?: string; status?: number }) {
        super(message);
        this.name = "ApiError";
        this.code = opts?.code;
        this.status = opts?.status;
    }
}

type HeaderValue = string | number | boolean | string[] | null | undefined;
type HeaderBag = AxiosHeaders | RawAxiosRequestHeaders;

function ensureHeaders(cfg: AxiosRequestConfig): HeaderBag {
    if (!cfg.headers) cfg.headers = new AxiosHeaders();
    return cfg.headers as HeaderBag;
}

function setHeader(h: HeaderBag, key: string, value: string): void {
    if (h instanceof AxiosHeaders) h.set(key, value);
    else (h as RawAxiosRequestHeaders)[key] = value;
}

function getHeader(h: HeaderBag, key: string): HeaderValue {
    const v = h instanceof AxiosHeaders ? h.get(key) : (h as RawAxiosRequestHeaders)[key];
    return v === null ? undefined : (v as HeaderValue);
}

/** =========================
 *  요청 인터셉터: Authorization 주입
 *  ========================= */
api.interceptors.request.use((config) => {
    const headers = ensureHeaders(config);
    const token = localStorage.getItem("accessToken");

    if (token) {
        setHeader(headers, "Authorization", `Bearer ${token}`);
    }

    const hasAuth =
        Boolean(getHeader(headers, "Authorization")) ||
        Boolean(getHeader(headers, "authorization"));

    if (!hasAuth) {
        setHeader(headers, "X-User-Id", "1");
    }

    return config;
});

/** =========================
 *  재시도 관리(401 refresh 1회만)
 *  ========================= */
const retried = new WeakSet<AxiosRequestConfig>();

/** =========================
 *  응답 인터셉터
 *  - 성공: Envelope 언랩
 *  - 실패: 401 → 토큰 갱신 & 재시도, 그 외 Envelope면 ApiError로 변환
 *  ========================= */
api.interceptors.response.use(
    (res: AxiosResponse) => {
        const body: unknown = res.data;
        if (isApiEnvelope(body)) {
            if (body.success) {
                return { ...res, data: body.data } as AxiosResponse;
            }
            throw new ApiError(body.message ?? "요청에 실패했습니다.", {
                code: body.code,
                status: res.status,
            });
        }
        return res;
    },

    // 실패 응답 처리
    async (error: AxiosError) => {
        const status = error.response?.status ?? 0;
        const originalRequest = error.config as AxiosRequestConfig | undefined;

        if (status === 401 && originalRequest && !retried.has(originalRequest)) {
            retried.add(originalRequest);
            try {
                const refreshToken = localStorage.getItem("refreshToken");
                if (!refreshToken) throw new Error("리프레시 토큰 없음");

                const refreshUrl = `${baseURL ?? ""}/auth/token/refresh`;
                const resp: AxiosResponse<{ accessToken: string }> = await axios.post(
                    refreshUrl,
                    { refreshToken },
                    { withCredentials: true },
                );

                const newAccess = resp.data?.accessToken;
                if (!newAccess) throw new Error("갱신 토큰 응답 형식 오류");

                localStorage.setItem("accessToken", newAccess);

                if (!originalRequest.headers) originalRequest.headers = new AxiosHeaders();
                if (originalRequest.headers instanceof AxiosHeaders) {
                    originalRequest.headers.set("Authorization", `Bearer ${newAccess}`);
                } else {
                    (originalRequest.headers as RawAxiosRequestHeaders)["Authorization"] =
                        `Bearer ${newAccess}`;
                }

                return api(originalRequest);
            } catch (e) {
                console.error("토큰 갱신 실패:", e);
                localStorage.removeItem("accessToken");
                localStorage.removeItem("refreshToken");

                window.location.href = "/auth/login";
                return Promise.reject(e);
            }
        }

        /** 2) 그 외 에러에서, 서버가 Envelope 형식으로 보낸 경우 → ApiError로 통일 */
        const payload: unknown = error.response?.data;
        if (isApiEnvelope(payload)) {
            return Promise.reject(
                new ApiError(payload.message ?? "요청에 실패했습니다.", {
                    code: payload.code,
                    status,
                }),
            );
        }

        /** 3) Axios 기본 에러는 그대로 전달 */
        return Promise.reject(error);
    },
);

export default api;