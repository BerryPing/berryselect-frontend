import React, { useEffect, useMemo, useState } from "react";
import styles from "./MyBerryPage.module.css";
import { Settings, ChevronRight, BarChart3 } from 'lucide-react';
import berryLogo from "@/assets/imgs/berrylogo.png";
import { useNavigate } from "react-router-dom";

import Modal from "@/components/common/Modal";
import BudgetGoalForm from "./BudgetGoalForm";
import StatCard from "@/components/report/StatCard.tsx";
import DonutChart from "@/components/report/DonutSection/DonutChart.tsx";

import { fetchMyProfile, fetchBudget, type Budget } from "@/api/myberryApi.ts";
import { getReportPageData, formatYearMonth } from "@/api/reportApi.ts";
import type { ReportPageData } from "@/types/report";
import Button from "@/components/common/Button.tsx";

interface Props {
    displayName?: string;
}

const MyBerryPage: React.FC<Props> = ({displayName}) => {
    const navigate = useNavigate();

    const [name, setName] = useState<string>(
        displayName ?? localStorage.getItem("displayName") ?? "김베리"
    );

    const [budget, setBudget] = useState<Budget | null>(null);
    const [lastMonthSpent, setLastMonthSpent] = useState<number | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // 리포트 미리보기용 상태 추가
    const [reportData, setReportData] = useState<ReportPageData | null>(null);
    const [reportLoading, setReportLoading] = useState(true);
    const [reportError, setReportError] = useState<string | null>(null);

    const openModal = () => setIsModalOpen(true);
    const closeModal = () => setIsModalOpen(false);

    // 리포트 데이터 조회
    const fetchReportPreview = async () => {
        try {
            setReportLoading(true);
            setReportError(null);

            const currentDate = new Date();
            const yearMonth = formatYearMonth(currentDate);

            const data = await getReportPageData(yearMonth);
            setReportData(data);
        } catch (error) {
            console.error('리포트 미리보기 데이터 조회 실패:', error);
            setReportError('리포트 데이터를 불러올 수 없습니다.');
        } finally {
            setReportLoading(false);
        }
    };

    // 프로필 가져오기
    useEffect(() => {
        fetchMyProfile()
            .then((profile) => {
                const display =
                    profile.name && profile.name.trim() ? profile.name : "김베리";
                setName(display);
                localStorage.setItem("displayName", display);
            })
            .catch((e) => {
                console.warn("profile fetch error:", e);
            });
    }, []);

    // Esc로 닫기 + 배경 스크롤 잠금
    useEffect(() => {
        const onKeyDown = (e: KeyboardEvent) => e.key === "Escape" && closeModal();
        if (isModalOpen) {
            document.addEventListener("keydown", onKeyDown);
            document.body.style.overflow = "hidden";
        }
        return () => {
            document.removeEventListener("keydown", onKeyDown);
            document.body.style.overflow = "";
        };
    }, [isModalOpen]);

    // 진행률 계산
    const progress = useMemo(() => {
        if (!budget) return 0;
        const { amountTarget, amountSpent } = budget;
        if (amountTarget <= 0) return 0;
        const pct = Math.min(100, Math.max(0, (amountSpent / amountTarget) * 100));
        return Math.round(pct);
    }, [budget]);

    // 이번 달 예산 가져오기
    useEffect(() => {
        Promise.all([
            fetchBudget(),
            fetchReportPreview()
        ]).then(([budgetResult]) => {
            setBudget(budgetResult);
        }).catch((e) => {
            console.error("data fetch error:", e);
        });
    }, []);

    // 지난달 예산 가져오기 (모달 열릴 때)
    useEffect(() => {
        if (!isModalOpen) return;

        const d = new Date();
        d.setMonth(d.getMonth() - 1);
        const ym = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;

        fetchBudget(ym)
            .then((b) =>
                setLastMonthSpent(typeof b.amountSpent === "number" ? b.amountSpent : null),
            )
            .catch((err) => {
                console.error("last-month fetch error:", err);
                setLastMonthSpent(null);
            });
    }, [isModalOpen]);

    // 설정 페이지 이동
    const goSettings = () => {
        navigate("/myberry/settings")
    };

    // 상세 리포트 페이지 이동
    const goDetailReport = () => {
        navigate("/report");
    };

    // 폼 저장 성공 시
    const handleFormSaved = (saved: Budget) => {
        setBudget(saved);
        closeModal();
    };

    // 리포트 데이터에서 미리보기용 데이터 추출
    const previewData = useMemo(() => {
        if (!reportData) return null;

        const categoryData = (reportData.monthlyReport?.categorySpending || []).slice(0, 4).map(item => ({
            name: item.categoryName,
            value: item.totalAmount,
            color: item.color
        }));

        return {
            savedAmountValue: reportData.stats?.savedAmount?.value || '0원',
            usageRateValue: reportData.stats?.usageRate?.value || '0%',
            categoryData,
            totalAmount: reportData.monthlyReport?.totalSpending || 0,
            aiSummary: reportData.aiAnalysis?.summary || ''
        };
    }, [reportData]);

    return (
        <div className={styles.hh}>
            {/* 헤더 */}
            <header className={styles.header}>
                <h1 className={styles.title}>마이베리</h1>
                <button className={styles.iconButton} aria-label="설정" onClick={goSettings}>
                    <Settings />
                </button>
            </header>

            <div className={styles.page}>
                {/* 인사 영역 */}
                <section className={styles.greeting}>
                    <div className={styles.helloEmoji} aria-hidden>
                        <img src={berryLogo} alt="" className={styles.helloEmojiImg} />
                    </div>
                    <div className={styles.greetText}>
                        <p className={styles.hello}>안녕하세요!</p>
                        <p className={styles.username}>{name}님</p>
                    </div>
                </section>

                {/* 예산 카드 */}
                <section className={styles.card}>
                    <div className={styles.cardHead}>
                        <span className={styles.cardTitle}>이번 달 소비 목표</span>
                        <button
                            type="button"
                            className={styles.chevronBtn}
                            onClick={openModal}
                            aria-label="목표 설정 모달 열기"
                        >
                            <ChevronRight className={styles.chevronIcon} />
                        </button>
                    </div>

                    <div className={styles.rows}>
                        <div className={styles.row}>
                            <span className={styles.label}>목표 : </span>
                            <span className={styles.value}>
                                {budget ? budget.amountTarget.toLocaleString() : "-"}원 이내 사용
                            </span>
                        </div>
                        <div className={styles.row}>
                            <span className={styles.label}>남은 금액 : </span>
                            <span
                                className={`${styles.value} ${budget?.exceeded ? styles.danger : ""}`}
                            >
                                {budget ? budget.amountRemaining.toLocaleString() : "-"}원
                            </span>
                        </div>
                    </div>

                    {/* 진행바 */}
                    <div className={styles.progressWrap} aria-label="예산 사용률">
                        <div className={styles.progressTrack}>
                            <div
                                className={`${styles.progressBar} ${budget?.exceeded ? styles.progressOver : ""}`}
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                        <span className={styles.progressPct}>{progress}%</span>
                    </div>

                    <div className={styles.helper}>
                        {budget
                            ? `이번달 사용할 수 있는 금액이 ${budget.amountRemaining.toLocaleString()}원 남았어요`
                            : "이번 달 목표를 설정해 주세요"}
                    </div>
                </section>

                {/* 리포트 미리보기 섹션 */}
                <section className={styles.card} style={{ marginTop: '24px' }}>
                    <div className={styles.cardHead}>
                        <span className={styles.cardTitle}>이번 달 소비 리포트</span>
                    </div>

                    {reportLoading ? (
                        <div style={{
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            minHeight: '120px',
                            color: 'var(--theme-text-light)',
                            fontSize: '14px'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <div style={{
                                    width: 16,
                                    height: 16,
                                    border: '2px solid var(--theme-secondary)',
                                    borderTop: '2px solid var(--theme-primary)',
                                    borderRadius: '50%',
                                    animation: 'spin 1s linear infinite'
                                }} />
                                리포트 로딩 중...
                            </div>
                        </div>
                    ) : reportError || !previewData ? (
                        <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            alignItems: 'center',
                            minHeight: '120px',
                            color: 'var(--theme-text-light)',
                            fontSize: '14px',
                            gap: 12
                        }}>
                            <div>{reportError || '리포트 데이터가 없습니다.'}</div>
                            <button
                                onClick={fetchReportPreview}
                                style={{
                                    padding: '6px 12px',
                                    backgroundColor: 'var(--theme-primary)',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    fontSize: '12px',
                                    cursor: 'pointer'
                                }}
                            >
                                다시 시도
                            </button>
                        </div>
                    ) : (
                        <>
                            {/* 통계 카드 미리보기 */}
                            <div style={{
                                display: 'flex',
                                gap: '10px',
                                marginBottom: '20px',
                                marginLeft: '-8px',
                            }}>
                                <div style={{ flex: 1 }}>
                                    <StatCard
                                        title="절감금액"
                                        value={previewData.savedAmountValue}
                                    />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <StatCard
                                        title="추천 사용률"
                                        value={previewData.usageRateValue}
                                    />
                                </div>
                            </div>

                            {/* 도넛차트 미리보기 */}
                            {previewData.categoryData.length > 0 && (
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'center',
                                    marginBottom: '20px',
                                }}>
                                    <DonutChart
                                        data={previewData.categoryData}
                                        size={150}
                                    />
                                </div>
                            )}

                            {/* 상세 리포트 보기 버튼 */}
                            <div style={{
                                display: 'flex',
                                justifyContent: 'center',
                                marginTop: '16px'
                            }}>
                                <Button
                                    onClick={goDetailReport}
                                    variant="purple"
                                    fullWidth
                                >
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px'
                                    }}>
                                        <BarChart3 size={16} />
                                        상세 리포트 보기
                                    </div>
                                </Button>
                            </div>
                        </>
                    )}
                </section>
            </div>

            {/* 모달 */}
            <Modal open={isModalOpen} onClose={closeModal}>
                <div
                    style={{
                        display: "grid",
                        gap: "0.75rem",
                        maxHeight: "70vh",
                        overflowY: "auto",
                        paddingBottom: "0.25rem",
                    }}
                >
                    <BudgetGoalForm
                        initialTarget={budget?.amountTarget ?? 0}
                        lastMonthSpentHint={lastMonthSpent ?? undefined}
                        onSaved={handleFormSaved}
                        compact
                    />
                </div>
            </Modal>

            {/* 스피너 애니메이션 */}
            <style>{`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
};

export default MyBerryPage;
