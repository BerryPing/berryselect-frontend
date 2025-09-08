import {useEffect, useRef, useState} from "react";
import SectionBox from "@/components/common/SectionBox";
import CardItem from "@/components/wallet/CardItem";
import berrylogo from "@/assets/imgs/berrylogo.png";
import { getCards, type CardSummary } from "@/api/walletApi";
import styles from "./WalletPage.module.css";
import Button from "@/components/common/Button.tsx";
import {getCardImage, getCardMeta} from "@/components/wallet/CardCatalog.ts";
import {openDeepLink} from "@/utils/deepLink.ts";
import { getCardBenefits, type CardBenefitsGrouped, type BenefitGroup, type BenefitItem } from "@/api/walletApi";

/** Card */
export default function CardSection() {
    // 카드 목록
    const [cards, setCards] = useState<CardSummary[]>([]);
    const [loadingCards, setLoadingCards] = useState(false);
    const [cardsError, setCardsError] = useState<string | null>(null);
    const listRef = useRef<HTMLDivElement>(null);

    // 활성 카드: 항상 첫 번째 카드 기준
    const activeCard = cards[0];

    // 혜택 상태
    const [benefits, setBenefits] = useState<CardBenefitsGrouped | null>(null);
    const [loadingBenefits, setLoadingBenefits] = useState(false);
    const [benefitsError, setBenefitsError] = useState<string | null>(null);
    const [activeOther, setActiveOther] = useState<string | null>(null);

    // 최초 카드 목록 로드
    useEffect(() => {
        let cancelled = false;
            (async () => {
                try {
                    setLoadingCards(true);
                    setCardsError(null);
                    const list = await getCards();
                    if (!cancelled) setCards(list);
                } catch {
                    if (!cancelled) setCardsError("카드 목록을 불러오지 못했습니다.");
                } finally {
                    if (!cancelled) setLoadingCards(false);
                }
            })();
            return () => { cancelled = true; };
        }, []);

    // 카드 표기 이름
    const cardDisplayName = (c: CardSummary): string => {
        if (c.name) return c.name;
        const issuer = c.issuer ?? "카드";
        const last4 = c.last4 ? ` •••• ${c.last4}` : "";
        return `${issuer}${last4}`;
    };

    // 스크롤 감지 → 중앙 카드 찾기
    useEffect(() => {
        if (!activeCard?.cardId) {
            setBenefits(null);
            return;
        }

        let cancelled = false;
        setLoadingBenefits(true);
        setBenefitsError(null);

        getCardBenefits(activeCard.cardId)
            .then((res) => {
                if (cancelled) return;
                setBenefits(res);
                setActiveOther(res?.others?.[0]?.category ?? null);
            })
            .catch((e: unknown) => {
                if (cancelled) return;
                const msg = e instanceof Error ? e.message : "혜택을 불러오지 못했습니다.";
                setBenefitsError(msg);
            })
            .finally(() => {
                if (!cancelled) setLoadingBenefits(false);
            });

        return () => { cancelled = true; };
    }, [activeCard?.cardId]);

    // 카드 클릭 시 스크롤 이동
    const handleSelectCard = (cardId?: number) => {
        if (!cardId) return;
        const idx = cards.findIndex((c) => c.cardId === cardId);
        if (idx >= 0) {
            const container = listRef.current;
            if (!container) return;
            const slots = container.querySelectorAll<HTMLDivElement>(
                '[data-card-slot="1"]'
            );
            const target = slots[idx];
            if (!target) return;

            const containerRect = container.getBoundingClientRect();
            const targetRect = target.getBoundingClientRect();
            const containerCenter =
                container.scrollLeft + container.clientWidth / 2;
            const targetCenter =
                container.scrollLeft +
                (targetRect.left - containerRect.left) +
                targetRect.width / 2;

            container.scrollTo({
                left: container.scrollLeft + (targetCenter - containerCenter),
                behavior: "smooth",
            });
        }
    };

    // 혜택 셀
    const BenefitItemRow = ({ item }: { item: BenefitItem }) => {
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
    };

    const BenefitGroupBlock = ({ group }: { group: BenefitGroup }) => (
        <div className={styles.groupBlock}>
            <div className={styles.groupTitle}>{group.category}</div>
            <div style={{ display: "grid", gap: 12 }}>
                {group.items.map((it, idx) => (
                    <BenefitItemRow key={idx} item={it} />
                ))}
            </div>
        </div>
    );

    const otherCats = (benefits?.others ?? []).map((g) => g.category);

    return (
        <>
            <SectionBox width={352} padding="0px 16px 23px" outlined shadow={false} >
                <div className={styles.sectionTitleCompact}><br/>보유 카드</div>

                {loadingCards && <div className={styles.loading}>불러오는 중…</div>}

                {cardsError && !loadingCards && (
                    <div className={styles.error}>{cardsError}</div>
                )}

                {!loadingCards && !cardsError && cards.length === 0 && (
                    <div className={styles.empty}>보유 카드가 없습니다.</div>
                )}

                {!loadingCards && !cardsError && cards.length > 0 && (
                    <div
                        ref={listRef}
                        aria-label="보유 카드 목록"
                        className={styles.hList}
                    >
                        {cards.map((c) => (
                            <div
                                key={c.cardId}
                                data-card-slot="1"
                                className={styles.cardSlot}
                            >
                                <div className={styles.cardSlotInner}>
                                    <CardItem
                                        cardId={c.cardId}
                                        name={cardDisplayName(c)}
                                        imageUrl={getCardImage(c.name)}
                                        onClick={handleSelectCard}
                                        onOpenApp={() =>
                                            openDeepLink(getCardMeta(c.name)?.deepLink)
                                        }
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </SectionBox>

            {/* 베리픽 버튼: 모달 제거, 추후 API 연결만 */}
            <div className={styles.actionBtnWrap}>
                <Button
                    className={styles.sectionLikeBtn}
                    onClick={() => {
                        // TODO: 베리픽 API 연동
                    }}
                >
                  <span className={styles.btnInner}>
                    <img
                        src={berrylogo}
                        alt="베리로고"
                        className={styles.berryselectLogo}
                    />
                    <span className={styles.btnText}>베리픽 결제 추천 받기</span>
                  </span>
                </Button>
            </div>

            {/* 이번 달 현황 → SectionBox로 래핑 */}
            <SectionBox width={352} padding="16px" outlined shadow={false}>
                <div className={styles.statusCardWrap}>
                    <div className={styles.statusTitle}>이번 달 현황</div>
                    <div className={styles.statusRow}>
                        <div className={styles.statusCard}>
                            <div className={styles.statusLabel}>총 실적</div>
                            <div className={styles.statusValue}>42/100만원</div>  // TODO : 마이베리 연동
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

            {/* 맞춤형 혜택 / 그 외 혜택 → SectionBox로 래핑 */}
            <SectionBox width={352} padding="16px" outlined shadow={false}>
                <div className={styles.benefitsBox}>
                    <div className={styles.sectionTitleCompact}>맞춤형 혜택</div>

                    {loadingBenefits && <div className={styles.loading}>혜택 불러오는 중…</div>}
                    {benefitsError && !loadingBenefits && <div className={styles.error}>{benefitsError}</div>}

                    {!loadingBenefits && !benefitsError && (
                        <>
                            {(benefits?.personalized?.length ?? 0) === 0 ? (
                                <div className={styles.empty}>
                                    회원가입 시 선택한 선호 카테고리가 없어요. (0~3개 선택 가능)
                                </div>
                            ) : (
                                <div>
                                    {benefits!.personalized.map((g, i) => (
                                        <BenefitGroupBlock key={i} group={g} />
                                    ))}
                                </div>
                            )}

                            <div style={{ marginTop: 16 }}>
                                <div className={styles.groupTitle}>그 외 혜택</div>

                                {(benefits?.others?.length ?? 0) > 0 && (
                                    <div className={styles.chipsRow}>
                                        {otherCats.map((cat) => {
                                            const selected = cat === activeOther;
                                            return (
                                                <button
                                                    key={cat}
                                                    type="button"
                                                    className={[
                                                        styles.chip,
                                                        selected ? styles.chipSelected : "",
                                                    ].join(" ")}
                                                    onClick={() => setActiveOther(cat)}
                                                >
                                                    {cat}
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}

                                {(() => {
                                    const activeOtherGroup =
                                        benefits?.others.find((g) => g.category === activeOther) ??
                                        benefits?.others?.[0];
                                    return activeOtherGroup ? (
                                        <BenefitGroupBlock group={activeOtherGroup} />
                                    ) : (
                                        <div className={styles.empty}>표시할 혜택이 없어요.</div>
                                    );
                                })()}
                            </div>
                        </>
                    )}
                </div>
            </SectionBox>
        </>
    );
}