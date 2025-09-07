import axios, { AxiosError, AxiosHeaders } from "axios";
import type { AxiosRequestConfig, AxiosResponse, RawAxiosRequestHeaders } from "axios";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL as string,
    withCredentials: true,
});

// 이미 재시도한 요청을 저장
const retried = new WeakSet<AxiosRequestConfig>();

api.interceptors.request.use((config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
        if (!config.headers) config.headers = new AxiosHeaders();
        if (config.headers instanceof AxiosHeaders) {
            config.headers.set("Authorization", `Bearer ${token}`);
        } else {
            (config.headers as RawAxiosRequestHeaders)["Authorization"] = `Bearer ${token}`;
        }

    }
    return config;
});


api.interceptors.response.use(
    (res) => res,
    async (error: AxiosError) => {
        const status = error.response?.status ?? 0;
        const originalRequest = error.config as AxiosRequestConfig | undefined;

        if (status !== 401 || !originalRequest || retried.has(originalRequest)) {
            return Promise.reject(error);
        }
        retried.add(originalRequest);

        try {
            const refreshToken = localStorage.getItem("refreshToken");
            if (!refreshToken) throw new Error("리프레시 토큰 없음");

            const resp: AxiosResponse<{ accessToken: string }> = await axios.post(
                `${import.meta.env.VITE_API_BASE_URL}/auth/token/refresh`,
                { refreshToken },
                { withCredentials: true }
            );

            const newAccess = resp.data.accessToken;
            if (!newAccess) throw new Error("갱신 토큰 응답 형식 오류");

            localStorage.setItem("accessToken", newAccess);

            if (!originalRequest.headers) originalRequest.headers = new AxiosHeaders();
            if (originalRequest.headers instanceof AxiosHeaders) {
                originalRequest.headers.set("Authorization", `Bearer ${newAccess}`);
            } else {
                (originalRequest.headers as RawAxiosRequestHeaders)["Authorization"] = `Bearer ${newAccess}`;
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
);

export default api;

