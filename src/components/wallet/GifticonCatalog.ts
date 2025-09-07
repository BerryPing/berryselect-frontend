export type GiftMeta = {
    imageUrl: string;
    aliases?: string[];
    brand?: string;
};

const GIFTICON_CATALOG: Record<string, GiftMeta> = {
    "메가커피 복숭아아이스티": {
        imageUrl:
            "https://img.79plus.co.kr/megahp/manager/upload/menu/20240610132446_1717993486995_hvfli27vPn.jpg",
        aliases: ["메가 MGC 커피 : 복숭아 아이스티", "메가 복숭아 아이스티"],
        brand: "MEGACOFFEE",
    },
    "설빙 과일빙수": {
        imageUrl:
            "https://img.daily.co.kr/@files/www.daily.co.kr/content/food/2025/20250616/c9abd4bace51dd88c16a34d5482135de.jpg",
        aliases: ["과일흠뻑화채설빙"],
        brand: "SULBING",
    },
    "GS25 크라운 밤양갱": {
        imageUrl: "https://cdn.imweb.me/thumbnail/20230605/26e17d3894aa0.png",
        aliases: ["크라운)밤양갱"],
        brand: "GS25",
    },
    "올리브영 금액권 2만원": {
        imageUrl:
            "https://d2gfz7wkiigkmv.cloudfront.net/pickin/2/1/2/FRV-T2p3RcOG5hsmJMxUbA",
        aliases: ["올리브영 기프티카드 2만원권"],
        brand: "OLIVEYOUNG",
    },
    "투썸 딸기생크림+아메리카노(R)": {
        imageUrl:
            "https://st.kakaocdn.net/product/gift/product/20250403132345_3f6a6807fde34a3c98f70ef9ee47c5a0.jpg",
        aliases: ["투썸플레이스 : 딸기 생크림 + 아메리카노 (R)"],
        brand: "TWOSOME",
    },
    "베스킨라빈스 파인트 아이스크림": {
        imageUrl:
            "https://cdn.011st.com/11dims/resize/1000x1000/quality/75/11src/product/6089235974/B.jpg?43000000",
        aliases: ["배스킨라빈스 : 파인트 아이스크림"],
        brand: "BASKINROBBINS",
    },
    "스타벅스 아이스 아메리카노 T 2잔": {
        imageUrl:
            "https://image2.lotteimall.com/goods/45/19/56/2908561945_1.jpg/dims/resizemc/550x550/optimize",
        aliases: ["스타벅스 : 아이스 카페 아메리카노 T 2잔"],
        brand: "STARBUCKS",
    },
};

function norm(s: string) {
    return s.replace(/\s+/g, " ").trim();
}

export function getGiftMeta(name?: string): GiftMeta | undefined {
    if (!name) return;
    const n = norm(name);

    if (GIFTICON_CATALOG[n]) return GIFTICON_CATALOG[n];
    for (const [_, meta] of Object.entries(GIFTICON_CATALOG)) {
        if (meta.aliases?.some((a) => norm(a) === n)) return meta;
    }
    return undefined;
}

export function getGiftImage(name?: string): string | undefined {
    return getGiftMeta(name)?.imageUrl;
}