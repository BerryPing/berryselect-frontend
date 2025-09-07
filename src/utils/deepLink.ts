/** 공용 DeepLink 타입 */
export interface DeepLink {
    iosScheme?: string;
    iosStore?: string;
    androidScheme?: string;
    androidIntent?: string;
    androidStore?: string;
    web?: string;
}

export type OpenDeepLinkOptions = {
    fallbackDelayMs?: number;
    openWebInNewTab?: boolean;
};

/** 안전한 UA 읽기(SSR 가드) */
function getUA(): string {
    if (typeof navigator === "undefined") return "";
    return navigator.userAgent || "";
}

/** navigator 안전 참조 (any 금지) */
type SafeNavigator = Navigator & {
    platform?: string;
    maxTouchPoints?: number;
};
function getNav(): SafeNavigator | undefined {
    if (typeof navigator === "undefined") return undefined;
    return navigator as SafeNavigator;
}

/** iOS 판별: iPadOS 13+ (MacIntel + touch) 포함 */
function isIOS(): boolean {
    const ua = getUA();
    const classic = /iPad|iPhone|iPod/.test(ua);

    const nav = getNav();
    const iPadLike =
        !!nav &&
        nav.platform === "MacIntel" &&
        typeof nav.maxTouchPoints === "number" &&
        nav.maxTouchPoints > 1;

    return classic || iPadLike;
}

/** Android 판별 */
function isAndroid(): boolean {
    return /Android/.test(getUA());
}

/** 웹 폴백 열기 */
function openWeb(url: string, newTab: boolean) {
    try {
        if (newTab) {
            window.open(url, "_blank", "noopener,noreferrer");
        } else {
            window.location.href = url;
        }
    } catch {
        window.location.href = url;
    }
}

/** 카드 앱 딥링크 열기 (iOS/Android/웹 폴백) */
export function openDeepLink(
    deepLink?: DeepLink,
    options?: OpenDeepLinkOptions
) {
    if (!deepLink) return;
    if (typeof window === "undefined" || typeof document === "undefined") return;

    const { fallbackDelayMs = 1200, openWebInNewTab = true } = options || {};
    let fallbackTimer: number | undefined;

    const clearFallback = () => {
        if (fallbackTimer) {
            window.clearTimeout(fallbackTimer);
            fallbackTimer = undefined;
        }
    };

    const onVisibilityChange = () => {
        if (document.visibilityState === "hidden") {
            clearFallback();
            document.removeEventListener("visibilitychange", onVisibilityChange);
        }
    };

    const setFallback = (fn: () => void) => {
        document.addEventListener("visibilitychange", onVisibilityChange);
        fallbackTimer = window.setTimeout(() => {
            if (document.visibilityState === "hidden") {
                clearFallback();
                document.removeEventListener("visibilitychange", onVisibilityChange);
                return;
            }
            fn();
            document.removeEventListener("visibilitychange", onVisibilityChange);
        }, fallbackDelayMs);
    };

    try {
        // iOS
        if (isIOS() && deepLink.iosScheme) {
            window.location.href = deepLink.iosScheme;

            if (deepLink.iosStore) {
                setFallback(() => {
                    window.location.href = deepLink.iosStore as string;
                });
            } else if (deepLink.web) {
                setFallback(() => {
                    openWeb(deepLink.web as string, openWebInNewTab);
                });
            }
            return;
        }

        // Android
        if (isAndroid()) {
            if (deepLink.androidIntent) {
                window.location.href = deepLink.androidIntent;
            } else if (deepLink.androidScheme) {
                window.location.href = deepLink.androidScheme;
            }

            if (deepLink.androidStore) {
                setFallback(() => {
                    window.location.href = deepLink.androidStore as string;
                });
            } else if (deepLink.web) {
                setFallback(() => {
                    openWeb(deepLink.web as string, openWebInNewTab);
                });
            }
            return;
        }

        // 데스크톱/기타
        if (deepLink.web) {
            openWeb(deepLink.web, openWebInNewTab);
        }
    } catch (e) {
        console.error("openDeepLink error:", e);
        if (deepLink.web) openWeb(deepLink.web, openWebInNewTab);
    }
}