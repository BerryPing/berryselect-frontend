import { useEffect, useMemo, useState } from "react";
import SectionBox from "@/components/common/SectionBox";
import CardItem from "@/components/wallet/CardItem";
import Modal from "@/components/common/Modal";
import berrylogo from "@/assets/imgs/berrylogo.png";

import {
    getCards,
    getCardBenefits,
    type CardSummary,
    type CardBenefit,
} from "@/api/walletApi";
import { getCardColor } from "@/components/wallet/cardColors";
import styles from "./WalletPage.module.css";
import Button from "@/components/common/Button.tsx";

/** Card */
export default function CardSection() {
    // 카드 목록
    const [cards, setCards] = useState<CardSummary[]>([]);
    const [loadingCards, setLoadingCards] = useState(false);
    const [cardsError, setCardsError] = useState<string | null>(null);

    // 모달 & 선택 카드
    const [open, setOpen] = useState(false);
    const [selectedCardId, setSelectedCardId] = useState<number | undefined>();

    // 혜택
    const [benefits, setBenefits] = useState<CardBenefit[]>([]);
    const [loadingBenefits, setLoadingBenefits] = useState(false);
    const [benefitError, setBenefitError] = useState<string | null>(null);

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

    // 카드 클릭 → 혜택 로드 & 모달 오픈
    const handleClickCard = async (cardId?: number) => {
        setSelectedCardId(cardId);
        setOpen(true);

        if (!cardId) return;
        try {
            setLoadingBenefits(true);
            setBenefitError(null);
            const list = await getCardBenefits(cardId);
            setBenefits(list);
        } catch {
            setBenefits([]);
            setBenefitError("혜택 정보를 불러오지 못했습니다.");
        } finally {
            setLoadingBenefits(false);
        }
    };

    // 선택된 카드 이름 (모달 헤더용)
    const selectedCardName = useMemo(() => {
        if (!selectedCardId) return "";
        const found = cards.find((c) => c.cardId === selectedCardId);
        return found ? cardDisplayName(found) : "";
    }, [selectedCardId, cards]);

    return (
        <>
            <SectionBox width={352} padding="0px 16px 23px" outlined shadow={false}>
                <div className={styles.sectionTitleCompact}>보유 카드</div>

                {loadingCards && <div className={styles.loading}>불러오는 중…</div>}

                {cardsError && !loadingCards && (
                    <div className={styles.error}>{cardsError}</div>
                )}

                {!loadingCards && !cardsError && cards.length === 0 && (
                    <div className={styles.empty}>보유 카드가 없습니다.</div>
                )}

                {!loadingCards && !cardsError && cards.length > 0 && (
                    <div aria-label="보유 카드 목록" className={styles.hList}>
                        {cards.map((c) => (
                            <div key={c.cardId} className={styles.cardSlot}>
                                <CardItem
                                    cardId={c.cardId}
                                    name={cardDisplayName(c)}
                                    color={getCardColor(c.name)}
                                    onClick={handleClickCard}
                                />
                            </div>
                        ))}
                    </div>
                )}
            </SectionBox>

            {/* 카드 섹션 전용 CTA 버튼 */}
            <div className={styles.actionBtnWrap}>
                <Button className={styles.sectionLikeBtn} onClick={() => setOpen(true)}>
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

            {/* 혜택 모달 */}
            <Modal open={open} onClose={() => setOpen(false)}>
                <div className={styles.modalHeader}>
                    {selectedCardName ? `${selectedCardName} 혜택` : "카드 혜택"}
                </div>
                <div className={styles.modalBody}>
                    {!selectedCardId ? (
                        <div>카드를 선택해 주세요.</div>
                    ) : loadingBenefits ? (
                        <div>혜택 불러오는 중…</div>
                    ) : benefitError ? (
                        <div className={styles.error}>{benefitError}</div>
                    ) : benefits.length === 0 ? (
                        <div className={styles.empty}>혜택 정보가 없습니다.</div>
                    ) : (
                        <ul style={{ paddingLeft: 18, margin: 0 }}>
                            {benefits.map((b) => (
                                <li key={b.id} style={{ marginBottom: 6 }}>
                                    {b.description}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </Modal>
        </>
    );
}