import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Auth.module.css";

import {updateUserSettings} from "@/api/userApi.ts";
import styled from "styled-components";

type RegisterRequest = {
    categories: string[];
    warnOverBudget: boolean;
    gifticonExpireAlert: boolean;
    eventAlert: boolean;
    agreeTerms: boolean;
    agreePrivacy: boolean;
    agreeKakaoAlert: boolean;
    agreeDataUsage: boolean;
    marketingOptIn: boolean;
    primaryCategory: string;
};

export default function RegisterPage(){

    const nav = useNavigate();

    const EMOJI: Record<string, string> = {
        카페: "☕",
        편의점: "🏪",
        교통: "🚗",
        쇼핑: "🛒",
        음식: "🍽️",
        기타: "✨",
    };

    // 카테고리 (최대 3개)
    const ALL = ["카페", "편의점", "교통", "쇼핑", "음식", "기타"];
    const [cats, setCats] = useState<string[]>([]);
    const toggleCat = (c: string) =>
        setCats((prev) =>
        prev.includes(c)
        ? prev.filter((x) => x !==c)
        : prev.length < 3
        ? [...prev, c]
        : prev);

    // 알림 토글
    const [warnOverBudget, setWarnOverBudget] = useState(true);
    const [gifticonExpireAlert, setGifticonExpireAlert] = useState(true);
    const [eventAlert, setEventAlert] = useState(false);

    // 동의
    const [agreeTerms, setAgreeTerms] = useState(false);
    const [agreePrivacy, setAgreePrivacy] = useState(false);
    const [agreeKakaoAlert, setAgreeKakaoAlert] = useState(false);
    const [agreeDataUsage, setAgreeDataUsage] = useState(false);
    const [marketingOptIn, setMarketingOptIn] = useState(false);

    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState<string | null>(null);

    const primaryCategory = useMemo(()=>cats[0] ?? "", [cats]);
    const canSubmit =
        agreeTerms && agreePrivacy && agreeKakaoAlert && agreeDataUsage && !loading;

    const submit = async()=>{
        setErr(null);
        if(!canSubmit){
            setErr("필수 동의를 모두 체크해 주세요");
            return;
        }
        const access = localStorage.getItem("accessToken");
        if(!access){
            setErr("세션이 만료됐습니다. 다시 로그인해주세요.");
            nav("/auth/login", {replace : true});
            return;
        }

        setLoading(true);

        try{
            // 1) 온보딩 본등록
            const body : RegisterRequest = {
                categories : cats,
                warnOverBudget,
                gifticonExpireAlert,
                eventAlert,
                agreeTerms,
                agreePrivacy,
                agreeKakaoAlert,
                agreeDataUsage,
                marketingOptIn,
                primaryCategory,
            };

            const res = await fetch(
                `${import.meta.env.VITE_API_BASE_URL}/auth/register`,
                {
                    method : "POST",
                    headers : {
                        "Content-Type" : "application/json",
                        Authorization : `Bearer ${access}`, // 임시 guest토큰
                    },
                    body : JSON.stringify(body),
                }
            );

            if(!res.ok){
                if (res.status === 401) throw new Error("온보딩 유효시간이 만료됐습니다. 다시 로그인해주세요.");
                if (res.status === 409) throw new Error("이미 가입된 사용자입니다. 홈으로 이동합니다.");
                throw new Error("온보딩 완료에 실패했습니다.");
            }

            // 2) 정식 AuthResult 수신 -> 토큰 교체
            const data: { accessToken: string; refreshToken?: string | null } =
                await res.json();
            localStorage.setItem("accessToken", data.accessToken);
            if (data.refreshToken) localStorage.setItem("refreshToken", data.refreshToken);
            else localStorage.removeItem("refreshToken");

            // 3) 가입 직후 설정을 표준 엔드포인트(/users/me/settings)로 동기화
            try {
                await updateUserSettings({
                    preferredCategories: cats,
                    warnOverBudget,
                    gifticonExpireAlert,
                    eventAlert,
                    allowKakaoAlert: agreeKakaoAlert,
                    marketingOptIn,
                });
            } catch (syncErr) {
                console.warn("settings 동기화 실패(온보딩은 계속 진행):", syncErr);
            }

            // 4) 홈으로 이동
            nav("/", { replace : true});
        }
        catch (e: unknown) {
            const message = e instanceof Error ? e.message : String(e);
            setErr(message || "오류가 발생했습니다.");
        }
        finally {
            setLoading(false);
        }
    };

    // Header4Auth 고정 스타일
    const AuthHeaderWrapper = styled.header`
      position: sticky;     
      top: 0;
      z-index: 10;
    
      width: 100%;
      max-width: 24rem;
      background-color: var(--theme-primary);
    
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    
      height: 141px;
      gap: 8px;
    `;

    const Brand = styled.h1`
      font-size: 32px;
      font-weight: 600;
      font-family: Inter, sans-serif;
      color: var(--slogan-gray);
      margin: 0;
      width: 100%;
      text-align: center;
    `;

    const Slogan = styled.p`
      font-size: 14.4px;
      font-weight: 500;
      font-family: Roboto, sans-serif;
      color: var(--slogan-gray);
      margin: 0;
      width: 100%;
      text-align: center;
    `;

    return (
        <div>
            <AuthHeaderWrapper>
                <Brand>berryselect</Brand>
                <Slogan>내 지갑 속 딱 맞는 결제 순간</Slogan>
            </AuthHeaderWrapper>

            {/* 카테고리(최대 3) */}
            <section className={styles.categorySection}>
                <div className={styles.categoryTitle}>
                    주요 소비 카테고리 선택 (최대 3개)
                </div>

                <div className={styles.categoryWrap}>
                    {ALL.map((c) => (
                        <button
                            key={c}
                            type="button"
                            onClick={() => toggleCat(c)}
                            className={`${styles.categoryButton} ${
                                cats.includes(c) ? styles.categoryButtonSelected : ""
                            }`}
                        >
                            <span style={{ marginRight: "4px" }}>{EMOJI[c]}</span>
                            {c}
                        </button>
                    ))}
                </div>

            </section>

            {/* 알림 설정 */}
            <section className={styles.noticeSection}>
                <div className={styles.noticeTitle}>카카오톡 알림 설정</div>

                <Toggle
                    label="예산 초과 경고"
                    caption="월 예산의 80% 초과시"
                    value={warnOverBudget}
                    onChange={setWarnOverBudget}
                />

                <Toggle
                    label="기프티콘 만료 알림"
                    caption="만료 3일 전 알림"
                    value={gifticonExpireAlert}
                    onChange={setGifticonExpireAlert}
                />

                <Toggle
                    label="혜택 이벤트 알림"
                    caption="새로운 할인 혜택"
                    value={eventAlert}
                    onChange={setEventAlert}
                />
            </section>

            {/* 동의 */}
            <section className={styles.consentSection}>
                <Check
                    label="서비스 이용약관에 동의합니다 (필수)"
                    value={agreeTerms}
                    onChange={setAgreeTerms}
                />
                <Check
                    label="개인정보 처리방침에 동의합니다 (필수)"
                    value={agreePrivacy}
                    onChange={setAgreePrivacy}
                />
                <Check
                    label="카카오톡 알림 수신에 동의합니다 (필수)"
                    caption="결제 알림, 예산 경고, 기프티콘 만료 등"
                    value={agreeKakaoAlert}
                    onChange={setAgreeKakaoAlert}
                />
                <Check
                    label="마이데이터 수집에 동의합니다 (필수)"
                    value={agreeDataUsage}
                    onChange={setAgreeDataUsage}
                />
                <Check
                    label="마케팅 정보 수신에 동의합니다 (선택)"
                    value={marketingOptIn}
                    onChange={setMarketingOptIn}
                />
            </section>

            {err && <div className="text-sm text-red-600">{err}</div>}

            <button
                type="button"
                onClick={submit}
                disabled={!canSubmit}
                className={`${styles.primaryAction} ${!canSubmit ? styles.primaryActionDisabled : ""}`}
            >
                베리셀렉트 시작하기
            </button>
        </div>
    );
}

function Toggle({
                    label,
                    caption,
                    value,
                    onChange,
                }: {
    label: string;
    caption?: string;
    value: boolean;
    onChange: (v: boolean) => void;
}) {
    return (
        <>
            <label className={styles.toggleRow}>
                <div className={styles.toggleText}>
                    <span className={styles.toggleLabel}>{label}</span>
                    {caption && <span className={styles.toggleCaption}>{caption}</span>}
                </div>
                <input
                    type="checkbox"
                    className={styles.switch}
                    checked={value}
                    onChange={(e) => onChange(e.target.checked)}
                />
            </label>
            <div className={styles.toggleDivider} />
        </>
    );
}

function Check({
                   label,
                   caption,
                   value,
                   onChange,
               }: {
    label: string;
    caption?: string;
    value: boolean;
    onChange: (v: boolean) => void;
}) {
    return (
        <label className={styles.consentRow}>
            <input
                type="checkbox"
                className={styles.check}
                checked={value}
                onChange={(e) => onChange(e.target.checked)}
            />
            <div className={styles.consentText}>
                <span className={styles.consentLabel}>{label}</span>
                {caption && <span className={styles.consentCaption}>{caption}</span>}
            </div>
        </label>
    );
}
