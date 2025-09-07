import {useEffect, useRef, useState} from "react";
import SectionBox from "@/components/common/SectionBox";
import CardItem from "@/components/wallet/CardItem";
import berrylogo from "@/assets/imgs/berrylogo.png";
import { getCards, type CardSummary } from "@/api/walletApi";
import styles from "./WalletPage.module.css";
import Button from "@/components/common/Button.tsx";
import {getCardImage, getCardMeta} from "@/components/wallet/CardCatalog.ts";
import {openDeepLink} from "@/utils/deeplink.ts";

/** Card */
export default function CardSection() {
    // 카드 목록
    const [cards, setCards] = useState<CardSummary[]>([]);
    const [loadingCards, setLoadingCards] = useState(false);
    const [cardsError, setCardsError] = useState<string | null>(null);

    // 활성화된 카드
    const [activeIndex, setActiveIndex] = useState(0);
    const listRef = useRef<HTMLDivElement>(null);

    // TODO: 추후 API 연결에 사용
    // const activeCard = cards[activeIndex];

    // 최초 카드 목록 로드
    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                setLoadingCards(true);
                setCardsError(null);
                const list = await getCards();
                if (mounted) setCards(list);
            } catch {
                if (mounted) setCardsError("카드 목록을 불러오지 못했습니다.");
            } finally {
                if (mounted) setLoadingCards(false);
            }
        })();
        return () => {
            mounted = false;
        };
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
        const el = listRef.current;
        if (!el) return;

        let raf = 0;
        const onScroll = () => {
            if (raf) cancelAnimationFrame(raf);
            raf = requestAnimationFrame(() => {
                const container = listRef.current!;
                const children = Array.from(
                    container.querySelectorAll<HTMLDivElement>('[data-card-slot="1"]')
                );

                if (!children.length) return;
                const containerCenter =
                    container.scrollLeft + container.clientWidth / 2;

                let bestIdx = 0;
                let bestDist = Number.POSITIVE_INFINITY;

                const containerRect = container.getBoundingClientRect();
                children.forEach((child, idx) => {
                    const rect = child.getBoundingClientRect();
                    const childCenter =
                        container.scrollLeft +
                        (rect.left - containerRect.left) +
                        rect.width / 2;
                    const dist = Math.abs(childCenter - containerCenter);
                    if (dist < bestDist) {
                        bestDist = dist;
                        bestIdx = idx;
                    }
                });

                if (bestIdx !== activeIndex) setActiveIndex(bestIdx);
            });
        };

        el.addEventListener("scroll", onScroll, { passive: true });
        return () => {
            el.removeEventListener("scroll", onScroll);
            if (raf) cancelAnimationFrame(raf);
        };
    }, [activeIndex]);

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

    return (
        <>
            <SectionBox width={352} padding="0px 16px 23px" outlined shadow={false} >
                <div className={styles.sectionTitleCompact}>보유 카드</div>

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
        </>
    );
}