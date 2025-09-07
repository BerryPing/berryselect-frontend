// src/pages/ReportPage/ReportPage.tsx
import { useState } from "react";
import Header from "@/components/layout/Header.tsx";
import StatCard from "@/components/report/StatCard.tsx";
import MonthNavigator from "@/components/report/MonthNavigator.tsx";

const ReportPage = () => {
    const [selectedMonth, setSelectedMonth] = useState('7월');

    const handleMonthChange = (year: number, month: number) => {
        setSelectedMonth(`${month}월`);
        console.log(`선택된 날짜: ${year}년 ${month}월`);
        // 여기서 선택된 년월에 따라 리포트 데이터를 다시 불러오는 로직 추가
    };

    return (
        <>
            <Header title="상세 리포트" showBackButton={false} showHomeButton={false} />

            {/* 통계 카드 영역 */}
            <div style={{
                display: "flex",
                gap: 16,
                padding: "10px 20px 10px 20px"
            }}>
                <StatCard title="절감금액" value="24,300원" />
                <StatCard title="추천 사용률" value="68%" />
            </div>

            {/* 월 선택 영역 */}
            <div style={{
                padding: "10px 20px 10px 20px",
                display: "flex",
                justifyContent: "left",
                alignItems: "center"
            }}>
                <MonthNavigator
                    selectedMonth={selectedMonth}
                    onMonthChange={handleMonthChange}
                />
            </div>
        </>
    );
};

export default ReportPage;