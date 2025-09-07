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

export default AiSummaryCard;