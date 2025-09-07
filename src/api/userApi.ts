// src/api/userApi.ts -> 회원 관련 (내 정보 조회. 회원 탈퇴)
import api from "./http";

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
