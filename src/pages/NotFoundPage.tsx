// src/pages/NotFoundPage.tsx
import Header from "@/components/layout/Header.tsx";

const NotFoundPage = () => {
    return (
        <>
            <Header title="에러" showBackButton={false} showHomeButton={false} />
            <div>NotFound 콘텐츠</div>
        </>
    );
};

export default NotFoundPage;