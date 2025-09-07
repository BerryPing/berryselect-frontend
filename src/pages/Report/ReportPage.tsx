// src/pages/ReportPage/ReportPage.tsx
import { useState } from "react";
import Header from "@/components/layout/Header.tsx";
import StatCard from "@/components/report/StatCard.tsx";
import MonthNavigator from "@/components/report/MonthNavigator.tsx";
import DonutChart from "@/components/report/DonutSection/DonutChart.tsx";

const ReportPage = () => {
    const [selectedMonth, setSelectedMonth] = useState('7월');

    const handleMonthChange = (year: number, month: number) => {
        setSelectedMonth(`${month}월`);
        console.log(`선택된 날짜: ${year}년 ${month}월`);
        // 여기서 선택된 년월에 따라 리포트 데이터를 다시 불러오는 로직 추가
    };

    // 카테고리별 지출 데이터 (백엔드 연동 시 API에서 받아올 데이터)
    const categoryData = [
        { name: '식비', value: 45000, color: '#5F0080' },
        { name: '교통비', value: 32000, color: '#9B4DCC' },
        { name: '쇼핑', value: 28000, color: '#B983DB' },
        { name: '문화생활', value: 20000, color: '#E5D5F0' },
        { name: '의료비', value: 15000, color: '#7B6EF6' },
        { name: '기타', value: 12000, color: '#166534' }
    ];

    const totalAmount = categoryData.reduce((sum, item) => sum + item.value, 0);

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

            {/* 도넛차트 영역 */}
            <div style={{
                padding: "30px 20px 20px 20px"
            }}>
                <DonutChart
                    data={categoryData}
                    size={280}
                    centerText={`${totalAmount.toLocaleString()}원`}
                />
            </div>
        </>
    );
};

export default ReportPage;