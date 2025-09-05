// src/components/common/SectionBox.tsx
import type { CSSProperties, ReactNode } from "react";
import type { AssetTab } from "@/components/wallet/AssetTabs";

interface SectionBoxProps {
    children?: ReactNode;
    className?: string;
    style?: CSSProperties;
    width?: number | string;
    fullWidth?: boolean;
    padding?: number | string;
    outlined?: boolean;
    shadow?: boolean;
    tab?: AssetTab;
    currentTab?: AssetTab;
}

export default function SectionBox({
                                       children,
                                       className,
                                       style,
                                       width = 352,
                                       fullWidth = false,
                                       padding = 16,
                                       outlined = true,
                                       shadow = false,
                                       tab,
                                       currentTab,
                                   }: SectionBoxProps) {

    if (tab && currentTab && tab !== currentTab) return null;

    const resolvedWidth =
        fullWidth ? "100%" : typeof width === "number" ? `${width}px` : width;

    return (
        <div
            className={className}
            style={{
                width: resolvedWidth,
                boxSizing: "border-box",
                ...(fullWidth
                    ? {}
                    : {
                        position: "relative",
                        left: "52%",
                        transform: "translateX(-52%)",
                    }),
                marginTop: 12,
                background: "#fff",
                borderRadius: 12,
                ...(outlined ? { border: "1px solid var(--theme-secondary)" } : {}),
                ...(shadow
                    ? { boxShadow: "0 8px 20px -12px rgba(0,0,0,.15)" }
                    : {}),
                padding: typeof padding === "number" ? `${padding}px` : padding,
                ...style,
            }}
        >
            {children}
        </div>
    );
}