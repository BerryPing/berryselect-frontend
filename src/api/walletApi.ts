import http from "./http";

/** ───────── Types ───────── */
export interface CardSummary {
    cardId: number;
    name?: string;
    issuer?: string;
    last4?: string;
    [key: string]: unknown;
}

export interface CardDetail extends CardSummary {
    [key: string]: unknown;
}

export type GifticonStatus = "ACTIVE" | "USED" | "EXPIRED";

export interface Gifticon {
    gifticonId: number;
    code?: string;
    brand?: string;
    name?: string;
    expireDate?: string; // 'YYYY-MM-DD'
    amount?: number;
    status?: GifticonStatus;
    [key: string]: unknown;
}

export type GifticonCreateByNumberReq = {
    code: string;
    brand?: string;
    name?: string;
    expireDate?: string;
    amount?: number;
};

export type GifticonCreateByImageReq = {
    file: File;
    brand?: string;
    name?: string;
    expireDate?: string;
    amount?: number;
};

export interface Membership {
    membershipId: number;
    program?: string;
    membershipNumber?: string;
    tier?: string;
    [key: string]: unknown;
}

/** ───────── Cards ───────── */
/** GET /wallet/cards */
export async function getCards(): Promise<CardSummary[]> {
    const res = await http.get<{ cards?: CardSummary[] } | CardSummary[]>("/wallet/cards");
    const data = res.data;
    return Array.isArray(data) ? data : data.cards ?? [];
}

/** GET /wallet/cards/{cardId} */
export async function getCardDetail(cardId: number | string): Promise<CardDetail> {
    const res = await http.get<CardDetail>(`/wallet/cards/${cardId}`);
    return res.data;
}

/** ───────── Gifticons ───────── */
/** GET /wallet/gifticons */
export async function getGifticons(): Promise<Gifticon[]> {
    const res = await http.get<Gifticon[]>("/wallet/gifticons");
    return res.data;
}

/** POST /wallet/gifticons (번호 입력: JSON) */
export async function createGifticonByNumber(payload: GifticonCreateByNumberReq): Promise<Gifticon> {
    const res = await http.post<Gifticon>("/wallet/gifticons", payload);
    return res.data;
}

/** POST /wallet/gifticons (이미지 업로드: multipart/form-data) */
export async function createGifticonByImage(payload: GifticonCreateByImageReq): Promise<Gifticon> {
    const form = new FormData();
    form.append("file", payload.file);
    if (payload.brand) form.append("brand", payload.brand);
    if (payload.name) form.append("name", payload.name);
    if (payload.expireDate) form.append("expireDate", payload.expireDate);
    if (payload.amount != null) form.append("amount", String(payload.amount));

    const res = await http.post<Gifticon>("/wallet/gifticons", form);
    return res.data;
}

/** GET /wallet/gifticons/{gifticonId} */
export async function getGifticonDetail(gifticonId: number | string): Promise<Gifticon> {
    const res = await http.get<Gifticon>(`/wallet/gifticons/${gifticonId}`);
    return res.data;
}

/** PUT /wallet/gifticons/{gifticonId}?status=ACTIVE|USED|EXPIRED */
export async function updateGifticonStatus(
    gifticonId: number | string,
    status: GifticonStatus
): Promise<Gifticon> {
    const res = await http.put<Gifticon>(`/wallet/gifticons/${gifticonId}`, null, {
        params: { status },
    });
    return res.data;
}

/** POST /wallet/gifticons/{gifticonId}/redeem?usedAmount= */
export async function redeemGifticon(
    gifticonId: number | string,
    usedAmount: number
): Promise<Gifticon | Record<string, unknown>> {
    const res = await http.post(`/wallet/gifticons/${gifticonId}/redeem`, null, {
        params: { usedAmount },
    });
    return res.data;
}

/** DELETE /wallet/gifticons/{gifticonId} */
export async function deleteGifticon(gifticonId: number | string): Promise<void> {
    await http.delete(`/wallet/gifticons/${gifticonId}`);
}

/** ───────── Memberships ───────── */
/** GET /wallet/memberships */
export async function getMemberships(): Promise<Membership[]> {
    const res = await http.get<Membership[]>("/wallet/memberships");
    return res.data;
}

/** POST /wallet/memberships */
export async function createMembership(payload: {
    program: string;
    membershipNumber: string;
    tier?: string;
}): Promise<Membership> {
    const res = await http.post<Membership>("/wallet/memberships", payload);
    return res.data;
}

/** GET /wallet/memberships/{membershipId} */
export async function getMembershipDetail(membershipId: number | string): Promise<Membership> {
    const res = await http.get<Membership>(`/wallet/memberships/${membershipId}`);
    return res.data;
}

/** DELETE /wallet/memberships/{membershipId} */
export async function deleteMembership(membershipId: number | string): Promise<void> {
    await http.delete(`/wallet/memberships/${membershipId}`);
}