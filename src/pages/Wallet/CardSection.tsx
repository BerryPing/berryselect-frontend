// src/pages/Wallet/CardSection.tsx
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import SectionBox from "@/components/common/SectionBox";
import CardItem from "@/components/wallet/CardItem";
import berrylogo from "@/assets/imgs/berrylogo.png";
import {
    type CardSummary,
    getCards,
    getCardBenefits,
    type CardBenefitsGrouped,
    type BenefitGroup,
    type BenefitItem,
} from "@/api/walletApi";
import styles from "./WalletPage.module.css";
import Button from "@/components/common/Button.tsx";
import { getCardImage, getCardMeta } from "@/components/wallet/CardCatalog.ts";
import { openDeepLink } from "@/utils/deepLink.ts";
import { getUserSettings, type UserSettingsResponse } from "@/api/userApi.ts";

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

const catEmoji: Record<string, string> = {
    전체: "🐾",
    카페: "☕",
    편의점: "🏪",
    교통: "🚗",
    쇼핑: "🛒",
    음식: "🍽️",
    기타: "✨",
};

/** 카테고리 문자열 정규화 */
const normCat = (s?: string) =>
    (s ?? "")
        .normalize("NFKC")
        .replace(/[^\p{L}\p{N}]+/gu, "")
        .toLowerCase();

/** "카페"처럼 마스터 라벨을 정규화 키로 역매핑 */
const MASTER_NORM_MAP = new Map<string, MasterCat>(
    (MASTER_CATS as readonly string[]).map((c) => [normCat(c), c as MasterCat])
);

/* =============== Utils =============== */
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

/* =============== Component =============== */
export default function CardSection() {
    // 카드 목록
    const [cards, setCards] = useState<CardSummary[]>([]);
    const [loadingCards, setLoadingCards] = useState(false);
    const [cardsError, setCardsError] = useState<string | null>(null);
    const listRef = useRef<HTMLDivElement>(null);

    // 활성 카드
    const [activeIndex, setActiveIndex] = useState(0);
    const activeCard = cards[activeIndex];

    // 혜택/개인화
    const [benefits, setBenefits] = useState<CardBenefitsGrouped | null>(null);
    const [loadingBenefits, setLoadingBenefits] = useState(false);
    const [benefitsError, setBenefitsError] = useState<string | null>(null);
    const [activeOther, setActiveOther] = useState<MasterCat>("전체");

    // 사용자 설정
    const [settings, setSettings] = useState<UserSettingsResponse | null>(null);
    const [loadingSettings, setLoadingSettings] = useState(false);

    /* 1) 카드 목록 */
    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                setLoadingCards(true);
                setCardsError(null);
                const list = await getCards();
                if (cancelled) return;
                setCards(list);
                setActiveIndex(0);
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
        return () => {
            cancelled = true;
        };
    }, []);

    /* 3) 혜택 로드 (카드 변경/설정 변경 시) */
    useEffect(() => {
        if (!activeCard?.cardId) {
            setBenefits(null);
            setActiveOther("전체");
            return;
        }

        let cancelled = false;
        setLoadingBenefits(true);
        setBenefitsError(null);

        getCardBenefits(activeCard.cardId)
            .then((res) => {
                if (cancelled) return;
                setBenefits(res);

                // others의 실제 존재 카테고리(정규화 키)
                const available = new Set((res.others ?? []).map((g) => normCat(g.category)));

                // 사용자 선호 중에서 실제 존재하는 첫 항목 찾기 → 마스터 라벨로 복원
                let next: MasterCat | undefined;
                for (const c of settings?.preferredCategories ?? []) {
                    const key = normCat(c);
                    if (available.has(key)) {
                        const mapped = MASTER_NORM_MAP.get(key);
                        if (mapped) {
                            next = mapped;
                            break;
                        }
                    }
                }
                setActiveOther(next ?? "전체");
            })
            .catch((e: unknown) => {
                if (cancelled) return;
                const msg = e instanceof Error ? e.message : "혜택을 불러오지 못했습니다.";
                setBenefitsError(msg);
            })
            .finally(() => {
                if (!cancelled) setLoadingBenefits(false);
            });

        return () => {
            cancelled = true;
        };
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
        const el = listRef.current;
        if (!el) return;
        el.addEventListener("scroll", onScroll, { passive: true });
        return () => el.removeEventListener("scroll", onScroll);
    }, [onScroll]);

    /* 카드 표시 이름 */
    const cardDisplayName = (c: CardSummary): string => {
        if (c.name) return c.name;
        const issuer = c.issuer ?? "카드";
        const last4 = c.last4 ? ` •••• ${c.last4}` : "";
        return `${issuer}${last4}`;
    };

    /* 카드 클릭 → 중앙 정렬 */
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

    /* 최초 렌더 후 보정 */
    useEffect(() => {
        if (!listRef.current || cards.length === 0) return;
        setActiveIndex(computeActiveIndex(listRef.current));
    }, [cards.length]);

    /* -------- "그 외 혜택" 가공 -------- */
    const others = benefits?.others ?? [];

    // 정규화 키로 맵 구성
    const othersByCat = useMemo(() => {
        const m = new Map<string, BenefitGroup>();
        for (const g of others) m.set(normCat(g.category), g);
        return m;
    }, [others]);

    // 전체 탭: 모든 items 합치기
    const mergedAll = useMemo<BenefitGroup>(() => {
        return { category: "전체", items: others.flatMap((g) => g.items) };
    }, [others]);

    // 선택된 탭의 그룹 계산(정규화 키 비교)
    const selectedGroup: BenefitGroup = useMemo(() => {
        if (activeOther === "전체") return mergedAll;
        return othersByCat.get(normCat(activeOther)) ?? { category: activeOther, items: [] };
    }, [activeOther, mergedAll, othersByCat]);

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

            {/* 이번 달 현황(더미) */}
            <SectionBox width={352} padding="16px" outlined shadow={false}>
                <div className={styles.statusCardWrap}>
                    <div className={styles.statusTitle}>이번 달 현황</div>
                    <div className={styles.statusRow}>
                        <div className={styles.statusCard}>
                            <div className={styles.statusLabel}>총 실적</div>
                            <div className={styles.statusValue}>42/100만원</div>
                            <div className={styles.statusMeter}>
                                <div className={styles.statusMeterFill} />
                            </div>
                        </div>
                        <div className={styles.budgetCard}>
                            <div className={styles.budgetLabel}>잔여 예산</div>
                            <div className={styles.budgetValue}>120,000원</div>
                            <div className={styles.budgetMeter}>
                                <div className={styles.budgetMeterFill} />
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

                                {/* 칩: 고정 순서(전체 포함) */}
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
                                            >
                                                <span className={styles.chipIcon}>{catEmoji[cat] ?? "•"}</span>
                                                <span className={styles.chipLabel}>{cat}</span>
                                            </button>
                                        );
                                    })}
                                </div>

                                {/* 선택된 탭 내용 */}
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
        </>
    );
}