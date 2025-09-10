import React from 'react';
import { Bell } from 'lucide-react';
import berryLogo from '@/assets/imgs/berrylogo.png';
import {useState} from "react";

interface HomeGreetingCardProps {
    userName?: string;
    profileImage?: string;
    unreadCount?: number;
    onCardClick?: () => void;
    onNotificationClick?: () => void;
}

const HomeGreetingCard: React.FC<HomeGreetingCardProps> = ({
                                                               userName = '김베리',
                                                               profileImage = berryLogo,
                                                               unreadCount = 0,
                                                               onCardClick,
                                                               onNotificationClick
                                                           }) => {
    const [isNotificationHovered, setIsNotificationHovered] = useState(false);

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
                        left: 70,
                        top: 14,
                        position: 'absolute',
                        flexDirection: 'column',
                        justifyContent: 'flex-start',
                        alignItems: 'flex-start',
                        gap: 4,
                        display: 'flex',
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
                    </div>
                </div>

                {/* 알림 아이콘 */}
                <div
                    style={{
                        width: 30,
                        height: 30,
                        left: 289,
                        top: 15,
                        position: 'absolute',
                        overflow: 'visible',
                        cursor: onNotificationClick ? 'pointer' : 'default',
                        borderRadius: '20%',
                        backgroundColor: isNotificationHovered ? 'rgba(0, 0, 0, 0.03)' : 'transparent',
                        transition: 'all 0.2s ease',
                        transform: isNotificationHovered ? 'scale(1.1)' : 'scale(1)',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center'
                    }}
                    onMouseEnter={() => setIsNotificationHovered(true)}
                    onMouseLeave={() => setIsNotificationHovered(false)}
                    onClick={(e) => {
                        e.stopPropagation(); // 카드 클릭 이벤트 방지
                        if (onNotificationClick) {
                            onNotificationClick();
                        }
                    }}
                >
                    <Bell size={22} color="#5F0080" />
                    {/* 읽지 않은 알림 배지 */}
                    {unreadCount > 0 && (
                        <div
                            style={{
                                position: 'absolute',
                                top: -2,
                                right: -2,
                                minWidth: 12,
                                height: 12,
                                backgroundColor: '#f2537d', // 빨간색 배지
                                borderRadius: 6,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: 8,
                                fontWeight: '700',
                                color: 'white',
                                fontFamily: 'Roboto, sans-serif',
                                padding: '0 2px',
                                boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.2)',
                                border: '2px solid white', // 배경과 구분되도록 테두리
                                zIndex: 10,
                                maxWidth: 24,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap'
                            }}
                        >
                            {unreadCount > 99 ? '99+' : unreadCount}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default HomeGreetingCard;