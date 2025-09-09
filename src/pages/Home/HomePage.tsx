// src/pages/Home/HomePage.tsx
import { useState } from 'react';
import HomeSearchBar from "@/components/home/HomeSearchBar.tsx";
import HomeGreetingCard from "@/components/home/HomeGreetingCard.tsx";
import StatItem from "@/components/home/StatItem.tsx";
import HomeAlertCard from "@/components/home/HomeAlertCard.tsx";
import RecentTransactionCard from "@/components/report/Transaction/RecentTransactionCard.tsx";

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

                {/* 알림 카드 */}
                <div style={{ marginTop: '16px' }}>
                    <HomeAlertCard
                        title="기프티콘 만료 D-3"
                        description="스타벅스 아메리카노"
                        onCardClick={() => console.log('알림 카드 클릭됨')}
                    />
                </div>

                {/* 최근 거래 카드 */}
                <div style={{ marginTop: '16px' }}>
                    <style>
                        {`
                            .homepage-transaction-override div[style*="width: 334"] {
                                width: 100% !important;
                            }
                            .homepage-transaction-override {
                                position: relative;
                            }
                            .homepage-transaction-override::after {
                                content: "전체보기";
                                position: absolute;
                                top: 4px;
                                right: 5px;
                                color: var(--theme-text-sub);
                                font-size: 12px;
                                font-family: inherit;
                                font-weight: 400;
                                cursor: pointer;
                            }
                        `}
                    </style>

                    <div
                        className="homepage-transaction-override"
                        onClick={(e) => {
                            // "전체보기" 영역 클릭 감지
                            const rect = e.currentTarget.getBoundingClientRect();
                            const clickX = e.clientX - rect.left;
                            const clickY = e.clientY - rect.top;

                            // 오른쪽 상단 영역 클릭시
                            if (clickX > rect.width - 60 && clickY < 25) {
                                console.log('전체보기 클릭됨');
                            }
                        }}
                    >
                        <RecentTransactionCard title="최근 거래" />
                    </div>
                </div>
            </div>
        </>
    );
};

export default HomePage;
