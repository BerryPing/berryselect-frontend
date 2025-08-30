// src/pages/BerryPick/BerryPickPage.tsx
import Header from "@/components/layout/Header.tsx";

const BerryPickPage = () => {
    return (
        <>
            <Header title="베리픽" showBackButton={false} showHomeButton={false} />
            <div>베리픽 콘텐츠</div>
        </>
    );
};

export default BerryPickPage;