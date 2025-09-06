// src/pages/MyBerry/MyBerryPage.tsx
import Header from "@/components/layout/Header.tsx";
import { logout } from "@/api/authApi";
import { deleteAccount } from "@/api/userApi";

const MyBerryPage = () => {
    const handleDelete = async () => {
        try {
            await deleteAccount();
            alert("회원 탈퇴가 완료되었습니다.");
            window.location.href = "/";
        } catch (e: unknown) {
            if (e instanceof Error) {
                console.error("회원 탈퇴 실패:", e.message);
            } else {
                console.error("회원 탈퇴 실패:", e);
            }
        }
    };

    return (
        <div>
            <Header title="마이베리" showBackButton={false} showHomeButton={false}/>
            <div>마이베리 콘텐츠</div>
            <button onClick={logout}>로그아웃</button>

            <button onClick={handleDelete}>회원탈퇴</button>

        </div>
    );
};

export default MyBerryPage;