import React from 'react';

interface AiSummaryCardProps {
    summary: string;
    isLoading?: boolean;
}

const AiSummaryCard: React.FC<AiSummaryCardProps> = ({
                                                         summary,
                                                         isLoading = false
                                                     }) => {
    return (
        <div style={{
            width: 310,
            height: 'auto',
            minHeight: 146,
            position: 'relative',
            background: 'var(--theme-bg)',
            boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.05)',
            borderRadius: 16,
            outline: '1px var(--theme-secondary) solid',
            outlineOffset: '-1px',
            padding: 12,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
        }}>
            {/* 내용 */}
            <div style={{
                textAlign: 'center',
                color: 'var(--theme-text)',
                fontSize: 12,
                fontFamily: 'inherit',
                fontWeight: '400',
                lineHeight: '18px',
                wordBreak: 'keep-all',
                whiteSpace: 'pre-line'
            }}>
                {isLoading ? (
                    <div style={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        color: 'var(--theme-text-light)'
                    }}>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8
                        }}>
                            <div style={{
                                width: 16,
                                height: 16,
                                border: '2px solid var(--theme-secondary)',
                                borderTop: '2px solid var(--theme-primary)',
                                borderRadius: '50%',
                                animation: 'spin 1s linear infinite'
                            }} />
                            AI가 분석 중입니다...
                        </div>
                    </div>
                ) : summary ? (
                    summary
                ) : (
                    <div style={{
                        color: 'var(--theme-text-light)',
                        fontStyle: 'italic'
                    }}>
                        아직 분석 결과가 없습니다.
                    </div>
                )}
            </div>

            {/* 스피너 애니메이션 */}
            <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
        </div>
    );
};

// 사용 예시 컴포넌트
export const AiSummaryCardExample: React.FC = () => {
    const sampleSummary = `관광 지출이 전체의 1.7%로 낮은 편이므로, 다음 여행에서는 더 다양한 체험 활동을 고려해보는 것도 좋겠습니다.

교통 및 숙박 지출이 전체의 73%로 압도적으로 높은 비중을 차지해, 조기 예약이나 대중교통 이용 등도 검토해볼 수 있습니다.`;

    return (
        <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 20 }}>
            <h3>AI 분석 카드 예시</h3>

            {/* 정상 상태 */}
            <AiSummaryCard summary={sampleSummary} />

            {/* 로딩 상태 */}
            <AiSummaryCard summary="" isLoading={true} />

            {/* 빈 상태 */}
            <AiSummaryCard summary="" />
        </div>
    );
};

export default AiSummaryCard;