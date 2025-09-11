import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import type { UIEventHandler, TouchEventHandler, WheelEventHandler } from "react";
import SectionBox from "@/components/common/SectionBox";
import Button from "@/components/common/Button";
import Modal from "@/components/common/Modal";
import CardItem from "@/components/wallet/CardItem";
import JsBarcode from "jsbarcode";
import styles from "./WalletPage.module.css";
import { getMemberships, getGifticons, createMembership, type Membership, type Gifticon } from "@/api/walletApi";
import { MEMBERSHIP_META, MEMBERSHIP_URL, TELCO_META, TELCO_URL, type TelcoLabel, MEMBERSHIP_BENEFITS } from "@/components/wallet/MembershipCatalog";

/* ---------------------------------------------
 * Local types
 * -------------------------------------------*/
type BackendMembership = Membership & {
    membershipNumber?: string | null;
    externalNo?: string | null;
    point?: number | string | null;
};

type MembershipMeta = {
    imgUrl?: string;
    cardBg?: string;
    logoUrl?: string;
    textColor?: string;
};

type CtxWithReset = CanvasRenderingContext2D & { reset?: () => void };

/** 카탈로그 메타 안전 접근 */
const MEMBERSHIP_META_MAP = MEMBERSHIP_META as Record<string, MembershipMeta>;
const TELCO_META_MAP = TELCO_META as Record<TelcoLabel, { imgUrl?: string; logoUrl?: string }>;
const BARCODE_HEIGHT = 64 as const;

/* ---------------------------------------------
 * DB productId 매핑
 * -------------------------------------------*/
const PRODUCT_ID: Partial<Record<string, number>> = {
    "L.POINT": 11,
    "GS&POINT": 12,
    "해피포인트": 15,
    "OK캐쉬백": 16,
    "CJONE": 17,
    "S-OIL 포인트": 18,
};
const TELCO_PRODUCT_ID: Partial<Record<TelcoLabel, number>> = {
    KT: 10,
};

/* ---------------------------------------------
 * Helpers
 * -------------------------------------------*/
function openExternal(url?: string) {
    if (!url) return;
    window.open(url, "_blank", "noopener,noreferrer");
}

function computeActiveIndex(container: HTMLDivElement): number {
    const cards = Array.from(container.querySelectorAll<HTMLDivElement>('[data-card-slot="1"]'));
    if (cards.length === 0) return 0;
    const rect = container.getBoundingClientRect();
    const center = rect.left + rect.width / 2;
    let best = 0;
    let bestDist = Number.POSITIVE_INFINITY;
    cards.forEach((el, idx) => {
        const r = el.getBoundingClientRect();
        const c = r.left + r.width / 2;
        const d = Math.abs(c - center);
        if (d < bestDist) {
            bestDist = d;
            best = idx;
        }
    });
    return best;
}

function membershipDisplayName(m?: Membership): string {
    if (!m) return "멤버십";
    return m.program ?? "멤버십";
}

const isTelcoProgram = (p?: string) => p === "KT 멤버십" || p === "SKT 멤버십" || p === "LG U+ 멤버십";

function getExternalNo(m: BackendMembership): string {
    return String(m.membershipNumber ?? m.externalNo ?? "");
}

function isOwnedMembership(m: Membership): boolean {
    const program = m.program ?? "";
    if (!isTelcoProgram(program)) return true;
    return getExternalNo(m as BackendMembership).trim().length > 0;
}

/** 키 정규화(카탈로그/혜택 공용) */
function normalizeProgramKey(name?: string): string | null {
    if (!name) return null;
    const t = name.trim().toUpperCase().replace(/\s+|-/g, "");
    if (t.includes("GS25")) return "GS&POINT";
    if (t === "LPOINT" || t === "L.POINT") return "L.POINT";
    if (t.includes("엘포인트")) return "L.POINT";
    if (t.includes("해피포인트")) return "해피포인트";
    if (t.includes("OK") && (t.includes("캐쉬") || t.includes("캐시") || t.includes("CASH") || t.includes("CASHBAG")))
        return "OK캐쉬백";
    if (t.includes("CJ") && t.includes("ONE")) return "CJONE";
    if (t.includes("S") && t.includes("OIL")) return "S-OIL 포인트";
    return Object.prototype.hasOwnProperty.call(MEMBERSHIP_META_MAP, name) ? name : null;
}

/* ===== 혜택 섹션 유틸 ===== */
type BenefitSection = { label: string; lines: string[] };

type CatalogBenefit = {
    title?: string;
    brand?: string;
    detail?: string;
    rate?: number;
    amount?: number;
    limit?: string;
    days?: string[];
    time?: string;
    notes?: string;
};

type BenefitSectionsShape = {
    sections: { label: string; lines: string[] }[];
};

type BenefitsByKey = Record<string, BenefitSectionsShape | CatalogBenefit[]>;

const formatBenefitLine = (b: CatalogBenefit): string => {
    const parts: string[] = [];
    const left = b.brand ?? b.title ?? "혜택";
    parts.push(left);

    const mids: string[] = [];
    if (typeof b.rate === "number") mids.push(`${b.rate}%`);
    if (typeof b.amount === "number") mids.push(`${b.amount.toLocaleString()}원`);
    if (b.detail) mids.push(b.detail);
    if (mids.length > 0) parts.push(`: ${mids.join(" · ")}`);

    const conds: string[] = [];
    if (b.limit) conds.push(`한도 ${b.limit}`);
    if (b.days && b.days.length) conds.push(`요일 ${b.days.join(",")}`);
    if (b.time) conds.push(`시간 ${b.time}`);
    if (b.notes) conds.push(b.notes);
    if (conds.length > 0) parts.push(` (${conds.join(" / ")})`);

    return parts.join("");
};

const buildBenefitSections = (programKey: string | null): BenefitSection[] => {
    if (!programKey) return [];
    const data = (MEMBERSHIP_BENEFITS as BenefitsByKey)[programKey];

    if (data && "sections" in data && Array.isArray(data.sections)) {
        return data.sections
            .map((s) => ({
                label: String(s.label ?? "혜택"),
                lines: Array.isArray(s.lines) ? s.lines.map((ln) => String(ln)).filter(Boolean) : [],
            }))
            .filter((s) => s.lines.length > 0);
    }
    if (Array.isArray(data)) {
        const lines = (data as CatalogBenefit[]).map(formatBenefitLine).filter(Boolean);
        return lines.length ? [{ label: "주요 혜택", lines }] : [];
    }
    return [];
};

/* ---------------------------------------------
 * Component
 * -------------------------------------------*/
export default function MembershipSection() {
    // 상태
    const [loading, setLoading] = useState(true);
    const [memberships, setMemberships] = useState<Membership[]>([]);
    const [gifticonCount, setGifticonCount] = useState<number>(0);

    // 가로 캐러셀
    const listRef = useRef<HTMLDivElement>(null);
    const [activeIndex, setActiveIndex] = useState(0);

    // 바코드
    const barcodeCanvasRef = useRef<HTMLCanvasElement | null>(null);

    // 모달
    const [openTelco, setOpenTelco] = useState(false);
    const [openReg, setOpenReg] = useState(false);

    // 혜택 모달
    const [openBenefit, setOpenBenefit] = useState(false);
    const [benefitProgram, setBenefitProgram] = useState<string | null>(null);

    // 통신사 모달 상태
    const [telco, setTelco] = useState<TelcoLabel | null>(null);
    const [telcoNo, setTelcoNo] = useState("");
    const [telcoAgree, setTelcoAgree] = useState(false);

    // 일반 멤버십 등록 모달 상태
    const [selectedProgram, setSelectedProgram] = useState<string | null>(null);
    const [membershipNo, setMembershipNo] = useState("");
    const [membershipAgree, setMembershipAgree] = useState(false);

    // 재조회
    const fetchAll = useCallback(async () => {
        const [ms, gs] = await Promise.all([getMemberships(), getGifticons()]);
        setMemberships((ms as Membership[]).filter(isOwnedMembership));

        const activeCount = (Array.isArray(gs) ? (gs as Gifticon[]) : []).filter((g) => g.status === "ACTIVE").length;
        setGifticonCount(activeCount);
    }, []);

    // 초기 로드
    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                setLoading(true);
                await fetchAll();
                if (!cancelled) setActiveIndex(0);
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [fetchAll]);

    // 표시 순서 강제
    const sortedMemberships = useMemo(() => {
        const preferred = ["L.POINT", "GS25 멤버십", "KT 멤버십", "SKT 멤버십", "LG U+ 멤버십"];
        const rank = (m: Membership) => {
            const key = m.program ?? "";
            const idx = preferred.indexOf(key);
            return idx === -1 ? Number.MAX_SAFE_INTEGER : idx;
        };
        return [...memberships].sort((a, b) => rank(a) - rank(b));
    }, [memberships]);

    const activeMembership = sortedMemberships[activeIndex] as BackendMembership | undefined;

    // 통신사 연동 여부(배지)
    const linkedTelcoProgram = useMemo(() => {
        const telcoSet = new Set(["KT 멤버십", "SKT 멤버십", "LG U+ 멤버십"]);
        return memberships.find((m) => telcoSet.has(m.program ?? ""))?.program ?? null;
    }, [memberships]);
    const anyTelcoLinked = !!linkedTelcoProgram;

    // 스크롤 → 활성 카드 추적
    const rafRef = useRef<number | null>(null);
    const updateActiveIndex = useCallback(() => {
        if (!listRef.current) return;
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
        rafRef.current = requestAnimationFrame(() => {
            if (!listRef.current) return;
            const idx = computeActiveIndex(listRef.current);
            setActiveIndex((prev) => (prev === idx ? prev : idx));
        });
    }, []);
    const onScroll: UIEventHandler<HTMLDivElement> = () => updateActiveIndex();
    const onTouchMove: TouchEventHandler<HTMLDivElement> = () => updateActiveIndex();
    const onWheel: WheelEventHandler<HTMLDivElement> = () => updateActiveIndex();

    useEffect(() => {
        const el = listRef.current;
        if (!el) return;
        el.addEventListener("scroll", updateActiveIndex, { passive: true });
        return () => el.removeEventListener("scroll", updateActiveIndex);
    }, [updateActiveIndex]);

    useEffect(() => {
        if (!listRef.current || sortedMemberships.length === 0) return;
        setActiveIndex(computeActiveIndex(listRef.current));
    }, [sortedMemberships.length]);

    useEffect(() => {
        if (!loading && sortedMemberships.length > 0) {
            requestAnimationFrame(() => updateActiveIndex());
        }
    }, [loading, sortedMemberships.length, updateActiveIndex]);

    /* ========= 바코드 ========= */
    const barcodeCode = useMemo(() => {
        const raw = (activeMembership?.membershipNumber ?? activeMembership?.externalNo ?? "") as string;
        const cleaned = raw.replace(/[\s-]/g, "");
        return cleaned || null;
    }, [activeMembership?.membershipNumber, activeMembership?.externalNo, activeMembership?.membershipId]);

    useEffect(() => {
        const canvas = barcodeCanvasRef.current;
        if (!canvas || !barcodeCode) return;

        const dpr = window.devicePixelRatio || 1;
        const cssWidth = canvas.clientWidth || 320;
        const cssHeight = BARCODE_HEIGHT + 32;
        canvas.width = Math.floor(cssWidth * dpr);
        canvas.height = Math.floor(cssHeight * dpr);

        const ctx = canvas.getContext("2d") as CtxWithReset | null;
        if (!ctx) return;
        ctx.reset?.();
        ctx.scale(dpr, dpr);

        const isEAN13 = /^\d{13}$/.test(barcodeCode);

        JsBarcode(canvas, barcodeCode, {
            format: isEAN13 ? "EAN13" : "CODE128",
            margin: 8,
            width: 2,
            height: BARCODE_HEIGHT,
            displayValue: true,
            textMargin: 6,
            font: "14px system-ui",
            fontOptions: "bold",
        });
    }, [barcodeCode]);

    // 카드 클릭
    const handleSelectCard = (membershipId?: number) => {
        if (!membershipId || !listRef.current) return;
        const idx = sortedMemberships.findIndex((m) => m.membershipId === membershipId);
        if (idx < 0) return;
        setActiveIndex(idx);

        const container = listRef.current;
        const slots = container.querySelectorAll<HTMLDivElement>('[data-card-slot="1"]');
        const target = slots[idx];
        if (!target) return;

        const crect = container.getBoundingClientRect();
        const trect = target.getBoundingClientRect();
        const cCenter = container.scrollLeft + container.clientWidth / 2;
        const tCenter = container.scrollLeft + (trect.left - crect.left) + trect.width / 2;
        container.scrollTo({ left: container.scrollLeft + (tCenter - cCenter), behavior: "smooth" });
    };

    // 등록 가능한 일반 멤버십 목록
    const available = useMemo(
        () => ["GS&POINT", "L.POINT", "해피포인트", "OK캐쉬백", "CJONE", "S-OIL 포인트"],
        [],
    );

    // 타일 클릭 → 혜택 모달 먼저
    const onOpenMembershipModal = (name: string) => {
        const key = normalizeProgramKey(name) ?? name.trim();
        setBenefitProgram(key);
        setOpenBenefit(true);
        setSelectedProgram(null);
        setMembershipNo("");
        setMembershipAgree(false);
    };

    const handleCreate = async () => {
        if (!selectedProgram) return;
        const productId = PRODUCT_ID[selectedProgram];
        if (!productId) {
            openExternal(MEMBERSHIP_URL[selectedProgram]);
            return;
        }
        await createMembership({
            productId,
            externalNo: membershipNo.trim(),
            level: undefined,
        });
        await fetchAll();
        setOpenReg(false);
        requestAnimationFrame(() => {
            listRef.current?.scrollTo({ left: 9999, behavior: "smooth" });
        });
    };

    // 버튼 상태
    const regDisabled = !(selectedProgram && membershipNo.trim() && membershipAgree);
    const telcoButtonDisabled = anyTelcoLinked || !(telco && telcoNo.trim() && telcoAgree);

    /* ========= 혜택 모달용 키/데이터 ========= */
    const benefitKey = useMemo(
        () => (benefitProgram ? normalizeProgramKey(benefitProgram) ?? benefitProgram.trim() : null),
        [benefitProgram],
    );

    const benefitSections = useMemo(() => {
        if (!benefitKey) return [];
        const direct = buildBenefitSections(benefitKey);
        if (direct.length > 0) return direct;

        const norm = (s: string) => s.toUpperCase().replace(/\s+|-/g, "");
        const matchKey = Object.keys(MEMBERSHIP_BENEFITS).find((k) => norm(k) === norm(benefitKey)) ?? null;
        const fallback = buildBenefitSections(matchKey);
        if (fallback.length === 0) {
            console.warn("[benefits] key not found:", benefitKey, "available:", Object.keys(MEMBERSHIP_BENEFITS));
        }
        return fallback;
    }, [benefitKey]);

    return (
        <>
            {/* 1) 보유 멤버십 */}
            <SectionBox width={352} padding="0px 16px 8px" outlined shadow={false}>
                <div className={styles.sectionTitleCompact}>
                    <br />
                    {!!sortedMemberships.length && (
                        <span className={styles.activeCardName}>&nbsp;{membershipDisplayName(activeMembership)}</span>
                    )}
                </div>

                {loading && <div className={styles.loading}>불러오는 중…</div>}
                {!loading && sortedMemberships.length === 0 && (
                    <div className={styles.empty}>아직 등록된 멤버십이 없어요.</div>
                )}

                {!loading && sortedMemberships.length > 0 && (
                    <>
                        <div
                            ref={listRef}
                            aria-label="보유 멤버십 목록"
                            className={styles.hList}
                            onScroll={onScroll}
                            onTouchMove={onTouchMove}
                            onWheel={onWheel}
                        >
                            {sortedMemberships.map((m) => {
                                const program = m.program ?? "";
                                const isTelco = isTelcoProgram(program);

                                let imageUrl: string | undefined;
                                let bg = "linear-gradient(135deg,#e5e7eb,#d1d5db)";
                                let logo: string | undefined;

                                if (isTelco) {
                                    // TELCO_META 사용
                                    const label: TelcoLabel = program.includes("KT")
                                        ? "KT"
                                        : program.includes("SKT")
                                            ? "SKT"
                                            : ("LG U+" as TelcoLabel);

                                    const tmeta = TELCO_META_MAP[label];
                                    const raw = tmeta?.imgUrl;
                                    const isImage = !!raw && /^(data:|https?:|\/\/)/i.test(raw);
                                    // 통신사는 카드 배경 이미지만 주는 케이스가 많음
                                    imageUrl = isImage ? raw : undefined;
                                    logo = tmeta?.logoUrl;
                                } else {
                                    // 일반 멤버십은 기존 MEMBERSHIP_META 사용
                                    const key = normalizeProgramKey(program);
                                    const meta = key ? MEMBERSHIP_META_MAP[key] : undefined;

                                    const raw = meta?.imgUrl ?? meta?.cardBg;
                                    const isImage = !!raw && /^(data:|https?:|\/\/)/i.test(raw);
                                    const isGradient = !!raw && /\bgradient\(/i.test(raw);

                                    imageUrl = isImage ? raw : undefined;
                                    bg = isGradient ? raw : bg;
                                    logo = meta?.logoUrl;
                                }

                                return (
                                    <div key={m.membershipId} data-card-slot="1" className={styles.cardSlot}>
                                        <div className={styles.cardSlotInner}>
                                            <CardItem
                                                cardId={m.membershipId}
                                                name={membershipDisplayName(m)}
                                                onClick={handleSelectCard}
                                                showActionBadge={false}
                                                imageUrl={imageUrl}
                                                bg={bg}
                                                logoUrl={logo}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <div className={styles.previewCard} style={{ paddingTop: 8 }}>
                            <div className={styles.previewBarcodeWrap}>
                                <canvas ref={barcodeCanvasRef} className={styles.previewBarcodeCanvas} />
                            </div>
                        </div>
                    </>
                )}
            </SectionBox>

            {/* 2) 연동 현황 */}
            <SectionBox width={352} padding={16} outlined shadow={false}>
                <div className={styles.subTitle}>연동 현황</div>

                <div
                    className={styles.rowBetween}
                    style={{ paddingBottom: 12, cursor: "pointer" }}
                    onClick={() => {
                        setTelco(null);
                        setTelcoNo("");
                        setTelcoAgree(false);
                        setOpenTelco(true);
                    }}
                >
                    <div>
                        <div className={styles.rowStart} style={{ marginBottom: 2 }}>
                            <div className={styles.subTitle}>통신사 멤버십</div>
                        </div>
                        <div className={styles.desc}>{anyTelcoLinked ? `${linkedTelcoProgram} 연동됨` : "미연동"}</div>
                    </div>
                    <div className={anyTelcoLinked ? styles.badgeOn : styles.badgeOff}>
                        {anyTelcoLinked ? "연동" : "미연동"}
                    </div>
                </div>

                <div className={styles.rowBetween} style={{ padding: "8px 0 12px" }}>
                    <div>
                        <div className={styles.rowStart} style={{ marginBottom: 2 }}>
                            <div className={styles.subTitle}>기프티콘</div>
                        </div>
                        <div className={styles.desc}>{`사용 가능한 기프티콘 ${gifticonCount}개 보유`}</div>
                    </div>
                </div>

                <div className={styles.divider} />

                {/* 3) 연동 가능한 멤버십 */}
                <div className={styles.subTitle}>연동 가능한 멤버십</div>
                <div className={styles.grid}>
                    {available.map((name) => {
                        const meta = MEMBERSHIP_META_MAP[name];
                        return (
                            <div key={name} className={styles.tile} onClick={() => onOpenMembershipModal(name)}>
                                <div
                                    className={styles.tileIcon}
                                    style={{
                                        background: meta?.logoUrl ? `url(${meta.logoUrl}) center/cover no-repeat` : "var(--theme-bg)",
                                        borderRadius: "50%",
                                    }}
                                />
                                <div className={styles.tileName}>{name}</div>
                            </div>
                        );
                    })}
                </div>
            </SectionBox>

            {/* === 멤버십 혜택 모달 === */}
            <Modal open={openBenefit} onClose={() => setOpenBenefit(false)}>
                {benefitKey && (
                    <>
                        <div className={`${styles.subTitle} ${styles.benefitTitle}`}>{benefitKey} 혜택</div>

                        <SectionBox>
                            {benefitSections.length > 0 ? (
                                benefitSections.map((sec) => (
                                    <div key={sec.label} className={styles.sectionBlock}>
                                        <div className={styles.sectionLabel}>{sec.label}</div>
                                        <ul className={styles.sectionUl}>
                                            {sec.lines.map((t, i) => (
                                                <li key={i} className={styles.sectionLi}>
                                                    {t}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                ))
                            ) : (
                                <div className={styles.sectionEmpty}>혜택 정보가 아직 준비되지 않았어요.</div>
                            )}
                        </SectionBox>

                        <div className={styles.spacer12} />
                        <Button
                            variant="purple"
                            onClick={() => {
                                setSelectedProgram(benefitKey);
                                setOpenBenefit(false);
                                setOpenReg(true);
                            }}
                        >
                            등록하기
                        </Button>
                        <div className={styles.spacer8} />
                        <Button variant="gray" onClick={() => setOpenBenefit(false)}>
                            닫기
                        </Button>
                    </>
                )}
            </Modal>

            {/* === 통신사 멤버십 등록 모달 === */}
            <Modal open={openTelco} onClose={() => setOpenTelco(false)}>
                <div className={styles.subTitle} style={{ marginTop: 4 }}>
                    통신사 선택
                </div>
                <div className={styles.helper} style={{ marginBottom: 8 }}>
                    {anyTelcoLinked ? "이미 통신사 멤버십이 연동되어 있어 추가 연동은 불가합니다." : "하나의 통신사만 연동할 수 있어요."}
                </div>
                <div className={styles.grid} style={{ marginBottom: 8 }}>
                    {(["KT", "SKT", "LG U+"] as TelcoLabel[]).map((c) => {
                        const meta = TELCO_META_MAP[c];
                        const disabled = anyTelcoLinked;
                        return (
                            <div
                                key={c}
                                className={styles.tile}
                                onClick={() => !disabled && setTelco(c)}
                                style={{
                                    borderColor: telco === c ? "var(--theme-primary)" : "var(--theme-secondary)",
                                    opacity: disabled ? 0.5 : 1,
                                    cursor: disabled ? "not-allowed" : "pointer",
                                }}
                            >
                                <div
                                    className={styles.tileIcon}
                                    style={{
                                        background: meta?.logoUrl ? `url(${meta.logoUrl}) center/contain no-repeat` : "var(--theme-bg)",
                                        backgroundColor: "#fff",
                                        borderRadius: 0,
                                    }}
                                />
                                <div className={styles.tileName}>{c}</div>
                            </div>
                        );
                    })}
                </div>

                <div className={styles.subTitle} style={{ marginTop: 2 }}>
                    통신사 멤버십 번호 등록
                </div>
                <div className={styles.helper}>멤버십 번호 입력하기</div>
                <input
                    className={styles.input}
                    placeholder="멤버십 번호를 입력해 주세요"
                    value={telcoNo}
                    onChange={(e) => setTelcoNo(e.target.value)}
                    disabled={anyTelcoLinked}
                />
                <label className={styles.checkboxRow}>
                    <input
                        type="checkbox"
                        checked={telcoAgree}
                        onChange={(e) => setTelcoAgree(e.target.checked)}
                        disabled={anyTelcoLinked}
                    />
                    <span>
            <u>통신사 멤버십 번호 수집</u>에 동의합니다.
          </span>
                </label>

                <div style={{ height: 8 }} />
                <Button
                    disabled={telcoButtonDisabled}
                    variant={telcoButtonDisabled ? "gray" : "purple"}
                    onClick={async () => {
                        if (!telco || anyTelcoLinked) return;
                        try {
                            const pid = TELCO_PRODUCT_ID[telco];
                            if (pid) {
                                await createMembership({
                                    productId: pid,
                                    externalNo: telcoNo.trim(),
                                    level: undefined,
                                });
                                await fetchAll();
                            }
                            setOpenTelco(false);
                            openExternal(TELCO_URL[telco]);
                        } catch (e) {
                            console.error(e);
                        }
                    }}
                >
                    본인 인증하기
                </Button>
                <div style={{ height: 8 }} />
                <Button variant="gray" onClick={() => setOpenTelco(false)}>
                    닫기
                </Button>
            </Modal>

            {/* === 일반 멤버십 등록 모달 === */}
            <Modal open={openReg} onClose={() => setOpenReg(false)}>
                <div className={styles.subTitle} style={{ marginTop: 2 }}>
                    {selectedProgram ?? "멤버십"} 멤버십 등록
                </div>
                <div className={styles.helper}>멤버십 번호 입력하기</div>
                <input
                    className={styles.input}
                    placeholder="멤버십 번호를 입력해 주세요"
                    value={membershipNo}
                    onChange={(e) => setMembershipNo(e.target.value)}
                />
                <label className={styles.checkboxRow}>
                    <input type="checkbox" checked={membershipAgree} onChange={(e) => setMembershipAgree(e.target.checked)} />
                    <span>
            <u>멤버십 번호 수집</u>에 동의합니다.
          </span>
                </label>

                <div style={{ height: 8 }} />
                <Button
                    disabled={regDisabled}
                    variant={regDisabled ? "gray" : "purple"}
                    onClick={async () => {
                        const url = selectedProgram ? MEMBERSHIP_URL[selectedProgram] : "";
                        await handleCreate();
                        openExternal(url);
                    }}
                >
                    본인 인증하기
                </Button>
                <div style={{ height: 8 }} />
                <Button variant="gray" onClick={() => setOpenReg(false)}>
                    닫기
                </Button>
            </Modal>
        </>
    );
}