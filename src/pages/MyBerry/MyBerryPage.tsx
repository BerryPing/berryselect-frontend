import React, { useEffect, useMemo, useState } from "react";
import styles from "./MyBerryPage.module.css";
import { Settings, ChevronRight } from 'lucide-react';
import berryLogo from "@/assets/imgs/berrylogo.png";
import { useNavigate } from "react-router-dom";

import Modal from "@/components/common/Modal";
import BudgetGoalForm from "./BudgetGoalForm";
// import type { Budget } from "./BudgetGoalForm";

import { fetchMyProfile, fetchBudget, type Budget } from "@/api/myberryApi.ts";

interface Props {
    displayName?: string;
}

const MyBerryPage: React.FC<Props> = ({displayName}) => {
    const navigate = useNavigate();

    const [name, setName] = useState<string>(
        displayName ?? localStorage.getItem("displayName") ?? "김베리"
    );

    const [budget, setBudget] = useState<Budget | null>(null);
    // 지난달 소비 금액 상태 추가
    const [lastMonthSpent, setLastMonthSpent] = useState<number | null>(null);
    // 모달 열림 상태
    const [isModalOpen, setIsModalOpen] = useState(false);
    //모달 열기/닫기 핸들러
    const openModal = () => setIsModalOpen(true);
    const closeModal = () => setIsModalOpen(false);

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

    // Esc로 닫기 + 배경 스크롤 잠금 (옵션)
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
        fetchBudget()
            .then((b) => setBudget(b))
            .catch((e) => console.error("budget fetch error:", e));
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

    // 설정 아이콘 누르면 이동하는 설정 페이지
    const goSettings = () => {
        navigate("/myberry/settings")
    };

    // 폼 저장 성공 시 : budget 생신 + 모달닫기
    const handleFormSaved = (saved: Budget) => {
        setBudget(saved);
        closeModal();
    };

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
        </div>
    );
};

export default MyBerryPage;
