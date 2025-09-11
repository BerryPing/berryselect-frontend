import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import SectionBox from "@/components/common/SectionBox";
import CardItem from "@/components/wallet/CardItem";
import berrylogo from "@/assets/imgs/berrylogo.png";
import { type CardSummary, getCards, getCardBenefits, type CardBenefitsGrouped, type BenefitGroup, type BenefitItem } from "@/api/walletApi";
import styles from "./WalletPage.module.css";
import Button from "@/components/common/Button.tsx";
import { getCardImage, getCardMeta } from "@/components/wallet/CardCatalog.ts";
import { openDeepLink } from "@/utils/deepLink.ts";
import { getUserSettings, type UserSettingsResponse } from "@/api/userApi.ts";
import Modal from "@/components/common/Modal.tsx";
import { Info } from "lucide-react";

/* -------------------- 공통 UI 셀 -------------------- */
function BenefitItemRow({ item }: { item: BenefitItem }) {
    const initials =
        item.brand?.trim()?.slice(0, 2).toUpperCase() ??
        (item.title?.trim()?.slice(0, 2).toUpperCase() || "·");

    return (
        <div className={styles.benefitItem}>
            <div className={styles.benefitThumb}>{initials}</div>
            <div className={styles.benefitTexts}>
                <div className={styles.benefitBrand}>{item.brand}</div>
                <div className={styles.benefitTitle}>{item.title}</div>
                {item.subtitle && <div className={styles.benefitSubtle}>{item.subtitle}</div>}
            </div>
        </div>
    );
}

function GroupList({ groups }: { groups: BenefitGroup[] }) {
    if (!groups || groups.length === 0) return null;
    return (
        <div>
            {groups.map((g, i) => (
                <div key={`${g.category}-${i}`} className={styles.groupBlock}>
                    <div className={styles.groupTitle}>{g.category}</div>
                    <div style={{ display: "grid", gap: 12 }}>
                        {g.items.map((it, idx) => (
                            <BenefitItemRow key={idx} item={it} />
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}

/* -------------------- 카테고리 칩 -------------------- */
const MASTER_CATS = ["전체", "카페", "편의점", "교통", "쇼핑", "음식", "기타"] as const;
type MasterCat = (typeof MASTER_CATS)[number];
const catEmoji: Record<string, string> = { 전체:"🐾", 카페:"☕", 편의점:"🏪", 교통:"🚗", 쇼핑:"🛒", 음식:"🍽️", 기타:"✨" };

const normCat = (s?: string) =>
    (s ?? "").normalize("NFKC").replace(/[^\p{L}\p{N}]+/gu, "").toLowerCase();

const MASTER_NORM_MAP = new Map<string, MasterCat>(
    (MASTER_CATS as readonly string[]).map((c) => [normCat(c), c as MasterCat])
);

/* --------- Helpers --------- */
function computeActiveIndex(container: HTMLDivElement): number {
    const cards = Array.from(container.querySelectorAll<HTMLDivElement>('[data-card-slot="1"]'));
    if (cards.length === 0) return 0;
    const containerRect = container.getBoundingClientRect();
    const containerCenter = containerRect.left + containerRect.width / 2;

    let bestIdx = 0; let bestDist = Number.POSITIVE_INFINITY;
    cards.forEach((el, idx) => {
        const r = el.getBoundingClientRect();
        const center = r.left + r.width / 2;
        const dist = Math.abs(center - containerCenter);
        if (dist < bestDist) { bestDist = dist; bestIdx = idx; }
    });
    return bestIdx;
}

function mergeGroups(groups: BenefitGroup[]): BenefitGroup[] {
    const byKey = new Map<string, BenefitGroup>();
    for (const g of groups) {
        const key = normCat(g.category);
        const ex = byKey.get(key);
        if (!ex) byKey.set(key, { category: g.category, items: [...g.items] });
        else ex.items.push(...g.items);
    }
    return Array.from(byKey.values());
}

/* ================= 실적/구간 계산 유틸 ================= */
type Tier = { label: string; min: number; max: number | null };
type CardSummaryExt = CardSummary & { prevMonthSpend?: number };
type BenefitsExt = CardBenefitsGrouped & { spendTiers?: Tier[]; benefitNoteHtml?: string };

function isTierArray(v: unknown): v is Tier[] {
    return Array.isArray(v) && v.every(
        (t) => t && typeof t === "object" &&
            typeof (t as Tier).label === "string" &&
            typeof (t as Tier).min === "number" &&
            ("max" in (t as Tier))
    );
}
const DEFAULT_TIERS: Tier[] = [
    { label: "0구간", min: 0, max: 200_000 },
    { label: "1구간", min: 200_000, max: 500_000 },
    { label: "2구간", min: 500_000, max: null },
];
function findTier(spend: number, tiers: Tier[]) {
    const idx = tiers.findIndex((t) => (t.max == null ? spend >= t.min : spend >= t.min && spend < t.max));
    return idx >= 0 ? idx : tiers.length - 1;
}
function formatMoney(n: number) { return n.toLocaleString("ko-KR") + "원"; }

/* =============== Component =============== */
export default function CardSection() {
    const [cards, setCards] = useState<CardSummary[]>([]);
    const [loadingCards, setLoadingCards] = useState(false);
    const [cardsError, setCardsError] = useState<string | null>(null);
    const listRef = useRef<HTMLDivElement>(null);

    const [activeIndex, setActiveIndex] = useState(0);
    const activeCard = cards[activeIndex];

    const [benefits, setBenefits] = useState<CardBenefitsGrouped | null>(null);
    const [loadingBenefits, setLoadingBenefits] = useState(false);
    const [benefitsError, setBenefitsError] = useState<string | null>(null);
    const [activeOther, setActiveOther] = useState<MasterCat>("전체");

    const [settings, setSettings] = useState<UserSettingsResponse | null>(null);
    const [loadingSettings, setLoadingSettings] = useState(false);

    const [openPerfModal, setOpenPerfModal] = useState(false);

    /* 1) 카드 목록 */
    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                setLoadingCards(true); setCardsError(null);
                const list = await getCards();
                if (!cancelled) { setCards(list); setActiveIndex(0); }
            } catch {
                if (!cancelled) setCardsError("카드 목록을 불러오지 못했습니다.");
            } finally {
                if (!cancelled) setLoadingCards(false);
            }
        })();
        return () => { cancelled = true; };
    }, []);

    /* 2) 사용자 설정 */
    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                setLoadingSettings(true);
                const s = await getUserSettings();
                if (!cancelled) setSettings(s);
            } catch {
                if (!cancelled) setSettings(null);
            } finally {
                if (!cancelled) setLoadingSettings(false);
            }
        })();
        return () => { cancelled = true; };
    }, []);

    /* 3) 혜택 로드 */
    useEffect(() => {
        if (!activeCard?.cardId) { setBenefits(null); setActiveOther("전체"); return; }
        let cancelled = false;
        setLoadingBenefits(true); setBenefitsError(null);

        getCardBenefits(activeCard.cardId)
            .then((res) => {
                if (cancelled) return;
                setBenefits(res);

                const merged = mergeGroups([...(res.personalized ?? []), ...(res.others ?? [])]);
                const available = new Set(merged.map((g) => normCat(g.category)));

                let next: MasterCat | undefined;
                for (const c of settings?.preferredCategories ?? []) {
                    const key = normCat(c);
                    if (available.has(key)) {
                        const mapped = MASTER_NORM_MAP.get(key);
                        if (mapped) { next = mapped; break; }
                    }
                }
                setActiveOther(next ?? "전체");
            })
            .catch((e: unknown) => {
                if (cancelled) return;
                const msg = e instanceof Error ? e.message : "혜택을 불러오지 못했습니다.";
                setBenefitsError(msg);
            })
            .finally(() => { if (!cancelled) setLoadingBenefits(false); });

        return () => { cancelled = true; };
    }, [activeCard?.cardId, settings?.preferredCategories]);

    /* 4) 가로 스크롤 활성 카드 추적 */
    const rafRef = useRef<number | null>(null);
    const onScroll = useCallback(() => {
        if (!listRef.current) return;
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
        rafRef.current = requestAnimationFrame(() => {
            if (!listRef.current) return;
            const idx = computeActiveIndex(listRef.current);
            setActiveIndex((prev) => (prev === idx ? prev : idx));
        });
    }, []);
    useEffect(() => {
        const el = listRef.current; if (!el) return;
        el.addEventListener("scroll", onScroll, { passive: true });
        return () => el.removeEventListener("scroll", onScroll);
    }, [onScroll]);
    useEffect(() => {
        if (!listRef.current || cards.length === 0) return;
        setActiveIndex(computeActiveIndex(listRef.current));
    }, [cards.length]);

    const cardDisplayName = (c: CardSummary): string => {
        if (c.name) return c.name;
        const issuer = c.issuer ?? "카드";
        const last4 = c.last4 ? ` •••• ${c.last4}` : "";
        return `${issuer}${last4}`;
    };

    const handleSelectCard = (cardId?: number) => {
        if (!cardId || !listRef.current) return;
        const idx = cards.findIndex((c) => c.cardId === cardId);
        if (idx < 0) return; setActiveIndex(idx);

        const container = listRef.current;
        const slots = container.querySelectorAll<HTMLDivElement>('[data-card-slot="1"]');
        const target = slots[idx]; if (!target) return;

        const containerRect = container.getBoundingClientRect();
        const targetRect = target.getBoundingClientRect();
        const containerCenter = container.scrollLeft + container.clientWidth / 2;
        const targetCenter = container.scrollLeft + (targetRect.left - containerRect.left) + targetRect.width / 2;

        container.scrollTo({ left: container.scrollLeft + (targetCenter - containerCenter), behavior: "smooth" });
    };

    /* -------- “그 외 혜택” = 맞춤형 + 그외 전체 ------- */
    const allGroups = useMemo<BenefitGroup[]>(() => {
        const p = benefits?.personalized ?? []; const o = benefits?.others ?? [];
        return mergeGroups([...p, ...o]);
    }, [benefits]);

    const groupsByCat = useMemo(() => {
        const m = new Map<string, BenefitGroup>(); for (const g of allGroups) m.set(normCat(g.category), g); return m;
    }, [allGroups]);

    const mergedAll = useMemo<BenefitGroup>(() => ({ category: "전체", items: allGroups.flatMap((g) => g.items) }), [allGroups]);

    const selectedGroup: BenefitGroup = useMemo(() => {
        if (activeOther === "전체") return mergedAll;
        return groupsByCat.get(normCat(activeOther)) ?? { category: activeOther, items: [] };
    }, [activeOther, mergedAll, groupsByCat]);

    /* =============== 총 실적/구간(모달) =============== */
    const thisMonthSpend = Math.max(0, Number(activeCard?.thisMonthSpend ?? 420_000)); // 예시 기본값
    const prevMonthSpend = Math.max(0, Number((activeCard as CardSummaryExt)?.prevMonthSpend ?? 380_000)); // 예시 기본값

    const tiersFromApi = (benefits as BenefitsExt | null)?.spendTiers;
    const TIERS: Tier[] = isTierArray(tiersFromApi) && tiersFromApi.length > 0 ? tiersFromApi : DEFAULT_TIERS;
    const tierIdx = findTier(prevMonthSpend, TIERS);
    const currTier = TIERS[tierIdx];
    const nextTier = TIERS[tierIdx + 1];
    const needToNext = nextTier?.min != null ? Math.max(0, nextTier.min - prevMonthSpend) : 0;

    const meterMax = currTier?.max ?? 1_000_000;
    const meterPct = Math.min(100, (thisMonthSpend / meterMax) * 100);

    const barRatio = (() => {
        if (!currTier) return 0;
        if (currTier.max == null) return 1;
        const span = currTier.max - currTier.min;
        const pos = Math.min(currTier.max, Math.max(currTier.min, prevMonthSpend)) - currTier.min;
        return Math.max(0, Math.min(1, pos / span));
    })();

    return (
        <>
            <SectionBox width={352} padding="0px 16px 23px" outlined shadow={false}>
                <div className={styles.sectionTitleCompact}>
                    <br />
                    {activeCard && <span className={styles.activeCardName}>&nbsp;{activeCard.name}</span>}
                </div>

                {loadingCards && <div className={styles.loading}>불러오는 중…</div>}
                {cardsError && !loadingCards && <div className={styles.error}>{cardsError}</div>}
                {!loadingCards && !cardsError && cards.length === 0 && (
                    <div className={styles.empty}>보유 카드가 없습니다.</div>
                )}

                {!loadingCards && !cardsError && cards.length > 0 && (
                    <div
                        ref={listRef}
                        aria-label="보유 카드 목록"
                        className={styles.hList}
                        onScroll={onScroll}
                        onTouchMove={onScroll}
                        onWheel={onScroll}
                    >
                        {cards.map((c) => (
                            <div key={c.cardId} data-card-slot="1" className={styles.cardSlot}>
                                <div className={styles.cardSlotInner}>
                                    <CardItem
                                        cardId={c.cardId}
                                        name={cardDisplayName(c)}
                                        imageUrl={getCardImage(c.name)}
                                        onClick={handleSelectCard}
                                        onOpenApp={() => openDeepLink(getCardMeta(c.name)?.deepLink)}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </SectionBox>

            {/* 베리픽 버튼 */}
            <div className={styles.actionBtnWrap}>
                <Button className={styles.sectionLikeBtn} onClick={() => {}}>
          <span className={styles.btnInner}>
            <img src={berrylogo} alt="베리로고" className={styles.berryselectLogo} />
            <span className={styles.btnText}>베리픽 결제 추천 받기</span>
          </span>
                </Button>
            </div>

            {/* 이번 달 현황 */}
            <SectionBox width={352} padding="16px" outlined shadow={false}>
                <div className={styles.statusCardWrap}>
                    <div className={styles.statusTitle}>이번 달 현황</div>
                    <div className={styles.statusRow}>
                        {/* 총 실적 */}
                        <div className={styles.statusCard}>
                            <div className={styles.statusHeader}>
                                <div className={styles.statusLabel}>총 실적</div>
                                <Info
                                    type="button"
                                    className={styles.infoBtn}
                                    aria-label="실적 상세 보기"
                                    onClick={() => setOpenPerfModal(true)}
                                >
                                </Info>
                            </div>
                            <div className={styles.statusValue}>
                                {Math.floor(thisMonthSpend / 10_000)}/{Math.floor(meterMax / 10_000)}만원
                            </div>
                            <div className={styles.statusMeter}>
                                <div className={styles.statusMeterFill} style={{ width: `${meterPct}%` }} />
                            </div>
                        </div>

                        {/* 잔여 예산 */}
                        <div className={styles.budgetCard}>
                            <div className={styles.budgetLabel}>잔여 예산</div>
                            <div className={styles.budgetValue}>120,000원</div>
                            <div className={styles.budgetMeter}>
                                <div className={styles.budgetMeterFill} style={{ width: "62%" }} />
                            </div>
                        </div>
                    </div>
                </div>
            </SectionBox>

            {/* 맞춤형 혜택 */}
            <SectionBox width={352} padding="16px" outlined shadow={false}>
                <div className={styles.benefitsBox}>
                    <div className={styles.sectionTitle}>맞춤형 혜택</div>

                    {loadingSettings && <div className={styles.loading}>개인화 설정 불러오는 중…</div>}
                    {loadingBenefits && <div className={styles.loading}>혜택 불러오는 중…</div>}
                    {benefitsError && !loadingBenefits && <div className={styles.error}>{benefitsError}</div>}

                    {!loadingBenefits && !benefitsError && (
                        <>
                            {/* ① 맞춤형 */}
                            {(() => {
                                const p = benefits?.personalized ?? [];
                                if (p.length === 0) {
                                    return (
                                        <div className={styles.empty}>
                                            {(settings?.preferredCategories?.length ?? 0) === 0
                                                ? "회원가입 시 선호 카테고리를 아직 선택하지 않았어요. (0~3개 선택 가능)"
                                                : "선호 카테고리에 해당하는 카드 혜택이 아직 없어요. 다른 카테고리도 확인해 보세요."}
                                        </div>
                                    );
                                }
                                return <GroupList groups={p} />;
                            })()}

                            {/* ② 그 외 혜택 */}
                            <div style={{ marginTop: 16 }}>
                                <div className={styles.subSectionTitle}>그 외 혜택</div>
                                <div className={styles.chipsRow}>
                                    {MASTER_CATS.map((cat) => {
                                        const selected = cat === activeOther;
                                        return (
                                            <button
                                                key={cat}
                                                type="button"
                                                className={[styles.chip, selected ? styles.chipSelected : ""].join(" ")}
                                                onClick={() => setActiveOther(cat)}
                                                aria-pressed={selected}
                                                title={catEmoji[cat] + " " + cat}
                                            >
                                                {cat}
                                            </button>
                                        );
                                    })}
                                </div>

                                {selectedGroup.items.length > 0 ? (
                                    <div className={styles.groupBlock}>
                                        <div className={styles.groupTitle}>{selectedGroup.category}</div>
                                        <div style={{ display: "grid", gap: 12 }}>
                                            {selectedGroup.items.map((it, idx) => (
                                                <BenefitItemRow key={idx} item={it} />
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    <div className={styles.empty}>표시할 혜택이 없어요.</div>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </SectionBox>

            {/* ===== 실적 모달 ===== */}
            <Modal open={openPerfModal} onClose={() => setOpenPerfModal(false)}>
                <div className={styles.modalSheet}>
                    {/* 상단 핸들 + 타이틀 */}
                    <div className={styles.modalHandle} />
                    <div className={styles.modalHeader}>
                        <div className={styles.modalTitle}>카드 이용실적 · 혜택</div>
                    </div>

                    {/* [A] 실적 인정금액 타이틀 */}
                    <div className={styles.progressTitle}>실적 인정금액</div>

                    {/* [B] 상단 진행바 */}
                    <div className={styles.tierProgressWrap}>
                        <div className={styles.tierProgressRail}>
                            <div
                                className={styles.tierProgressFill}
                                style={{ width: `${barRatio * 100}%` }}
                            />
                        </div>
                        <div className={styles.tierLabels}>
                            <span>0구간</span>
                            <span>1구간</span>
                            <span>2구간</span>
                        </div>
                    </div>

                    {/* [C] 다음 구간 박스 */}
                    <div className={styles.nextBox}>
                        <div className={styles.nextInline}>
                            <span className={styles.nextPrefix}>다음 구간 까지</span>
                            <strong className={styles.nextAmount}>{formatMoney(needToNext)}</strong>
                            <span className={styles.nextSuffix}>남았어요</span>
                        </div>
                    </div>

                    {/* [D] 섹션 제목: 구간별 혜택 내용 */}
                    <div className={styles.subSectionHeader}>구간별 혜택 내용</div>

                    {/* [E] 구간 Pill */}
                    <div className={styles.tierPills}>
                        {TIERS.map((t, i) => {
                            const selected = i === tierIdx;
                            return (
                                <button
                                    key={t.label}
                                    type="button"
                                    className={[styles.tierPill, selected ? styles.tierPillActive : ""].join(" ")}
                                >
                                    {t.label.replace("구간", "")}
                                </button>
                            );
                        })}
                    </div>

                    {/* [F] 혜택 설명 목록 */}
                    <div className={styles.benefitBullets}>
                        <div className={styles.bullet}>
                            혜택 조건: 전월 실적 {currTier.min.toLocaleString()}원 이상 ~{" "}
                            {currTier.max ? `${currTier.max.toLocaleString()}원 미만` : "상한 없음"}
                        </div>
                        <div className={styles.bullet}>카페·편의점 5% 할인</div>
                        <div className={styles.bullet}>온라인 쇼핑 2% 적립</div>
                        <div className={styles.bullet}>
                            {nextTier
                                ? `${nextTier.min.toLocaleString()}원 이상 사용 시 ${nextTier.label} 혜택이 열려요`
                                : "최고 구간입니다!"}
                        </div>
                    </div>
                </div>
            </Modal>
        </>
    );
}