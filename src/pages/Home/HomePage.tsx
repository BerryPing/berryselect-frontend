// src/pages/Home/HomePage.tsx
import Header from '@/components/layout/Header';

// React.FC 생략 가능 (많은 팀이 이렇게 씀)
const HomePage = () => {
    return (
        <>
            <Header title="홈" showBackButton={false} showHomeButton={false} />
            <div>홈 화면 콘텐츠</div>
        </>
    );
};

export default HomePage;