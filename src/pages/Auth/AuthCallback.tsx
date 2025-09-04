import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function AuthCallback() {
    const navigate = useNavigate();

    useEffect(() => {
        const hash = window.location.hash.substring(1); // '#' 제거
        const params = new URLSearchParams(hash);

        const accessToken = params.get("accessToken");
        const refreshToken = params.get("refreshToken");

        if (accessToken && refreshToken) {
            localStorage.setItem("accessToken", accessToken);
            localStorage.setItem("refreshToken", refreshToken);

            navigate("/", { replace: true });
        } else {
            console.error("토큰 없음 : 로그인 실패");
            navigate("/auth/login", { replace: true });
        }
    }, [navigate]);

    return <div>로그인 처리 중...</div>;
}