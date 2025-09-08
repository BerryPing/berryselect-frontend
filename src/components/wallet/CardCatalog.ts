export type DeepLink = {
    iosScheme?: string;
    androidScheme?: string;
    androidIntent?: string;
    iosStore?: string;
    androidStore?: string;
    web?: string;
};

export type CardMeta = {
    imageUrl: string;
    deepLink?: DeepLink;
};

export const CARD_CATALOG: Record<string, CardMeta> = {
    "노리2 체크카드": {
        imageUrl: "https://img1.kbcard.com/ST/img/cxc/kbcard/upload/img/product/07964_img.png",
        deepLink: {
            iosScheme: "kbcard://home",
            androidScheme: "kbcard://home",
            androidIntent: "intent://home#Intent;scheme=kbcard;package=com.kbcard.kbkookmincard;end",
            iosStore: "itms-apps://itunes.apple.com/app/idXXXXXXXX",
            androidStore: "market://details?id=com.kbcard.kbkookmincard",
            web: "https://www.kbcard.com",
        },
    },
    "현대카드 ZERO Edition2(포인트형)": {
        imageUrl: "https://www.hyundaicard.com/img/com/card_big_h/card_MZROE2_h.png",
        deepLink: {
            iosScheme: "hyundaicard://home",
            androidScheme: "hyundaicard://home",
            androidIntent: "intent://home#Intent;scheme=hyundaicard;package=com.hyundaicard.appcard;end",
            iosStore: "itms-apps://itunes.apple.com/app/idXXXXXXXX",
            androidStore: "market://details?id=com.hyundaicard.appcard",
            web: "https://www.hyundaicard.com",
        },
    },
    "NH 올원 체크카드": {
        imageUrl: "https://d1c5n4ri2guedi.cloudfront.net/card/368/card_img/20609/368card.jpg",
        deepLink: {
            iosScheme: "nhcard://home",
            androidScheme: "nhcard://home",
            androidIntent: "intent://home#Intent;scheme=nhcard;package=nh.smart.card;end",
            iosStore: "itms-apps://itunes.apple.com/app/idXXXXXXXX",
            androidStore: "market://details?id=nh.smart.card",
            web: "https://card.nonghyup.com",
        },
    },
};

export function getCardMeta(name?: string): CardMeta | undefined {
    if (!name) return;
    const normalized = name.replace(/\s+/g, " ").trim();
    return CARD_CATALOG[normalized] ?? CARD_CATALOG[name];
}

export function getCardImage(name?: string): string | undefined {
    return getCardMeta(name)?.imageUrl;
}