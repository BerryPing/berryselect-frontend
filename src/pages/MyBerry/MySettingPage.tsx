import React from 'react';
import Header from '@/components/layout/Header';
import styles from './MySettingPage.module.css';

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
                      }: {
    checked: boolean;
    onChange: (next: boolean) => void;
    srLabel: string;
}) {
    return (
        <button
            type="button"
            role="switch"
            aria-checked={checked}
            aria-label={srLabel}
            className={styles.switch}
            onClick={() => onChange(!checked)}
            onKeyDown={(e) => {
                if (e.key === ' ' || e.key === 'Enter') {
                    e.preventDefault();
                    onChange(!checked);
                }
            }}
        >
            <span className={styles.thumb} />
        </button>
    );
}

const MySettingPage = () => {
    const [values, setValues] = React.useState<NotificationSettings>({
        kakao: true,
        budgetOver: true,
        gifticonExpire: true,
        benefitEventChange: false,
    });

    const setField = (k: keyof NotificationSettings, v: boolean) =>
        setValues((prev) => ({ ...prev, [k]: v }));

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
                            onChange={(v) => setField('kakao', v)}
                            srLabel="카카오톡 알림"
                        />
                    </div>

                    <div className={styles.row}>
                        <span className={styles.label}>예산 초과 경고</span>
                        <ToggleSwitch
                            checked={values.budgetOver}
                            onChange={(v) => setField('budgetOver', v)}
                            srLabel="예산 초과 경고"
                        />
                    </div>

                    <div className={styles.row}>
                        <span className={styles.label}>기프티콘 만료</span>
                        <ToggleSwitch
                            checked={values.gifticonExpire}
                            onChange={(v) => setField('gifticonExpire', v)}
                            srLabel="기프티콘 만료"
                        />
                    </div>

                    <div className={styles.row}>
                        <span className={styles.label}>혜택 이벤트 변동</span>
                        <ToggleSwitch
                            checked={values.benefitEventChange}
                            onChange={(v) => setField('benefitEventChange', v)}
                            srLabel="혜택 이벤트 변동"
                        />
                    </div>
                </div>

                <h3 className={`${styles.title} ${styles.sectionTitle}`}>회원 설정</h3>

                <div className={styles.actions}>
                    <button className={styles.actionBtn} onClick={() => alert('로그아웃')}>
                        로그아웃
                    </button>
                    <button className={styles.actionBtn} onClick={() => alert('회원탈퇴')}>
                        회원탈퇴
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MySettingPage;