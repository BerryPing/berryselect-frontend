import React from 'react';
import { ChevronRight } from 'lucide-react';

interface NotificationCardProps {
    // 알림 ID
    id: string;

    // 가게/브랜드명
    storeName: string;

    // 설명 텍스트
    description: string;

    // 아이콘 텍스트 (브랜드 이니셜)
    iconText: string;

    // 읽음 상태
    isRead?: boolean;

    // 클릭 핸들러
    onCardClick?: (id: string) => void;
}

const NotificationCard: React.FC<NotificationCardProps> = ({
                                                               id,
                                                               storeName,
                                                               description,
                                                               iconText,
                                                               isRead = false,
                                                               onCardClick
                                                           }) => {
    const handleClick = () => {
        if (onCardClick) {
            onCardClick(id);
        }
    };

    return (
        <div
            style={{
                width: 357,
                height: 90,
                position: 'relative',
                background: isRead ? '#FAF7FB' : 'var(--color-white, white)',
                borderRadius: 12,
                outline: isRead
                    ? '1px #5F0080 solid'
                    : '1px var(--theme-secondary, #E5D5F0) solid',
                outlineOffset: '-1px',
                cursor: 'pointer',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease'
            }}
            onClick={handleClick}
            onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0px 4px 12px -4px rgba(0, 0, 0, 0.15)';
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0px)';
                e.currentTarget.style.boxShadow = 'none';
            }}
        >
            {/* 메인 콘텐츠 */}
            <div style={{
                left: 13,
                top: 24.5,
                position: 'absolute',
                justifyContent: 'flex-start',
                alignItems: 'center',
                gap: 12,
                display: 'flex'
            }}>
                {/* 아이콘 */}
                <div style={{
                    width: 40,
                    height: 10,
                    paddingTop: 13.5,
                    paddingBottom: 14.5,
                    backgroundColor: 'var(--theme-bg, #FAF7FB)',
                    borderRadius: 20,
                    justifyContent: 'center',
                    alignItems: 'center',
                    display: 'flex',
                }}>
                    <div style={{
                        textAlign: 'center',
                        justifyContent: 'center',
                        display: 'flex',
                        flexDirection: 'column',
                        color: 'var(--theme-primary, #5F0080)',
                        fontSize: 12.8,
                        fontFamily: 'Roboto, sans-serif',
                        fontWeight: '700',
                        wordWrap: 'break-word'
                    }}>
                        {iconText}
                    </div>
                </div>

                {/* 텍스트 영역 */}
                <div style={{
                    flexDirection: 'column',
                    justifyContent: 'flex-start',
                    alignItems: 'flex-start',
                    gap: 2,
                    display: 'flex'
                }}>
                    {/* 가게명 */}
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
                            color: 'var(--theme-text, #3C1053)',
                            fontSize: 14.4,
                            fontFamily: 'Roboto, sans-serif',
                            fontWeight: '700',
                            wordWrap: 'break-word'
                        }}>
                            {storeName}
                        </div>
                    </div>

                    {/* 설명 */}
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
                            color: 'var(--theme-text-light, #9B4DCC)',
                            fontSize: 12,
                            fontFamily: 'Roboto, sans-serif',
                            fontWeight: '400',
                            wordWrap: 'break-word'
                        }}>
                            {description}
                        </div>
                    </div>
                </div>
            </div>

            {/* 화살표 아이콘 */}
            <div style={{
                left: 328,
                top: 38,
                position: 'absolute',
                justifyContent: 'center',
                alignItems: 'center',
                display: 'flex'
            }}>
                <ChevronRight size={18} color="var(--theme-text-light, #9B4DCC)" />
            </div>
        </div>
    );
};

export default NotificationCard;