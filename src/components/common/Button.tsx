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

    // 중앙정렬 (DefaultLayout 기준)
    const centerFix = fullWidth
        ? {}
        : {
            position: "relative" as const,
            left: "52%",
            transform: "translateX(-52%)",
        };

    return (
        <button
            {...rest}
            style={{
                display: "inline-flex",
                justifyContent: "center",
                alignItems: "center",
                width: fullWidth ? "100%" : 352,
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
                transition: "transform 0.1s ease, filter 0.15s ease",
                outline: "none",
                appearance: "none",
                WebkitAppearance: "none",
                MozAppearance: "none",
                ...centerFix,
            }}
            onMouseDown={(e) => {
                e.currentTarget.style.transform = "translateX(-52%) scale(0.97)";
            }}
            onMouseUp={(e) => {
                e.currentTarget.style.transform = "translateX(-52%) scale(1)";
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateX(-52%) scale(1)";
            }}
        >
            {children}
        </button>
    );
}