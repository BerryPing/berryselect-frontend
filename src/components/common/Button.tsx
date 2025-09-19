type Variant = "purple" | "gray";

interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    fullWidth?: boolean;
    variant?: Variant;
}

export default function Button({
                                   children,
                                   fullWidth,
                                   variant = "purple",
                                   ...rest
                               }: Props) {
    const background =
        variant === "purple" ? "var(--theme-primary)" : "var(--slogan-gray)";
    const color =
        variant === "purple" ? "var(--color-white)" : "var(--theme-text)";
    const border =
        variant === "purple"
            ? "1px solid var(--theme-primary)"
            : "1px solid var(--slogan-gray)";

    // 1) 오프셋은 '래퍼'가 담당 → 52% 고정
    const wrapperStyle = fullWidth
        ? { width: "100%" }
        : {
            position: "relative" as const,
            left: "52%",
            transform: "translateX(-52%)",
            width: 352,
        };

    // 2) 버튼은 scale만 → 위치 흔들림 0
    const buttonBaseStyle: React.CSSProperties = {
        display: "inline-flex",
        justifyContent: "center",
        alignItems: "center",
        width: "100%",
        height: 43,
        padding: "0 16px",
        borderRadius: 9,
        border,
        background,
        color,
        fontWeight: 600,
        fontSize: 16,
        fontFamily: "Inter, sans-serif",
        lineHeight: "24px",
        cursor: "pointer",
        boxSizing: "border-box",
        transform: "scale(1)",
        transformOrigin: "center",
        transition: "transform 0.08s ease, filter 0.15s ease",
        outline: "none",
        appearance: "none",
        WebkitAppearance: "none",
        MozAppearance: "none",
    };

    return (
        <div style={wrapperStyle}>
            <button
                {...rest}
                style={buttonBaseStyle}
                onMouseDown={(e) => {
                    e.currentTarget.style.transform = "scale(0.97)";
                }}
                onMouseUp={(e) => {
                    e.currentTarget.style.transform = "scale(1)";
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "scale(1)";
                }}
                onTouchStart={(e) => {
                    e.currentTarget.style.transform = "scale(0.97)";
                }}
                onTouchEnd={(e) => {
                    e.currentTarget.style.transform = "scale(1)";
                }}
            >
                {children}
            </button>
        </div>
    );
}