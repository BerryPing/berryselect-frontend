// src/api/authApi.ts
import api from "./http";

export async function logout(){
    const refreshToken = localStorage.getItem("refreshToken");
    if(refreshToken){
        try{
            await api.post("/auth/logout", { refreshToken });
        }
        catch (err){
            console.error("로그아웃 실패", err);
        }
    }
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    window.location.href = "/auth/login";
}

export async function refreshAccessToken(){
    const refreshToken = localStorage.getItem("refreshToken");
    if(!refreshToken) throw new Error("refreshToken 없음");

    const { data } = await api.post("/auth/token/refresh", { refreshToken });
    localStorage.setItem("accessToken", data.accessToken);
    return data.accessToken;
}