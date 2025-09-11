import React from 'react';
import {ChevronRight} from "lucide-react";

interface StatItemData {
    value: string;
    label: string;
    color: string;
}

interface StatItemProps {
    // 통계 데이터 배열
    stats?: StatItemData[];

    // 목표 설정 버튼 표시 여부
    showGoalButton?: boolean;

    // 목표 설정 버튼 클릭 핸들러
    onGoalClick?: () => void;

    // 카드 클릭 핸들러
    onCardClick?: () => void;
}

const StatItem: React.FC<StatItemProps> = ({
                                               stats = [
                                                   { value: '+12,400원', label: '이번 달\n절감금액', color: 'var(--theme-text-green, #059669)' },
                                                   { value: '76%', label: '추천\n사용률', color: 'var(--theme-primary, #5F0080)' },
                                                   { value: '58,000원', label: '이번 달\n잔여예산', color: 'var(--theme-text, #3C1053)' }
                                               ],
                                               showGoalButton = true,
                                               onGoalClick,
                                               onCardClick
                                           }) => {
    return (
        <div
            style={{
                width: 352,
                height: 131,
                position: 'relative',
                background: 'var(--color-white, white)',
                boxShadow: '0px 8px 20px -12px rgba(0, 0, 0, 0.15)',
                overflow: 'hidden',
                borderRadius: 16,
                outline: '1px var(--theme-secondary, #E5D5F0) solid',
                outlineOffset: '-1px',
                cursor: onCardClick ? 'pointer' : 'default'
            }}
            onClick={onCardClick}
        >
            {/* 목표 설정하기 버튼 - 오른쪽 상단 */}
            {showGoalButton && (
                <div
                    style={{
                        right: 16,
                        top: 3,
                        zIndex: 10,
                        position: 'absolute',
                        textAlign: 'center',
                        justifyContent: 'center',
                        alignItems: 'center',
                        display: 'flex',
                        flexDirection: 'row',
                        gap: '2px',
                        color: 'var(--theme-text-light, #9B4DCC)',
                        fontSize: 12,
                        fontFamily: 'Roboto, sans-serif',
                        fontWeight: '400',
                        lineHeight: 3,
                        wordWrap: 'break-word',
                        cursor: onGoalClick ? 'pointer' : 'default',
                    }}
                    onClick={(e) => {
                        e.stopPropagation(); // 카드 클릭 이벤트 방지
                        if (onGoalClick) {
                            onGoalClick();
                        }
                    }}
                >
                    <span>목표 설정하기</span>
                    <ChevronRight size={14} color="var(--theme-text-light, #9B4DCC)" />
                </div>
            )}

            {/* 통계 항목들 컨테이너 */}
            <div style={{
                width: 318,
                height: 85,
                left: 17,
                top: 32,
                position: 'absolute',
            }}>
                {/* 첫 번째 통계: 절감금액 */}
                <div style={{
                    width: 98,
                    height: 85,
                    paddingLeft: 2,
                    paddingRight: 8,
                    paddingTop: 12,
                    paddingBottom: 12,
                    left: 0,
                    top: 0,
                    position: 'absolute',
                    flexDirection: 'column',
                    justifyContent: 'flex-start',
                    alignItems: 'flex-start',
                    gap: 4,
                    display: 'flex',
                }}>
                    {/* 첫 번째 값 */}
                    <div style={{
                        alignSelf: 'stretch',
                        paddingTop: 1,
                        paddingBottom: 2,
                        flexDirection: 'column',
                        justifyContent: 'flex-start',
                        alignItems: 'center',
                        display: 'flex',
                    }}>
                        <div style={{
                            alignSelf: 'stretch',
                            textAlign: 'center',
                            justifyContent: 'center',
                            display: 'flex',
                            flexDirection: 'column',
                            color: stats[0]?.color || 'var(--theme-text-green, #059669)',
                            fontSize: 17.6,
                            fontFamily: 'Roboto, sans-serif',
                            fontWeight: '700',
                            wordWrap: 'break-word',
                        }}>
                            {stats[0]?.value || '+12,400원'}
                        </div>
                    </div>

                    {/* 첫 번째 라벨 */}
                    <div style={{
                        alignSelf: 'stretch',
                        flexDirection: 'column',
                        justifyContent: 'flex-start',
                        alignItems: 'center',
                        display: 'flex'
                    }}>
                        <div style={{
                            alignSelf: 'stretch',
                            textAlign: 'center',
                            justifyContent: 'center',
                            display: 'flex',
                            flexDirection: 'column',
                            color: 'var(--theme-text-light, #9B4DCC)',
                            fontSize: 12,
                            fontFamily: 'Roboto, sans-serif',
                            fontWeight: '400',
                            lineHeight: 1.5,
                            wordWrap: 'break-word',
                        }}>
                            {stats[0]?.label?.split('\n').map((line, lineIndex) => (
                                <React.Fragment key={lineIndex}>
                                    {line}
                                    {lineIndex < (stats[0]?.label?.split('\n').length || 1) - 1 && <br />}
                                </React.Fragment>
                            )) || <>이번 달<br/>절감금액</>}
                        </div>
                    </div>
                </div>

                {/* 두 번째 통계: 추천 사용률 */}
                <div style={{
                    width: 98,
                    height: 85,
                    paddingLeft: 8,
                    paddingRight: 8,
                    paddingTop: 12,
                    paddingBottom: 12,
                    left: 110,
                    top: 0,
                    position: 'absolute',
                    flexDirection: 'column',
                    justifyContent: 'flex-start',
                    alignItems: 'flex-start',
                    gap: 4,
                    display: 'flex',
                }}>
                    {/* 두 번째 값 */}
                    <div style={{
                        alignSelf: 'stretch',
                        paddingTop: 1,
                        paddingBottom: 2,
                        flexDirection: 'column',
                        justifyContent: 'flex-start',
                        alignItems: 'center',
                        display: 'flex',
                    }}>
                        <div style={{
                            alignSelf: 'stretch',
                            textAlign: 'center',
                            justifyContent: 'center',
                            display: 'flex',
                            flexDirection: 'column',
                            color: stats[1]?.color || 'var(--theme-primary, #5F0080)',
                            fontSize: 17.6,
                            fontFamily: 'Roboto, sans-serif',
                            fontWeight: '700',
                            wordWrap: 'break-word'
                        }}>
                            {stats[1]?.value || '76%'}
                        </div>
                    </div>

                    {/* 두 번째 라벨 */}
                    <div style={{
                        alignSelf: 'stretch',
                        flexDirection: 'column',
                        justifyContent: 'flex-start',
                        alignItems: 'center',
                        display: 'flex'
                    }}>
                        <div style={{
                            alignSelf: 'stretch',
                            textAlign: 'center',
                            justifyContent: 'center',
                            display: 'flex',
                            flexDirection: 'column',
                            color: 'var(--theme-text-light, #9B4DCC)',
                            fontSize: 12,
                            fontFamily: 'Roboto, sans-serif',
                            fontWeight: '400',
                            lineHeight: 1.5,
                            wordWrap: 'break-word',
                        }}>
                            {stats[1]?.label?.split('\n').map((line, lineIndex) => (
                                <React.Fragment key={lineIndex}>
                                    {line}
                                    {lineIndex < (stats[1]?.label?.split('\n').length || 1) - 1 && <br />}
                                </React.Fragment>
                            )) || <>추천<br/>사용률</>}
                        </div>
                    </div>
                </div>

                {/* 세 번째 통계: 잔여예산 */}
                <div style={{
                    width: 98,
                    height: 85,
                    paddingLeft: 8,
                    paddingRight: 8,
                    paddingTop: 12,
                    paddingBottom: 12,
                    left: 220,
                    top: 0,
                    position: 'absolute',
                    flexDirection: 'column',
                    justifyContent: 'flex-start',
                    alignItems: 'flex-start',
                    gap: 4,
                    display: 'flex'
                }}>
                    {/* 세 번째 값 */}
                    <div style={{
                        alignSelf: 'stretch',
                        paddingTop: 1,
                        paddingBottom: 2,
                        flexDirection: 'column',
                        justifyContent: 'flex-start',
                        alignItems: 'center',
                        display: 'flex',
                    }}>
                        <div style={{
                            alignSelf: 'stretch',
                            textAlign: 'center',
                            justifyContent: 'center',
                            display: 'flex',
                            flexDirection: 'column',
                            color: stats[2]?.color || 'var(--theme-text, #3C1053)',
                            fontSize: 17.6,
                            fontFamily: 'Roboto, sans-serif',
                            fontWeight: '700',
                            wordWrap: 'break-word'
                        }}>
                            {stats[2]?.value || '58,000원'}
                        </div>
                    </div>

                    {/* 세 번째 라벨 */}
                    <div style={{
                        alignSelf: 'stretch',
                        flexDirection: 'column',
                        justifyContent: 'flex-start',
                        alignItems: 'center',
                        display: 'flex'
                    }}>
                        <div style={{
                            alignSelf: 'stretch',
                            textAlign: 'center',
                            justifyContent: 'center',
                            display: 'flex',
                            flexDirection: 'column',
                            color: 'var(--theme-text-light, #9B4DCC)',
                            fontSize: 12,
                            fontFamily: 'Roboto, sans-serif',
                            fontWeight: '400',
                            lineHeight: 1.5,
                            wordWrap: 'break-word',
                        }}>
                            {stats[2]?.label?.split('\n').map((line, lineIndex) => (
                                <React.Fragment key={lineIndex}>
                                    {line}
                                    {lineIndex < (stats[2]?.label?.split('\n').length || 1) - 1 && <br />}
                                </React.Fragment>
                            )) || <>이번 달<br/>잔여예산</>}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StatItem;