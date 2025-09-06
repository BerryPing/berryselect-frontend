import axios from "axios";
import type { AxiosResponse, AxiosError } from "axios";

/** baseURL: .env → 없으면 빈값(상대경로) */
interface ViteEnv {
    VITE_API_BASE_URL?: string;
}

const envBase = (import.meta as ImportMeta & { env: ViteEnv }).env.VITE_API_BASE_URL;
const baseURL = envBase ? envBase.replace(/\/+$/, "") : ""; // 끝 슬래시 제거

const http = axios.create({
    baseURL,              // 예) http://localhost:8080  또는 ""(상대경로)
    withCredentials: false,
    timeout: 10000,
});

/** 요청 인터셉터: 토큰 자동 주입 */
http.interceptors.request.use((config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
        config.headers = config.headers ?? {};
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

/** ApiResponse 형태 가드 */
type ApiEnvelope = {
    success: boolean;
    data?: unknown;
    message?: string;
    code?: string;
};

function isApiEnvelope(x: unknown): x is ApiEnvelope {
    if (x === null || typeof x !== "object") return false;
    // 객체 키 존재 여부만 검사( any 사용 금지 )
    return Object.prototype.hasOwnProperty.call(x as Record<string, unknown>, "success");
}

/** 에러 객체 표준화 */
class ApiError extends Error {
    code?: string;
    status?: number;
    constructor(message: string, opts?: { code?: string; status?: number }) {
        super(message);
        this.name = "ApiError";
        this.code = opts?.code;
        this.status = opts?.status;
    }
}

/** 응답 인터셉터: ApiResponse면 data로 언랩 */
http.interceptors.response.use(
    (res: AxiosResponse) => {
        const body: unknown = res.data;
        if (isApiEnvelope(body)) {
            if (body.success) {
                // 성공 → data만 반환하도록 치환
                return { ...res, data: body.data } as AxiosResponse;
            }
            // 실패 → 표준화된 에러로 throw
            throw new ApiError(body.message ?? "요청에 실패했습니다.", {
                code: body.code,
                status: res.status,
            });
        }
        // 원시 데이터면 그대로
        return res;
    },
    (error: AxiosError) => {
        const status = error.response?.status;
        const payload: unknown = error.response?.data;

        // 서버가 ApiResponse 형태로 에러를 보낸 경우
        if (isApiEnvelope(payload) && payload.success === false) {
            return Promise.reject(
                new ApiError(payload.message ?? "요청에 실패했습니다.", {
                    code: payload.code,
                    status,
                })
            );
        }
        // 그 외 axios 에러는 원본 유지
        return Promise.reject(error);
    }
);

export default http;