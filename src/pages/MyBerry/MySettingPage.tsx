import React from "react";
import Header from "@/components/layout/Header";
import styles from "./MySettingPage.module.css";
import {
    getUserSettings,
    updateUserSettings,
    type UpdateUserSettingsRequest,
    type UserSettingsResponse,         // ⬅️ 서버 스냅샷 타입도 가져옵니다
} from "@/api/userApi";

export type NotificationSettings = {
    kakao: boolean;
    budgetOver: boolean;
    gifticonExpire: boolean;
    benefitEventChange: boolean;
};

function ToggleSwitch({
                          checked,
                          onChange,
                          srLabel,
                          disabled,
                      }: {
    checked: boolean;
    onChange: (next: boolean) => void;
    srLabel: string;
    disabled?: boolean;
}) {
    return (
        <button
            type="button"
            role="switch"
            aria-checked={checked}
            aria-label={srLabel}
            aria-disabled={disabled || undefined}
            className={styles.switch}
            onClick={() => !disabled && onChange(!checked)}
            onKeyDown={(e) => {
                if (e.key === " " || e.key === "Enter") {
                    e.preventDefault();
                    onChange(!checked);
                }
            }}
            style={disabled ? { opacity: 0.5, pointerEvents: "none" } : undefined}
        >
            <span className={styles.thumb} />
        </button>
    );
}

const MySettingPage = () => {
    // ✅ 서버에서 받은 “원본 스냅샷”을 따로 들고있습니다.
    const [server, setServer] = React.useState<UserSettingsResponse | null>(null);

    // ✅ 토글 값은 로딩이 끝난 뒤(DB 값)로만 세팅합니다.
    const [values, setValues] = React.useState<NotificationSettings | null>(null);

    const [loading, setLoading] = React.useState(true);
    const [saving, setSaving] = React.useState<
        Partial<Record<keyof NotificationSettings, boolean>>
    >({});
    const [saveError, setSaveError] = React.useState<null | string>(null);

    React.useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const s = await getUserSettings();
                if (cancelled) return;

                setServer(s);
                setValues({
                    kakao: !!s.allowKakaoAlert,
                    budgetOver: !!s.warnOverBudget,
                    gifticonExpire: !!s.gifticonExpireAlert,
                    benefitEventChange: !!s.eventAlert,
                });
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, []);

    // ✅ 현재 화면 상태 + 서버 스냅샷을 합쳐 “전체 페이로드”를 만듭니다.
    function buildFullPayload(nextVals: NotificationSettings): UpdateUserSettingsRequest {
        return {
            allowKakaoAlert: nextVals.kakao,
            warnOverBudget: nextVals.budgetOver,
            gifticonExpireAlert: nextVals.gifticonExpire,
            eventAlert: nextVals.benefitEventChange,
            // UI에 안 보이는 필드도 서버값을 유지해서 함께 보냅니다.
            marketingOptIn: server?.marketingOptIn ?? false,
            preferredCategories: server?.preferredCategories ?? [],
        };
    }

    const handleToggle = async (key: keyof NotificationSettings, next: boolean) => {
        if (!values) return;

        setSaveError(null);
        const prev = values;
        const nextValues = { ...values, [key]: next };

        setValues(nextValues);
        setSaving((s) => ({ ...s, [key]: true }));

        try {
            // ✅ 부분이 아닌 “전체 스냅샷”으로 PUT
            const saved = await updateUserSettings(buildFullPayload(nextValues));
            setServer(saved); // 서버가 돌려준 최신값 저장
            // 서버 응답으로 다시 동기화(혹시 서버에서 보정한 값이 있으면 맞춰줌)
            setValues({
                kakao: !!saved.allowKakaoAlert,
                budgetOver: !!saved.warnOverBudget,
                gifticonExpire: !!saved.gifticonExpireAlert,
                benefitEventChange: !!saved.eventAlert,
            });
        } catch (e) {
            console.warn("[settings] update failed : ", e);
            setSaveError("저장에 실패했어요. 잠시 후 다시 시도해주세요.");
            setValues(prev); // 실패 시 롤백
        } finally {
            setSaving((s) => ({ ...s, [key]: false }));
        }
    };

    // ✅ 로딩이 끝나기 전에는 DB값이 없으니 토글을 보여주지 않습니다.
    if (loading || !values) {
        return (
            <div className={styles.page}>
                <Header title="회원 설정" showBackButton={false} showHomeButton={false} />
                <div className={styles.card}>
                    <h2 className={styles.title}>알림 설정</h2>
                    <div className={styles.list}>
                        <div className={styles.row}>불러오는 중…</div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.page}>
            <Header title="회원 설정" showBackButton={false} showHomeButton={false} />

            <div className={styles.card}>
                <h2 className={styles.title}>알림 설정</h2>

                <div className={styles.list}>
                    <div className={styles.row}>
                        <span className={styles.label}>카카오톡 알림</span>
                        <ToggleSwitch
                            checked={values.kakao}
                            onChange={(v) => handleToggle("kakao", v)}
                            srLabel="카카오톡 알림"
                            disabled={!!saving.kakao}
                        />
                    </div>

                    <div className={styles.row}>
                        <span className={styles.label}>예산 초과 경고</span>
                        <ToggleSwitch
                            checked={values.budgetOver}
                            onChange={(v) => handleToggle("budgetOver", v)}
                            srLabel="예산 초과 경고"
                            disabled={!!saving.budgetOver}
                        />
                    </div>

                    <div className={styles.row}>
                        <span className={styles.label}>기프티콘 만료</span>
                        <ToggleSwitch
                            checked={values.gifticonExpire}
                            onChange={(v) => handleToggle("gifticonExpire", v)}
                            srLabel="기프티콘 만료"
                            disabled={!!saving.gifticonExpire}
                        />
                    </div>

                    <div className={styles.row}>
                        <span className={styles.label}>혜택 이벤트 변동</span>
                        <ToggleSwitch
                            checked={values.benefitEventChange}
                            onChange={(v) => handleToggle("benefitEventChange", v)}
                            srLabel="혜택 이벤트 변동"
                            disabled={!!saving.benefitEventChange}
                        />
                    </div>
                </div>

                {saveError && <div className={styles.errorText}>{saveError}</div>}

                <h3 className={`${styles.title} ${styles.sectionTitle}`}>회원 설정</h3>

                <div className={styles.actions}>
                    <button className={styles.actionBtn} onClick={() => alert("로그아웃")}>
                        로그아웃
                    </button>
                    <button className={styles.actionBtn} onClick={() => alert("회원탈퇴")}>
                        회원탈퇴
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MySettingPage;
