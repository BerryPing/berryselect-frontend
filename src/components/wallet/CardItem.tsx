export interface CardItemProps {
    cardId?: number;        // 카드 ID
    name: string;           // 카드 이름
    benefit?: string;       // 혜택 요약
    limit?: string;         // 한도 표시
    color?: string;         // 카드 배경 색상
    onClick?: (cardId?: number) => void;
}

export default function CardItem({
                                     cardId,
                                     name,
                                     benefit,
                                     limit,
                                     color = "var(--theme-primary)",  // 기본값 보라색
                                     onClick,
                                 }: CardItemProps) {
    return (
        <div
            onClick={() => onClick?.(cardId)}
            style={{
                width: "220px",
                height: "140px",
                borderRadius: "16px",
                background: color,
                color: "white",
                padding: "20px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                boxShadow: "0px 8px 20px -12px rgba(0,0,0,0.15)",
                cursor: onClick ? "pointer" : "default",
                transition: "transform 0.2s ease, box-shadow 0.2s ease",
            }}
        >
            {/* 상단 영역 */}
            <div style={{ display: "flex", justifyContent: "space-between" }}>
                <div style={{ fontSize: "16px", fontWeight: 700 }}>{name}</div>
                <div
                    style={{
                        background: "rgba(255,255,255,0.2)",
                        borderRadius: "8px",
                        padding: "2px 8px",
                        fontSize: "12px",
                        fontWeight: 600,
                    }}
                >
                    결제
                </div>
            </div>

            {/* 혜택 */}
            {benefit && (
                <div
                    style={{
                        background: "rgba(255,255,255,0.2)",
                        borderRadius: "8px",
                        padding: "4px 8px",
                        fontSize: "13px",
                        fontWeight: 500,
                        display: "inline-block",
                    }}
                >
                    {benefit}
                </div>
            )}

            {/* 한도 */}
            {limit && (
                <div style={{ fontSize: "12px", opacity: 0.9 }}>
                    한도 <span style={{ fontWeight: 600 }}>{limit}</span>
                </div>
            )}
        </div>
    );
}