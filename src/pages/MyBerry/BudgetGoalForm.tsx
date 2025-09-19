// src/pages/MyBerry/BudgetGoalForm.tsx
import React, { useMemo, useState } from "react";
import styles from "./BudgetGoalForm.module.css";
import { upsertBudget, type Budget } from "@/api/myberryApi";


type Props = {
    /** 모달 열렸을 때 기본값으로 보여줄 금액 (선택) */
    initialTarget?: number;
    /** “지난달 소비 금액” 힌트 (선택, 없으면 문구 숨김) */
    lastMonthSpentHint?: number;
    /** 저장 성공 시 상위에서 budget 갱신 */
    onSaved?: (saved: Budget) => void;
    onCancel?: () => void;
    /** 모달에서 여백/폰트 축소 */
    compact?: boolean;
};

const BudgetGoalForm: React.FC<Props> = ({
                                             initialTarget = 0,
                                             lastMonthSpentHint,
                                             onSaved,
                                             onCancel,
                                             compact,
                                         }) => {
    // 이번 달 YYYY-MM
    const now = useMemo(() => new Date(), []);
    const yearMonth = useMemo(() => {
        const y = now.getFullYear();
        const m = String(now.getMonth() + 1).padStart(2, "0");
        return `${y}-${m}`;
    }, [now]);

    // 헤더 표시용 : 2025년 9월
    const titleYM = useMemo(()=>{
        const y = now.getFullYear();
        const m = now.getMonth() + 1;
        return `${y}년 ${m}월`;
    }, [now]);

    const [amountTarget, setAmountTarget] = useState<number>(initialTarget);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (amountTarget <= 0) {
            setError("목표 금액은 1원 이상이어야 해요.");
            return;
        }

        try {
            setSaving(true);
            const saved = await upsertBudget(yearMonth, amountTarget);
            onSaved?.(saved);
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : String(err);
            setError(msg || "저장 중 오류가 발생했어요.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <form
            onSubmit={handleSubmit}
            className={`${styles.card} ${compact ? styles.compact : ""}`}
        >
            {/* 헤더 */}
            <div className={styles.header}>{titleYM} 소비 목표 설정</div>

            {/* 본문 */}
            <div className={styles.body}>
                <div className={styles.centerBlock}>
                    <div className={styles.labelStrong}>목표 금액</div>
                    <div className={styles.helperText}>
                        예산을 설정하고 계획적으로 관리해 보세요.
                    </div>
                </div>

                {/* 금액 입력 + 단위 “원” */}
                <div className={styles.amountRow}>
                    <input
                        className={styles.amountInput}
                        inputMode="numeric"
                        pattern="[0-9]*"
                        value={amountTarget ? String(amountTarget) : ""}
                        onChange={(e) => {
                            const raw = e.target.value.replace(/[^\d]/g, "");
                            setAmountTarget(raw ? parseInt(raw, 10) : 0);
                        }}
                    />
                    <span className={styles.won}>원</span>
                </div>

                {/* 구분선 */}
                <div className={styles.divider} />

                {/* 지난달 소비 금액 힌트 (항상 렌더) */}
                <div className={styles.lastMonthHint}>
                    지난달 소비 금액 :{" "}
                    {typeof lastMonthSpentHint === "number"
                        ? lastMonthSpentHint.toLocaleString()
                        : "-"}
                    원
                </div>

                {/* 오류 */}
                {error && (
                    <div role="alert" className={styles.error}>
                        {error}
                    </div>
                )}
            </div>

            {/* 하단 버튼 */}
            <div className={styles.footer}>
                <button
                    type="submit"
                    disabled={saving}
                    className={styles.submitBtn}
                >
                    {saving ? "저장 중..." : "목표 설정"}
                </button>
                {onCancel && (
                    <button type="button" onClick={onCancel} className={styles.cancelBtn}>
                        취소
                    </button>
                )}
            </div>
        </form>
    );
};

export default BudgetGoalForm;