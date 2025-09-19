export interface CardItemProps {
    cardId?: number;
    name: string;
    imageUrl?: string;
    bg?: string;
    logoUrl?: string;
    onClick?: (cardId?: number) => void | Promise<void>;
    onOpenApp?: (cardId?: number) => void;
    showActionBadge?: boolean;  // 기본값: true
}

export default function CardItem({
                                     cardId,
                                     imageUrl,
                                     onClick,
                                     onOpenApp,
                                     showActionBadge = true,
                                 }: CardItemProps) {
    return (
        <div
            onClick={() => onClick?.(cardId)}
            style={{
                width: 320,
                height: 200,
                position: "relative",
                background: imageUrl
                    ? `url(${imageUrl}) center/cover no-repeat`
                    : "linear-gradient(145deg,var(--theme-text-light) 0%,var(--theme-primary) 100%)",
                boxShadow: "0 8px 32px rgba(0,0,0,.15)",
                overflow: "hidden",
                borderRadius: 20,
                cursor: onClick ? "pointer" : "default",
                transition: "transform .2s ease, box-shadow .2s ease",
            }}
        >
            {/* 상단 바(결제 배지) */}
            {showActionBadge && (
                <div
                    style={{
                        width: 280,
                        height: 28,
                        left: 255,
                        top: 20,
                        position: "absolute",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                    }}
                >
                    <div
                        style={{
                            width: 40,
                            height: 24,
                            background: "rgba(226,232,240,0.2)",
                            borderRadius: 4,
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            boxShadow: "0 2px 6px rgba(0,0,0,.25)",
                        }}
                        onClick={(e) => {
                            e.stopPropagation();
                            onOpenApp?.(cardId);
                        }}
                    >
                        <div style={{ color: "#fff", fontSize: 11, fontWeight: 700 }}>결제</div>
                    </div>
                </div>
            )}
        </div>
    );
}