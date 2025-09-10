import React from 'react';

interface HomeAlertCardProps {
    // 알림 제목
    title?: string;

    // 알림 내용/부제목
    description?: string;

    // 아이콘 (이모지 또는 텍스트)
    icon?: string;

    // 아이콘 배경색
    iconBgColor?: string;

    // 아이콘 텍스트 색상
    iconTextColor?: string;

    // 카드 클릭 핸들러
    onCardClick?: () => void;
}

const HomeAlertCard: React.FC<HomeAlertCardProps> = ({
                                                         title = '기프티콘 만료 D-3',
                                                         icon = '🔔',
                                                         iconBgColor = 'var(--theme-text-light-yellow, #FEF3CD)',
                                                         iconTextColor = 'var(--theme-text-bold-yellow, #92400E)',
                                                         onCardClick
                                                     }) => {
    return (
        <div
            style={{
                width: 352,
                padding: 17,
                background: 'var(--color-white, white)',
                boxShadow: '0px 4px 12px -4px rgba(0, 0, 0, 0.10)',
                overflow: 'hidden',
                borderRadius: 12,
                outline: '1px var(--theme-secondary, #E5D5F0) solid',
                outlineOffset: '-1px',
                justifyContent: 'flex-start',
                alignItems: 'center',
                gap: 12,
                display: 'flex',
                boxSizing: 'border-box',
                cursor: onCardClick ? 'pointer' : 'default',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease'
            }}
            onClick={onCardClick}
            onMouseEnter={(e) => {
                if (onCardClick) {
                    e.currentTarget.style.transform = 'translateY(-1px)';
                    e.currentTarget.style.boxShadow = '0px 6px 16px -4px rgba(0, 0, 0, 0.15)';
                }
            }}
            onMouseLeave={(e) => {
                if (onCardClick) {
                    e.currentTarget.style.transform = 'translateY(0px)';
                    e.currentTarget.style.boxShadow = '0px 4px 12px -4px rgba(0, 0, 0, 0.10)';
                }
            }}
        >
            {/* 아이콘 영역 */}
            <div style={{
                width: 40,
                height: 40,
                background: iconBgColor,
                borderRadius: 20,
                justifyContent: 'center',
                alignItems: 'center',
                display: 'flex'
            }}>
                <div style={{
                    textAlign: 'center',
                    justifyContent: 'center',
                    display: 'flex',
                    flexDirection: 'column',
                    color: iconTextColor,
                    fontSize: 10.4,
                    fontFamily: 'Roboto, sans-serif',
                    fontWeight: '400',
                    wordWrap: 'break-word'
                }}>
                    {icon}
                </div>
            </div>

            {/* 텍스트 영역 */}
            <div style={{
                flex: '1 1 0',
                flexDirection: 'column',
                justifyContent: 'flex-start',
                alignItems: 'flex-start',
                gap: 2,
                display: 'flex'
            }}>
                {/* 제목 */}
                <div style={{
                    alignSelf: 'stretch',
                    paddingTop: 4,
                    paddingBottom: 2,
                    flexDirection: 'column',
                    justifyContent: 'flex-start',
                    alignItems: 'flex-start',
                    display: 'flex'
                }}>
                    <div style={{
                        alignSelf: 'stretch',
                        justifyContent: 'center',
                        display: 'flex',
                        flexDirection: 'column',
                        color: 'var(--theme-text, #3C1053)',
                        fontSize: 14.4,
                        fontFamily: 'Roboto, sans-serif',
                        fontWeight: '700',
                        wordWrap: 'break-word'
                    }}>
                        {title}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HomeAlertCard;