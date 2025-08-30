// src/pages/MyBerry/MyBerryPage.tsx
import Header from "@/components/layout/Header.tsx";

const MyBerryPage = () => {
    return (
        <>
            <Header title="마이베리" showBackButton={false} showHomeButton={false} />
            <div>마이베리 콘텐츠</div>
        </>
    );
};

export default MyBerryPage;