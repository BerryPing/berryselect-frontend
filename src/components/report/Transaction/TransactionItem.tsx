import React from 'react';

interface TransactionItemProps {
    storeName: string;
    amount: number;
    cardCompany: string;
    category: string;
    reward: number;
}

const TransactionItem: React.FC<TransactionItemProps> = ({
                                                             storeName,
                                                             amount,
                                                             cardCompany,
                                                             category,
                                                             reward
                                                         }) => {
    return (
        <div style={{
            width: 334,
            height: 72,
            position: 'relative',
            background: 'var(--color-white)',
            borderRadius: 12,
            outline: '1px var(--theme-secondary) solid',
            outlineOffset: '-1px'
        }}>
            {/* 왼쪽 영역: 상호명, 금액, 카드사, 카테고리 */}
            <div style={{
                minWidth: 156.97,
                left: 13,
                top: 13,
                position: 'absolute',
                flexDirection: 'column',
                justifyContent: 'flex-start',
                alignItems: 'flex-start',
                gap: 2,
                display: 'inline-flex'
            }}>
                {/* 상호명 및 금액 */}
                <div style={{
                    alignSelf: 'stretch',
                    paddingTop: 2,
                    paddingBottom: 1,
                    flexDirection: 'column',
                    justifyContent: 'flex-start',
                    alignItems: 'flex-start',
                    display: 'flex'
                }}>
                    <div style={{
                        justifyContent: 'center',
                        display: 'flex',
                        flexDirection: 'column',
                        color: 'var(--theme-text)',
                        fontSize: 15.2,
                        fontFamily: 'inherit',
                        fontWeight: '700',
                        wordWrap: 'break-word'
                    }}>
                        {storeName} · {amount.toLocaleString()}원
                    </div>
                </div>

                {/* 카드사 및 카테고리 */}
                <div style={{
                    alignSelf: 'stretch',
                    paddingTop: 3,
                    paddingBottom: 2,
                    flexDirection: 'column',
                    justifyContent: 'flex-start',
                    alignItems: 'flex-start',
                    display: 'flex'
                }}>
                    <div style={{
                        justifyContent: 'center',
                        display: 'flex',
                        flexDirection: 'column',
                        color: 'var(--theme-text-light)',
                        fontSize: 12.4,
                        fontFamily: 'inherit',
                        fontWeight: '400',
                        wordWrap: 'break-word'
                    }}>
                        {cardCompany} · {category}
                    </div>
                </div>
            </div>

            {/* 오른쪽 영역: 적립/혜택 금액 */}
            <div style={{
                paddingTop: 3,
                paddingBottom: 2,
                right: 13,
                top: 23,
                position: 'absolute',
                flexDirection: 'column',
                justifyContent: 'flex-start',
                alignItems: 'flex-start',
                display: 'inline-flex'
            }}>
                <div style={{
                    justifyContent: 'center',
                    display: 'flex',
                    flexDirection: 'column',
                    color: 'var(--theme-text-green)',
                    fontSize: 16,
                    fontFamily: 'inherit',
                    fontWeight: '700',
                    wordWrap: 'break-word'
                }}>
                    +{reward.toLocaleString()}원
                </div>
            </div>
        </div>
    );
};

export default TransactionItem;