// src/pages/ReportPage/ReportPage.tsx
import { useState, useEffect } from "react";
import Header from "@/components/layout/Header.tsx";
import StatCard from "@/components/report/StatCard.tsx";
import MonthNavigator from "@/components/report/MonthNavigator.tsx";
import DonutChart from "@/components/report/DonutSection/DonutChart.tsx";
import AiSummaryCard from "@/components/report/AiSummaryCard.tsx";
import RecentTransactionCard from "@/components/report/Transaction/RecentTransactionCard.tsx";
import {getReportPageData, formatYearMonth} from "@/api/reportApi.ts";
import type {ReportPageData} from "@/types/report";

const ReportPage = () => {
    const [reportData, setReportData] = useState<ReportPageData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedDate, setSelectedDate] = useState(new Date());

    // 리포트 데이터 조회 함수 (JWT 인증과 토큰 갱신은 http.ts에서 자동 처리)
    const fetchReportData = async (year: number, month: number) => {
        setLoading(true);
        setError(null);

        try {
            const yearMonth = formatYearMonth(new Date(year, month - 1, 1));
            console.log(`리포트 데이터 조회: ${yearMonth}`);

            // http.ts의 axios interceptor가 JWT 토큰과 갱신을 자동 처리
            const data = await getReportPageData(yearMonth);
            setReportData(data);
            setSelectedDate(new Date(year, month - 1, 1));

        } catch (error: unknown) {
            console.error('리포트 데이터 로딩 실패:', error);

            // axios 에러 처리
            if (error && typeof error === 'object' && 'response' in error) {
                const axiosError = error as { response?: { status?: number } };
                if (axiosError.response?.status === 401) {
                    // http.ts에서 이미 토큰 갱신을 시도했지만 실패한 경우
                    // 자동으로 로그인 페이지로 리다이렉트됨
                    setError('인증이 만료되었습니다. 로그인 페이지로 이동합니다.');
                } else if (axiosError.response?.status && axiosError.response.status >= 500) {
                    setError('서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
                } else {
                    setError('데이터를 불러오는 중 오류가 발생했습니다.');
                }
            } else {
                setError('데이터를 불러오는 중 오류가 발생했습니다.');
            }
        } finally {
            setLoading(false);
        }
    };

    // 월 변경 핸들러
    const handleMonthChange = (year: number, month: number) => {
        fetchReportData(year, month);
    };

    // 재시도 핸들러
    const handleRetry = () => {
        const currentYear = selectedDate.getFullYear();
        const currentMonth = selectedDate.getMonth() + 1;
        fetchReportData(currentYear, currentMonth);
    };

    // 컴포넌트 마운트 시 현재 월 데이터 로드
    useEffect(() => {
        const currentDate = new Date();
        fetchReportData(currentDate.getFullYear(), currentDate.getMonth() + 1);
    }, []);

    // reportData에서 필요한 데이터 추출
    const selectedMonth = `${selectedDate.getMonth() + 1}월`; // MonthNavigator가 기대하는 string 형태로 변환

    // CategorySpendingData를 DonutChart용 CategoryData로 변환
    const categoryData = (reportData?.monthlyReport?.categorySpending || []).map(item => ({
        name: item.categoryName,
        value: item.totalAmount,
        color: item.color
    }));

    const totalAmount = reportData?.monthlyReport?.totalSpending || 0;
    const aiSummary = reportData?.aiAnalysis?.summary || '';
    const isAnalyzing = false; // AI 분석은 이미 완료된 상태로 가정
    const recentTransactions = reportData?.monthlyReport?.recentTransactions || [];

    // StatCard용 데이터
    const savedAmountValue = reportData?.stats?.savedAmount?.value || '0원';
    const usageRateValue = reportData?.stats?.usageRate?.value || '0%';

    // 로딩 상태
    if (loading) {
        return (
            <>
                <Header title="상세 리포트" showBackButton={false} showHomeButton={false} />
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    minHeight: '200px',
                    color: 'var(--theme-text-light)',
                    fontFamily: 'inherit'
                }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12
                    }}>
                        <div style={{
                            width: 20,
                            height: 20,
                            border: '2px solid var(--theme-secondary)',
                            borderTop: '2px solid var(--theme-primary)',
                            borderRadius: '50%',
                            animation: 'spin 1s linear infinite'
                        }} />
                        데이터를 불러오는 중...
                    </div>
                </div>
                <style>{`
                    @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                `}</style>
            </>
        );
    }

    // 에러 상태
    if (error || !reportData) {
        return (
            <>
                <Header title="상세 리포트" showBackButton={false} showHomeButton={false} />
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    minHeight: '200px',
                    color: 'var(--theme-text-light)',
                    gap: 16,
                    padding: 20,
                    fontFamily: 'inherit'
                }}>
                    <div style={{ textAlign: 'center' }}>
                        {error || '데이터를 불러올 수 없습니다.'}
                    </div>

                    {/* 재시도 버튼 (http.ts가 인증 오류를 자동 처리하므로 간소화) */}
                    <button
                        onClick={handleRetry}
                        style={{
                            padding: '12px 24px',
                            backgroundColor: 'var(--theme-primary)',
                            color: 'var(--color-white)',
                            border: 'none',
                            borderRadius: 8,
                            cursor: 'pointer',
                            fontFamily: 'inherit',
                            fontSize: 14,
                            fontWeight: '600',
                            transition: 'opacity 0.2s'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.opacity = '0.9';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.opacity = '1';
                        }}
                    >
                        다시 시도
                    </button>
                </div>
            </>
        );
    }

    return (
        <>
            <Header title="상세 리포트" showBackButton={false} showHomeButton={false} />

            {/* 통계 카드 영역 */}
            <div style={{
                display: "flex",
                gap: 16,
                padding: "20px 20px 20px 20px"
            }}>
                <StatCard title="절감금액" value={savedAmountValue} />
                <StatCard title="추천 사용률" value={usageRateValue} />
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