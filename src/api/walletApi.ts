// src/api/walletApi.ts
import http from "./http";
import type { Budget } from "@/api/myberryApi.ts";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

/* =====================
 * 공통 타입
 * ===================== */
export type GifticonStatus = "ACTIVE" | "USED" | "EXPIRED";

/* =====================
 * Cards
 * ===================== */

// (선택) 카드별 잔여 예산 — 현재는 사용 안 하면 지워도 OK
export async function fetchCardBudget(cardId: number, yearMonth?: string) {
    const res = await http.get<Budget>(`/wallet/cards/${cardId}/budget`, {
        baseURL: API_BASE,
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
    const res = await http.get<CardsEnvelope>("/wallet/cards", { baseURL: API_BASE });
    const body = res.data;

    if (body?.type === "CARD" && Array.isArray(body.items)) {
        return body.items.map((it) => {
            const productId =
                (it.productId as number | undefined) ?? (it.product_id as number | undefined);

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
    const res = await http.get<CardDetail>(`/wallet/cards/${cardId}`, { baseURL: API_BASE });
    return res.data;
}

/** GET /wallet/cards/{cardId}/benefits */
export async function getCardBenefits(
    cardId: number | string
): Promise<CardBenefitsGrouped> {
    const res = await http.get<
        CardBenefitsGrouped & {
        spend_tiers?: Array<{ label: string; min: number; max: number | null }>;
        benefit_note_html?: string;
    }
    >(`/wallet/cards/${cardId}/benefits`, { baseURL: API_BASE });

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
export interface Gifticon {
    gifticonId: number;
    code?: string;
    name?: string;
    amount?: number;
    expireDate?: string; // yyyy-MM-dd
    status?: GifticonStatus;
    brand?: string;
    [key: string]: unknown;
}

type GifticonListEnvelope = {
    type: "GIFTICON";
    items: Array<Record<string, unknown>>;
};
type GifticonDetailApi = Record<string, unknown>;

export async function getGifticons(params?: {
    status?: GifticonStatus;
    soonDays?: number;
    page?: number;
    size?: number;
    sort?: string;
}): Promise<Gifticon[]> {
    const res = await http.get<GifticonListEnvelope>("/wallet/gifticons", {
        baseURL: API_BASE,
        params,
    });
    const env = res.data;
    if (env?.type !== "GIFTICON" || !Array.isArray(env.items)) return [];
    return env.items.map(normalizeGifticon);
}

export async function getGifticonDetail(
    gifticonId: number | string
): Promise<Gifticon> {
    const res = await http.get<GifticonDetailApi>(`/wallet/gifticons/${gifticonId}`, {
        baseURL: API_BASE,
    });
    return normalizeGifticon(res.data);
}

export type GifticonCreateReq = {
    productId: number;
    barcode: string;
    balance?: number;
    expiresAt?: string; // yyyy-MM-dd
};

export async function createGifticon(payload: GifticonCreateReq): Promise<Gifticon> {
    const res = await http.post<GifticonDetailApi>("/wallet/gifticons", payload, {
        baseURL: API_BASE,
    });
    return normalizeGifticon(res.data);
}

export async function createGifticonByImage(payload: {
    file: File;
    productId: number;
    barcode?: string;
    balance?: number;
    expiresAt?: string;
}): Promise<Gifticon> {
    const form = new FormData();
    form.append("image", payload.file);
    form.append("productId", String(payload.productId));
    if (payload.barcode) form.append("barcode", payload.barcode);
    if (payload.balance != null) form.append("balance", String(payload.balance));
    if (payload.expiresAt) form.append("expiresAt", payload.expiresAt);

    const res = await http.post<GifticonDetailApi>("/wallet/gifticons", form, {
        baseURL: API_BASE,
        headers: { "Content-Type": "multipart/form-data" },
    });
    return normalizeGifticon(res.data);
}

export async function updateGifticonStatus(
    gifticonId: number | string,
    status: GifticonStatus
): Promise<Gifticon> {
    const res = await http.put<GifticonDetailApi>(`/wallet/gifticons/${gifticonId}`, null, {
        baseURL: API_BASE,
        params: { status },
    });
    return normalizeGifticon(res.data);
}

export async function redeemGifticon(
    gifticonId: number | string,
    usedAmount: number
): Promise<Gifticon | Record<string, unknown>> {
    const res = await http.post(`/wallet/gifticons/${gifticonId}/redeem`, null, {
        baseURL: API_BASE,
        params: { usedAmount },
    });
    return res.data;
}

function normalizeGifticon(raw: Record<string, unknown>): Gifticon {
    const id = (raw.id as number) ?? (raw.gifticonId as number);
    const productName = (raw.productName as string) ?? (raw.name as string) ?? undefined;
    const barcode = (raw.barcode as string) ?? (raw.code as string) ?? undefined;
    const balance = (raw.balance as number) ?? (raw.amount as number) ?? undefined;
    const expires = (raw.expiresAt as string) ?? (raw.expireDate as string) ?? undefined;
    const status =
        (raw.status as GifticonStatus | undefined) ??
        (raw.gifticonStatus as GifticonStatus | undefined);
    const brand =
        (raw.brand as string) ?? (raw.productBrand as string) ?? undefined;

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
        name?: string;
        externalNo?: string;
        level?: string;
        [key: string]: unknown;
    }>;
};

export async function getMemberships(): Promise<Membership[]> {
    const res = await http.get<MembershipListEnvelope>("/wallet/memberships", {
        baseURL: API_BASE,
    });
    const env = res.data;
    if (env?.type !== "MEMBERSHIP" || !Array.isArray(env.items)) return [];
    return env.items.map((it) => ({
        membershipId: it.id,
        program: it.name,
        membershipNumber: it.externalNo,
        tier: it.level,
    }));
}

export async function getMembershipDetail(
    membershipId: number | string
): Promise<Membership> {
    const res = await http.get<Record<string, unknown>>(`/wallet/memberships/${membershipId}`, {
        baseURL: API_BASE,
    });
    const raw = res.data;
    return {
        membershipId: (raw.id as number) ?? (raw.membershipId as number),
        program: (raw.name as string) ?? (raw.program as string),
        membershipNumber: (raw.externalNo as string) ?? (raw.membershipNumber as string),
        tier: (raw.level as string) ?? (raw.tier as string),
    };
}

export async function createMembership(payload: {
    productId: number;
    externalNo: string;
    level?: string;
}): Promise<Membership> {
    const res = await http.post<Record<string, unknown>>("/wallet/memberships", payload, {
        baseURL: API_BASE,
    });
    const raw = res.data;
    return {
        membershipId: (raw.id as number) ?? (raw.membershipId as number),
        program: (raw.name as string) ?? (raw.program as string),
        membershipNumber: (raw.externalNo as string) ?? (raw.membershipNumber as string),
        tier: (raw.level as string) ?? (raw.tier as string),
    };
}