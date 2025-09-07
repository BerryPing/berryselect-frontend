// src/pages/ReportPage/ReportPage.tsx
import React, { useState } from "react";
import Header from "@/components/layout/Header.tsx";
import StatCard from "@/components/report/StatCard.tsx";
import MonthNavigator from "@/components/report/MonthNavigator.tsx";
import DonutChart from "@/components/report/DonutSection/DonutChart.tsx";
import AiSummaryCard from "@/components/report/AiSummaryCard.tsx";
import RecentTransactionCard from "@/components/report/Transaction/RecentTransactionCard.tsx";

const ReportPage = () => {
    const [selectedMonth, setSelectedMonth] = useState('7월');
    const [aiSummary, setAiSummary] = useState('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);


    const handleMonthChange = (year: number, month: number) => {
        setSelectedMonth(`${month}월`);
        console.log(`선택된 날짜: ${year}년 ${month}월`);
        // 여기서 선택된 년월에 따라 리포트 데이터를 다시 불러오는 로직 추가
        // AI 분석도 다시 요청
        getAiAnalysis();
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

    // 최근 거래 데이터 (백엔드 연동 시 API에서 받아올 데이터)
    const recentTransactions = [
        {
            id: '1',
            storeName: '스타벅스',
            amount: 4800,
            cardCompany: '신한카드',
            category: '카페',
            reward: 1300
        },
        {
            id: '2',
            storeName: 'GS25',
            amount: 3200,
            cardCompany: 'KB국민',
            category: '편의점',
            reward: 400
        },
        {
            id: '3',
            storeName: '이마트',
            amount: 25600,
            cardCompany: '삼성카드',
            category: '마트',
            reward: 2100
        }
    ];


    // AI 분석 요청 함수
    const getAiAnalysis = async () => {
        setIsAnalyzing(true);
        try {
            // TODO: 실제 OpenAI API 호출로 교체
            // const response = await fetch('/api/ai-analysis', {
            //     method: 'POST',
            //     headers: { 'Content-Type': 'application/json' },
            //     body: JSON.stringify({ categoryData, month: selectedMonth })
            // });
            // const result = await response.json();
            // setAiSummary(result.summary);

            // 임시 데모 데이터
            setTimeout(() => {
                setAiSummary(`식비 지출이 전체의 29.6%로 가장 높은 비중을 차지하고 있습니다. 외식보다는 집에서 요리하는 빈도를 늘려보는 것을 추천합니다.

교통비와 쇼핑 비용도 상당한 비중을 차지하고 있어, 대중교통 이용이나 할인 혜택을 적극 활용해보시기 바랍니다.`);
                setIsAnalyzing(false);
            }, 2000);
        } catch (error) {
            console.error('AI 분석 오류:', error);
            setAiSummary('분석 중 오류가 발생했습니다. 다시 시도해주세요.');
            setIsAnalyzing(false);
        }
    };

    // 컴포넌트 마운트 시 AI 분석 실행
    React.useEffect(() => {
        getAiAnalysis();
    }, []);

    return (
        <>
            <Header title="상세 리포트" showBackButton={false} showHomeButton={false} />

            {/* 통계 카드 영역 */}
            <div style={{
                display: "flex",
                gap: 16,
                padding: "20px 20px 20px 20px"
            }}>
                <StatCard title="절감금액" value="24,300원" />
                <StatCard title="추천 사용률" value="68%" />
            </div>

            {/* 월 선택 영역 */}
            <div style={{
                padding: "20px 20px 10px 20px",
                display: "flex",
                justifyContent: "flex-start",
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

            {/* AI 분석 카드 영역 */}
            <div style={{
                padding: "20px 20px 30px 20px",
                display: "flex",
                justifyContent: "flex-start"
            }}>
                <div style={{
                    justifyContent: 'center',
                    display: 'flex',
                    flexDirection: 'column',
                    color: 'var(--theme-text)',
                    fontSize: 15.2,
                    fontFamily: 'inherit',
                    fontWeight: '800',
                    wordWrap: 'break-word'
                }}>
                    AI 요약
                </div>
            </div>

            <div style={{
                padding: "0px 20px 30px 20px",
                display: "flex",
                justifyContent: "center"
            }}>
                <AiSummaryCard
                    summary={aiSummary}
                    isLoading={isAnalyzing}
                />
            </div>

            {/* 최근 거래 영역 */}
            <div style={{
                padding: "0px 20px 10px 20px",
                display: "flex",
                justifyContent: "flex-start"
            }}>
                <div style={{
                    justifyContent: 'center',
                    display: 'flex',
                    flexDirection: 'column',
                    color: 'var(--theme-text)',
                    fontSize: 15.2,
                    fontFamily: 'inherit',
                    fontWeight: '800',
                    wordWrap: 'break-word'
                }}>
                    최근 거래
                </div>
            </div>

            <div style={{
                padding: "0px 20px 30px 20px",
                display: "flex",
                justifyContent: "center"
            }}>
                <RecentTransactionCard
                    transactions={recentTransactions}
                    title=""
                />
            </div>
        </>
    );
};

export default ReportPage;