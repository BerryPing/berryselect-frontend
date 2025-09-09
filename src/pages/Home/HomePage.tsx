// src/pages/Home/HomePage.tsx
import { useState } from 'react';
import HomeSearchBar from "@/components/home/HomeSearchBar.tsx";
import HomeGreetingCard from "@/components/home/HomeGreetingCard.tsx";
import StatItem from "@/components/home/StatItem.tsx";

const HomePage = () => {
    const [searchValue, setSearchValue] = useState('');

    return (
        <>
            <HomeSearchBar
                searchPlaceholder="위치/가맹점 검색"
                searchValue={searchValue}
                onSearchChange={setSearchValue}
            />
            {/* 헤더 높이만큼 여백 */}
            <div style={{ marginTop: '80px', padding: '16px' }}>
                {/* 인사 카드 */}
                <HomeGreetingCard
                    userName="김베리"
                    savingsAmount={23400}
                    onCardClick={() => console.log('카드 클릭됨')}
                    onNotificationClick={() => console.log('알림 클릭됨')}
                />

                {/* 통계 카드 */}
                <div style={{ marginTop: '16px' }}>
                    <StatItem
                        onGoalClick={() => console.log('목표 설정하기 클릭됨')}
                        onCardClick={() => console.log('통계 카드 클릭됨')}
                    />
                </div>

                {/* 다른 콘텐츠들 */}
                <div style={{ marginTop: '20px' }}>
                    다른 홈 콘텐츠들...
                </div>
            </div>
        </>
    );
};

export default HomePage;
