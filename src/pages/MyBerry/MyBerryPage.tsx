// src/pages/MyBerry/MyBerryPage.tsx
import Header from "@/components/layout/Header.tsx";
import { logout } from "@/api/authApi";

const MyBerryPage = () => {
    return (
        <div>
            <Header title="마이베리" showBackButton={false} showHomeButton={false} />
            <div>마이베리 콘텐츠</div>
            <button onClick={logout}>로그아웃</button>
        </div>
    );
};

export default MyBerryPage;