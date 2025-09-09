// src/pages/NotFoundPage.tsx
import Header from "@/components/layout/Header.tsx";

const NotificationPage = () => {
    return (
        <>
            <Header title="알림" showBackButton={false} showHomeButton={false} />
            <div>NotFound 콘텐츠</div>
        </>
    );
};

export default NotificationPage;