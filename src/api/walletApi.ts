import http from "./http";
import type {Budget} from "@/api/myberryApi.ts";

/* =====================
 * 공통 타입
 * ===================== */
export type GifticonStatus = "ACTIVE" | "USED" | "EXPIRED";

/* =====================
 * Cards
 * ===================== */

// 잔여 예산
export async function fetchCardBudget(cardId: number, yearMonth?: string) {
    const res = await http.get<Budget>(`/wallet/cards/${cardId}/budget`, {
        params: yearMonth ? { yearMonth } : undefined,
    });
    return res.data;
}

export interface CardSummary {
    cardId: number;
    assetId?: number;
    name?: string;
    issuer?: string;
    last4?: string;
    thisMonthSpend?: number;
    prevMonthSpend?: number;
    [key: string]: unknown;
}

export interface CardDetail extends CardSummary {
    [key: string]: unknown;
}

export type SpendTier = { label: string; min: number; max: number | null };

type CardsEnvelope = {
    type: "CARD";
    items: Array<{
        id: number;
        productId?: number;
        product_id?: number;
        productName?: string;
        name?: string;
        issuer?: string;
        last4?: string;
        thisMonthSpend?: number;
        prevMonthSpend?: number;
        prev_month_Spend?: number;
        [key: string]: unknown;
    }>;
};

export async function getCards(): Promise<CardSummary[]> {
    const res = await http.get<CardsEnvelope>("/wallet/cards");
    const body = res.data;

    if (body?.type === "CARD" && Array.isArray(body.items)) {
        return body.items.map((it) => {
            const productId =
                (it.productId as number | undefined) ??
                (it.product_id as number | undefined);

            return {
                cardId: productId ?? it.id,
                assetId: it.id,
                name: it.productName ?? it.name,
                issuer: it.issuer,
                last4: it.last4,
                thisMonthSpend: it.thisMonthSpend,
            };
        });
    }
    return [];
}

export interface BenefitItem {
    brand: string;
    title: string;
    subtitle?: string;
}
export interface BenefitGroup {
    category: string;
    items: BenefitItem[];
}
export interface CardBenefitsGrouped {
    personalized: BenefitGroup[];
    others: BenefitGroup[];
    spendTiers?: SpendTier[];
    benefitNoteHtml?: string;
}

/** GET /wallet/cards/{cardId} */
export async function getCardDetail(cardId: number | string): Promise<CardDetail> {
    const res = await http.get<CardDetail>(`/wallet/cards/${cardId}`);
    return res.data;
}

/** GET /wallet/cards/{cardId}/benefits */
export async function getCardBenefits(
    cardId: number | string
): Promise<CardBenefitsGrouped> {
    const res = await http.get<CardBenefitsGrouped & {
        spend_tiers?: Array<{ label: string; min: number; max: number | null }>;
        benefit_note_html?: string;
    }>(`/wallet/cards/${cardId}/benefits`);

    const data = res.data;
    const normalized: CardBenefitsGrouped = {
        personalized: Array.isArray(data.personalized) ? data.personalized : [],
        others: Array.isArray(data.others) ? data.others : [],
    };

    const tiers = (data.spendTiers ?? data.spend_tiers) as SpendTier[] | undefined;
    if (Array.isArray(tiers)) {
        normalized.spendTiers = tiers.map((t) => ({
            label: String(t.label ?? ""),
            min: Number(t.min ?? 0),
            max: t.max == null ? null : Number(t.max),
        }));
    }
    const note = (data.benefitNoteHtml ?? data.benefit_note_html) as string | undefined;
    if (note) normalized.benefitNoteHtml = note;

    return normalized;
}

/* =====================
 * Gifticons
 * ===================== */
/** 프론트 표준 Gifticon (섹션 컴포넌트와 호환) */
export interface Gifticon {
    gifticonId: number;
    code?: string;        // = barcode
    name?: string;        // = productName or name
    amount?: number;      // = balance
    expireDate?: string;  // = expiresAt (yyyy-MM-dd)
    status?: GifticonStatus;
    [key: string]: unknown;
}

type GifticonListEnvelope = {
    type: "GIFTICON";
    items: Array<Record<string, unknown>>; // { id, productName, barcode, balance, expiresAt, status }
};
type GifticonDetailApi = Record<string, unknown>;

/** 목록: GET /wallet/gifticons (status, soonDays, page, size, sort 옵션) */
export async function getGifticons(params?: {
    status?: GifticonStatus;
    soonDays?: number;
    page?: number;
    size?: number;
    sort?: string; // e.g. "expiresAt,asc"
}): Promise<Gifticon[]> {
    const res = await http.get<GifticonListEnvelope>("/wallet/gifticons", { params });
    const env = res.data;
    if (env?.type !== "GIFTICON" || !Array.isArray(env.items)) return [];
    return env.items.map(normalizeGifticon);
}

/** 상세: GET /wallet/gifticons/{gifticonId} */
export async function getGifticonDetail(gifticonId: number | string): Promise<Gifticon> {
    const res = await http.get<GifticonDetailApi>(`/wallet/gifticons/${gifticonId}`);
    return normalizeGifticon(res.data);
}

/** 등록(JSON): POST /wallet/gifticons (consumes: application/json) */
export type GifticonCreateReq = {
    productId: number;
    barcode: string;
    balance?: number;
    expiresAt?: string; // yyyy-MM-dd
};
export async function createGifticon(payload: GifticonCreateReq): Promise<Gifticon> {
    const res = await http.post<GifticonDetailApi>("/wallet/gifticons", payload);
    return normalizeGifticon(res.data);
}

/** 등록(Multipart): POST /wallet/gifticons (consumes: multipart/form-data) */
export async function createGifticonByImage(payload: {
    file: File;
    productId: number;
    barcode?: string;
    balance?: number;
    expiresAt?: string;
}): Promise<Gifticon> {
    const form = new FormData();
    form.append("image", payload.file); // 필드명 반드시 "image"
    form.append("productId", String(payload.productId));
    if (payload.barcode) form.append("barcode", payload.barcode);
    if (payload.balance != null) form.append("balance", String(payload.balance));
    if (payload.expiresAt) form.append("expiresAt", payload.expiresAt);

    const res = await http.post<GifticonDetailApi>("/wallet/gifticons", form, {
        headers: { "Content-Type": "multipart/form-data" },
    });
    return normalizeGifticon(res.data);
}

/** 상태 변경: PUT /wallet/gifticons/{gifticonId}?status=ACTIVE|USED|EXPIRED */
export async function updateGifticonStatus(
    gifticonId: number | string,
    status: GifticonStatus
): Promise<Gifticon> {
    const res = await http.put<GifticonDetailApi>(`/wallet/gifticons/${gifticonId}`, null, {
        params: { status },
    });
    return normalizeGifticon(res.data);
}

/** 사용 처리: POST /wallet/gifticons/{gifticonId}/redeem?usedAmount= */
export async function redeemGifticon(
    gifticonId: number | string,
    usedAmount: number
): Promise<Gifticon | Record<string, unknown>> {
    const res = await http.post(`/wallet/gifticons/${gifticonId}/redeem`, null, {
        params: { usedAmount },
    });
    // 204(no content)일 수도 있으므로 그대로 반환
    return res.data;
}

/** 백엔드 → 프론트 표준 Gifticon 매핑 */
function normalizeGifticon(raw: Record<string, unknown>): Gifticon {
    const id = (raw.id as number) ?? (raw.gifticonId as number);
    const productName =
        (raw.productName as string) ??
        (raw.name as string) ??
        undefined;
    const barcode =
        (raw.barcode as string) ??
        (raw.code as string) ??
        undefined;
    const balance =
        (raw.balance as number) ??
        (raw.amount as number) ??
        undefined;
    const expires =
        (raw.expiresAt as string) ??
        (raw.expireDate as string) ??
        undefined;
    const status =
        (raw.status as GifticonStatus | undefined) ??
        (raw.gifticonStatus as GifticonStatus | undefined);
    const brand =
        (raw.brand as string) ??
        (raw.productBrand as string) ??
        undefined;

    return {
        gifticonId: id!,
        name: productName,
        code: barcode,
        amount: balance,
        expireDate: expires,
        status,
        brand,
    };
}

/* =====================
 * Memberships
 * ===================== */
export interface Membership {
    membershipId: number;
    program?: string;
    membershipNumber?: string;
    tier?: string;
    [key: string]: unknown;
}

type MembershipListEnvelope = {
    type: "MEMBERSHIP";
    items: Array<{
        id: number;
        name?: string;       // product.name
        externalNo?: string; // membership number
        level?: string;      // tier
        [key: string]: unknown;
    }>;
};

export async function getMemberships(): Promise<Membership[]> {
    const res = await http.get<MembershipListEnvelope>("/wallet/memberships");
    const env = res.data;
    if (env?.type !== "MEMBERSHIP" || !Array.isArray(env.items)) return [];
    return env.items.map((it) => ({
        membershipId: it.id,
        program: it.name,
        membershipNumber: it.externalNo,
        tier: it.level,
    }));
}

/** GET /wallet/memberships/{membershipId} */
export async function getMembershipDetail(membershipId: number | string): Promise<Membership> {
    const res = await http.get<Record<string, unknown>>(`/wallet/memberships/${membershipId}`);
    const raw = res.data;
    return {
        membershipId: (raw.id as number) ?? (raw.membershipId as number),
        program: (raw.name as string) ?? (raw.program as string),
        membershipNumber: (raw.externalNo as string) ?? (raw.membershipNumber as string),
        tier: (raw.level as string) ?? (raw.tier as string),
    };
}

/** POST /wallet/memberships */
export async function createMembership(payload: {
    productId: number;
    externalNo: string;
    level?: string;
}): Promise<Membership> {
    const res = await http.post<Record<string, unknown>>("/wallet/memberships", payload);
    const raw = res.data;
    return {
        membershipId: (raw.id as number) ?? (raw.membershipId as number),
        program: (raw.name as string) ?? (raw.program as string),
        membershipNumber: (raw.externalNo as string) ?? (raw.membershipNumber as string),
        tier: (raw.level as string) ?? (raw.tier as string),
    };
}