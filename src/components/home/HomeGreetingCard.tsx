import React from 'react';
import { Bell } from 'lucide-react';
import berryLogo from '@/assets/imgs/berrylogo.png';

interface HomeGreetingCardProps {
    // 사용자 이름
    userName?: string;

    // 프로필 이미지 URL (선택적, 기본값은 berrylogo)
    profileImage?: string;

    // 절약 금액
    savingsAmount?: number;

    // 카드 클릭 핸들러
    onCardClick?: () => void;

    // 알림 아이콘 클릭 핸들러
    onNotificationClick?: () => void;
}

const HomeGreetingCard: React.FC<HomeGreetingCardProps> = ({
                                                               userName = '김베리',
                                                               profileImage = berryLogo,
                                                               savingsAmount = 23400,
                                                               onCardClick,
                                                               onNotificationClick
                                                           }) => {
    const formatAmount = (amount: number) => {
        return amount.toLocaleString();
    };

    return (
        <div
            style={{
                width: 352,
                height: 87,
                position: 'relative',
                background: 'var(--color-white-solid, white)',
                boxShadow: '0px 8px 20px -12px rgba(0, 0, 0, 0.15)',
                overflow: 'hidden',
                borderRadius: 16,
                outline: '1px var(--color-violet-89, #E5D5F0) solid',
                outlineOffset: '-1px',
                cursor: onCardClick ? 'pointer' : 'default'
            }}
            onClick={onCardClick}
        >
            {/* 메인 콘텐츠 영역 */}
            <div style={{
                width: 318,
                height: 53,
                left: 17,
                top: 17,
                position: 'absolute'
            }}>
                {/* 텍스트 콘텐츠 영역 */}
                <div style={{
                    width: 243,
                    height: 53,
                    left: 0,
                    top: 0,
                    position: 'absolute'
                }}>
                    {/* 프로필 아바타 배경 */}
                    <div style={{
                        width: 48,
                        height: 48,
                        padding: 2,
                        left: 0,
                        top: 2.5,
                        position: 'absolute',
                        background: '#FAF7FB',
                        borderRadius: 24,
                        outline: '2px #E5D5F0 solid',
                        outlineOffset: '-2px',
                        justifyContent: 'center',
                        alignItems: 'center',
                        display: 'flex'
                    }}>
                        {/* 프로필 이미지 */}
                        <img
                            src={profileImage}
                            alt="프로필"
                            style={{
                                width: 40,
                                height: 40,
                                borderRadius: 20,
                                objectFit: 'cover'
                            }}
                        />
                    </div>

                    {/* 텍스트 영역 */}
                    <div style={{
                        left: 60,
                        top: 0,
                        position: 'absolute',
                        flexDirection: 'column',
                        justifyContent: 'flex-start',
                        alignItems: 'flex-start',
                        gap: 4,
                        display: 'flex'
                    }}>
                        {/* 인사말 */}
                        <div style={{
                            alignSelf: 'stretch',
                            paddingTop: 1,
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
                                color: 'var(--color-violet-19, #3C1053)',
                                fontSize: 17.6,
                                fontFamily: 'Roboto, sans-serif',
                                fontWeight: '800',
                                wordWrap: 'break-word'
                            }}>
                                안녕하세요 {userName}님
                            </div>
                        </div>

                        {/* 절약 메시지 */}
                        <div style={{
                            alignSelf: 'stretch',
                            paddingTop: 1,
                            paddingBottom: 2,
                            flexDirection: 'column',
                            justifyContent: 'flex-start',
                            alignItems: 'flex-start',
                            display: 'flex'
                        }}>
                            <div style={{
                                justifyContent: 'flex-start',
                                display: 'flex',
                                flexDirection: 'row',
                                alignItems: 'baseline',
                                gap: '5px'
                            }}>
                                <span style={{
                                    color: 'var(--color-violet-55, #9B4DCC)',
                                    fontSize: 13.6,
                                    fontFamily: 'Roboto, sans-serif',
                                    fontWeight: '400',
                                    wordWrap: 'break-word'
                                }}>
                                    이번 달
                                </span>
                                <span style={{
                                    color: 'var(--color-violet-25, #5F0080)',
                                    fontSize: 13.6,
                                    fontFamily: 'Roboto, sans-serif',
                                    fontWeight: '700',
                                    wordWrap: 'break-word'
                                }}>
                                    {formatAmount(savingsAmount)}원
                                </span>
                                <span style={{
                                    color: 'var(--color-violet-55, #9B4DCC)',
                                    fontSize: 13.6,
                                    fontFamily: 'Roboto, sans-serif',
                                    fontWeight: '400',
                                    wordWrap: 'break-word'
                                }}>
                                    절약했어요 💰
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 알림 아이콘 */}
                <div
                    style={{
                        width: 24,
                        height: 24,
                        left: 289,
                        top: 15,
                        position: 'absolute',
                        overflow: 'hidden',
                        cursor: onNotificationClick ? 'pointer' : 'default'
                    }}
                    onClick={(e) => {
                        e.stopPropagation(); // 카드 클릭 이벤트 방지
                        if (onNotificationClick) {
                            onNotificationClick();
                        }
                    }}
                >
                    <Bell size={22} color="#5F0080" />
                </div>
            </div>
        </div>
    );
};

export default HomeGreetingCard;