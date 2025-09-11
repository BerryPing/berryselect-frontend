// src/pages/Wallet/CardSection.tsx
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import SectionBox from "@/components/common/SectionBox";
import CardItem from "@/components/wallet/CardItem";
import berrylogo from "@/assets/imgs/berrylogo.png";
import {
    type CardSummary,
    getCards,
    type CardBenefitsGrouped,
    type BenefitGroup,
    type BenefitItem,
    getCardBenefits,
} from "@/api/walletApi";
import styles from "./WalletPage.module.css";
import Button from "@/components/common/Button";
import { getCardImage, getCardMeta } from "@/components/wallet/CardCatalog";
import { openDeepLink } from "@/utils/deepLink";
import Modal from "@/components/common/Modal";
import { Info } from "lucide-react";
import { fetchBudget, type Budget } from "@/api/myberryApi";
import BerryPickPage from "@/pages/BerryPick/BerryPickPage.tsx";

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

const normCat = (s?: string) =>
    (s ?? "").normalize("NFKC").replace(/[^\p{L}\p{N}]+/gu, "").toLowerCase();

/* --------- Helpers --------- */
function computeActiveIndex(container: HTMLDivElement): number {
    const cards = Array.from(container.querySelectorAll<HTMLDivElement>('[data-card-slot="1"]'));
    if (cards.length === 0) return 0;
    const containerRect = container.getBoundingClientRect();
    const containerCenter = containerRect.left + containerRect.width / 2;

    let bestIdx = 0;
    let bestDist = Number.POSITIVE_INFINITY;
    cards.forEach((el, idx) => {
        const r = el.getBoundingClientRect();
        const center = r.left + r.width / 2;
        const dist = Math.abs(center - containerCenter);
        if (dist < bestDist) {
            bestDist = dist;
            bestIdx = idx;
        }
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
    return (
        Array.isArray(v) &&
        v.every(
            (t) =>
                t &&
                typeof t === "object" &&
                typeof (t as Tier).label === "string" &&
                typeof (t as Tier).min === "number" &&
                "max" in (t as Tier),
        )
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
function formatMoney(n: number) {
    return n.toLocaleString("ko-KR") + "원";
}

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

    const [openPerfModal, setOpenPerfModal] = useState(false);

    // ✅ BerryPickPage 표시용 상태
    const [showBerryPick, setShowBerryPick] = useState(false);

    const fetchedBudgetRef = useRef(false);

    // === 전체 월 예산(MyBerry) ===
    const [budget, setBudget] = useState<Budget | null>(null);

    /* 1) 카드 목록 */
    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                setLoadingCards(true);
                setCardsError(null);
                const list = await getCards();
                if (!cancelled) {
                    setCards(list);
                    setActiveIndex(0);
                }
            } catch {
                if (!cancelled) setCardsError("카드 목록을 불러오지 못했습니다.");
            } finally {
                if (!cancelled) setLoadingCards(false);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, []);

    /* 1-1) 전체 월 예산 로드 */
    useEffect(() => {
        if (fetchedBudgetRef.current) return;
        fetchedBudgetRef.current = true;

        (async () => {
            try {
                const now = new Date();
                const ym = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
                const b = await fetchBudget(ym);
                setBudget(b);
            } catch (e) {
                console.error("fetchBudget error(raw):", e);
                setBudget(null);
            }
        })();
    }, []);

    /* 2) 혜택 로드 */
    useEffect(() => {
        const benefitsId = activeCard?.assetId ?? activeCard?.cardId; // assetId 우선
        if (!benefitsId) {
            setBenefits(null);
            setActiveOther("전체");
            return;
        }

        let cancelled = false;
        setLoadingBenefits(true);
        setBenefitsError(null);

        getCardBenefits(benefitsId)
            .then((res) => {
                if (cancelled) return;
                setBenefits(res);
                const merged = [
                    ...(Array.isArray(res.personalized) ? res.personalized : []),
                    ...(Array.isArray(res.others) ? res.others : []),
                ];
                const allCats = new Set(
                    merged.map((g) => (g.category ?? "").normalize("NFKC").replace(/[^\p{L}\p{N}]+/gu, "").toLowerCase()),
                );
                setActiveOther(allCats.size > 0 ? "전체" : "전체");
            })
            .catch((e: unknown) => {
                if (cancelled) return;
                const msg = e instanceof Error ? e.message : "혜택을 불러오지 못했습니다.";
                setBenefitsError(msg);
                setBenefits({ personalized: [], others: [] });
                setActiveOther("전체");
            })
            .finally(() => {
                if (!cancelled) setLoadingBenefits(false);
            });

        return () => {
            cancelled = true;
        };
    }, [activeCard?.assetId, activeCard?.cardId]);

    /* 3) 가로 스크롤 활성 카드 추적 */
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
        const el = listRef.current;
        if (!el) return;
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
        if (idx < 0) return;
        setActiveIndex(idx);

        const container = listRef.current;
        const slots = container.querySelectorAll<HTMLDivElement>('[data-card-slot="1"]');
        const target = slots[idx];
        if (!target) return;

        const containerRect = container.getBoundingClientRect();
        const targetRect = target.getBoundingClientRect();
        const containerCenter = container.scrollLeft + container.clientWidth / 2;
        const targetCenter =
            container.scrollLeft + (targetRect.left - containerRect.left) + targetRect.width / 2;

        container.scrollTo({
            left: container.scrollLeft + (targetCenter - containerCenter),
            behavior: "smooth",
        });
    };

    /* -------- “그 외 혜택” = 맞춤형 + 그외 전체 ------- */
    const allGroups = useMemo<BenefitGroup[]>(() => {
        const p = benefits?.personalized ?? [];
        const o = benefits?.others ?? [];
        return mergeGroups([...p, ...o]);
    }, [benefits]);

    const groupsByCat = useMemo(() => {
        const m = new Map<string, BenefitGroup>();
        for (const g of allGroups) m.set(normCat(g.category), g);
        return m;
    }, [allGroups]);

    const mergedAll = useMemo<BenefitGroup>(
        () => ({ category: "전체", items: allGroups.flatMap((g) => g.items) }),
        [allGroups],
    );

    const selectedGroup: BenefitGroup = useMemo(() => {
        if (activeOther === "전체") return mergedAll;
        return groupsByCat.get(normCat(activeOther)) ?? { category: activeOther, items: [] };
    }, [activeOther, mergedAll, groupsByCat]);

    /* =============== 총 실적/구간(모달) =============== */
    const thisMonthSpend = Math.max(0, Number(activeCard?.thisMonthSpend ?? 420_000));
    const prevMonthSpend = Math.max(0, Number((activeCard as CardSummaryExt)?.prevMonthSpend ?? 380_000));

    const tiersFromApi = (benefits as BenefitsExt | null)?.spendTiers;
    const TIERS: Tier[] = isTierArray(tiersFromApi) && tiersFromApi.length > 0 ? tiersFromApi : DEFAULT_TIERS;
    const tierIdx = findTier(prevMonthSpend, TIERS);
    const currTier = TIERS[tierIdx];
    const nextTier = TIERS[tierIdx + 1];
    const needToNext = nextTier?.min != null ? Math.max(0, nextTier.min - prevMonthSpend) : 0;

    const meterMax = currTier?.max ?? 1_000_000;
    const meterPct = Math.min(100, meterMax > 0 ? (thisMonthSpend / meterMax) * 100 : 0);

    const barRatio = (() => {
        if (!currTier) return 0;
        if (currTier.max == null) return 1;
        const span = currTier.max - currTier.min;
        const pos = Math.min(currTier.max, Math.max(currTier.min, prevMonthSpend)) - currTier.min;
        return Math.max(0, Math.min(1, span > 0 ? pos / span : 0));
    })();

    // === 전체 월 예산(목표 대비 사용률 & 잔여 금액) ===
    const usedPct = useMemo(() => {
        if (!budget) return 0;
        const { amountTarget, amountSpent } = budget;
        if (!amountTarget || amountTarget <= 0) return 0;
        return Math.round(Math.min(100, Math.max(0, (amountSpent / amountTarget) * 100)));
    }, [budget]);

    const remainingText = useMemo(() => {
        if (!budget) return "-";
        return `${Math.max(0, budget.amountRemaining).toLocaleString()}원`;
    }, [budget]);

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
                <Button
                    className={styles.sectionLikeBtn}
                    onClick={() => setShowBerryPick(true)}
                >
          <span className={styles.btnInner}>
            <img src={berrylogo} alt="베리로고" className={styles.berryselectLogo} />
            <span className={styles.btnText}>베리픽 결제 추천 받기</span>
          </span>
                </Button>
            </div>

            {/* BerryPickPage를 바로 렌더 */}
            {showBerryPick && <BerryPickPage />}

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
                                />
                            </div>
                            <div className={styles.statusValue}>
                                {Math.floor(thisMonthSpend / 10_000)}/{Math.floor(meterMax / 10_000)}만원
                            </div>
                            <div className={styles.statusMeter}>
                                <div className={styles.statusMeterFill} style={{ width: `${meterPct}%` }} />
                            </div>
                        </div>

                        {/* 잔여 예산 (피그마 프로그레스바) */}
                        <div className={styles.budgetCard} role="group" aria-label="잔여 예산">
                            <div className={styles.budgetLabel}>잔여 예산</div>

                            <div className={styles.budgetValue}>{remainingText}</div>

                            {/* Track */}
                            <div className={styles.budgetBarTrackFx} aria-hidden="true">
                                {/* Fill */}
                                <div
                                    className={`${styles.budgetBarFillFx} ${budget?.exceeded ? styles.budgetBarFillOverFx : ""}`}
                                    style={{ width: `${Math.max(0, Math.min(100, usedPct))}%` }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </SectionBox>

            {/* 맞춤형 혜택 */}
            <SectionBox width={352} padding="16px" outlined shadow={false}>
                <div className={styles.benefitsBox}>
                    <div className={styles.sectionTitle}>맞춤형 혜택</div>

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
                                            선호 카테고리 기반 개인화는 일시적으로 비활성화되어 있어요. (기본 혜택을 확인해 보세요)
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
                                                title={cat}
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
                    <div className={styles.modalHandle} />
                    <div className={styles.modalHeader}>
                        <div className={styles.modalTitle}>카드 이용실적 · 혜택</div>
                    </div>

                    <div className={styles.progressTitle}>실적 인정금액</div>

                    <div className={styles.tierProgressWrap}>
                        <div className={styles.tierProgressRail}>
                            <div className={styles.tierProgressFill} style={{ width: `${barRatio * 100}%` }} />
                        </div>
                        <div className={styles.tierLabels}>
                            <span>0구간</span>
                            <span>1구간</span>
                            <span>2구간</span>
                        </div>
                    </div>

                    <div className={styles.nextBox}>
                        <div className={styles.nextInline}>
                            <span className={styles.nextPrefix}>다음 구간 까지</span>
                            <strong className={styles.nextAmount}>{formatMoney(needToNext)}</strong>
                            <span className={styles.nextSuffix}>남았어요</span>
                        </div>
                    </div>

                    <div className={styles.subSectionHeader}>구간별 혜택 내용</div>

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