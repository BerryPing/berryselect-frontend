export type AssetTab = "card" | "membership" | "gifticon";

export interface AssetTabsProps {
    value: AssetTab;
    onChange: (next: AssetTab) => void;
    className?: string;
}

const centerFix: React.CSSProperties = {
    position: "relative",
    left: "52%",
    transform: "translateX(-52%)",
};

const wrapStyle: React.CSSProperties = {
    width: 343,
    padding: 5,
    background: "var(--color-white)",
    borderRadius: 12,
    outline: "1px solid var(--theme-secondary)",
    outlineOffset: "-1px",
    display: "inline-flex",
    justifyContent: "center",
    alignItems: "stretch",
    gap: 0,
    ...centerFix,
};

const itemBase: React.CSSProperties = {
    flex: "1 1 0",
    alignSelf: "stretch",
    paddingTop: 12,
    paddingBottom: 10,
    paddingLeft: 16,
    paddingRight: 16,
    borderRadius: 8,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    cursor: "pointer",
    userSelect: "none" as const,
    fontSize: 16,
    fontFamily: "inherit",
    fontWeight: 600,
    textAlign: "center" as const,
    transition: "background-color .15s ease, color .15s ease",
};

const selectedStyle: React.CSSProperties = {
    background: "var(--theme-primary)",
    color: "var(--color-white)",
};

const unselectedStyle: React.CSSProperties = {
    background: "transparent",
    color: "var(--theme-text-light)",
};

const order: AssetTab[] = ["card", "membership", "gifticon"];
const label: Record<AssetTab, string> = {
    card: "카드",
    membership: "멤버십",
    gifticon: "기프티콘",
};

export default function AssetTabs({ value, onChange, className }: AssetTabsProps) {
    return (
        <div className={className} style={wrapStyle} role="tablist" aria-label="지갑 카테고리">
            {order.map((key) => {
                const selected = key === value;
                return (
                    <div
                        key={key}
                        role="tab"
                        aria-selected={selected}
                        tabIndex={0}
                        onClick={() => onChange(key)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                                onChange(key);
                                e.preventDefault();
                            }
                        }}
                        style={{ ...itemBase, ...(selected ? selectedStyle : unselectedStyle) }}
                    >
                        {label[key]}
                    </div>
                );
            })}
        </div>
    );
}