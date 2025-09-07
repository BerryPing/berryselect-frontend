import type { DeepLink } from "@/components/wallet/CardCatalog";

/** 카드 앱 딥링크 열기 (iOS/Android/웹 폴백) */
export function openDeepLink(deepLink?: DeepLink) {
    if (!deepLink) return;

    const ua = navigator.userAgent || "";
    const isIOS = /iPad|iPhone|iPod/.test(ua);
    const isAndroid = /Android/.test(ua);

    try {
        if (isIOS && deepLink.iosScheme) {
            window.location.href = deepLink.iosScheme;
            setTimeout(() => {
                if (deepLink.iosStore) window.location.href = deepLink.iosStore;
            }, 1200);
            return;
        }

        if (isAndroid) {
            if (deepLink.androidIntent) {
                window.location.href = deepLink.androidIntent;
            } else if (deepLink.androidScheme) {
                window.location.href = deepLink.androidScheme;
            }
            setTimeout(() => {
                if (deepLink.androidStore) window.location.href = deepLink.androidStore;
            }, 1200);
            return;
        }

        if (deepLink.web) window.open(deepLink.web, "_blank");
    } catch (e) {
        console.error("openDeepLink error:", e);
        if (deepLink.web) window.open(deepLink.web, "_blank");
    }
}