import { useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export default function AuthCallback() {
    const navigate = useNavigate();
    const { pathname } = useLocation();

    // ✅ 무조건 최상단에서 호출
    const ranRef = useRef(false);

    useEffect(() => {
        // /auth/callback 이 아닐 때는 아무 것도 안 함
        if (pathname !== "/auth/callback") return;

        // StrictMode 중복 실행 방지
        if (ranRef.current) return;
        ranRef.current = true;

        const raw =
            (window.location.hash?.startsWith("#") ? window.location.hash.slice(1) : "") ||
            (window.location.search?.startsWith("?") ? window.location.search.slice(1) : "");

        console.log("[AuthCallback] href:", window.location.href);
        console.log("[AuthCallback] raw:", raw);

        const params = new URLSearchParams(raw);
        const accessToken = params.get("accessToken");
        const refreshToken = params.get("refreshToken");
        const isNewUser = params.get("isNewUser") === "true";

        if (!accessToken) {
            console.error("토큰 없음 : 로그인 실패");
            navigate("/auth/login", { replace: true });
            return;
        }

        localStorage.setItem("accessToken", accessToken);
        if (!isNewUser && refreshToken) localStorage.setItem("refreshToken", refreshToken);
        else localStorage.removeItem("refreshToken");

        // 신규 온보딩 플래그
        if (isNewUser) sessionStorage.setItem("pendingRegister", "1");
        else sessionStorage.removeItem("pendingRegister");

        // 해시/쿼리 제거
        window.history.replaceState(null, "", window.location.pathname);

        navigate(isNewUser ? "/auth/register" : "/", { replace: true });
    }, [navigate, pathname]);

    return <div>로그인 처리 중...</div>;
}
