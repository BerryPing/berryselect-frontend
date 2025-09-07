// src/components/wallet/GifticonScan.ts
import Tesseract from "tesseract.js";
import { BrowserMultiFormatReader } from "@zxing/browser";
import { BarcodeFormat, DecodeHintType, NotFoundException } from "@zxing/library";

/* =========================
   Types
   ========================= */
export type ScanResult = {
    brand?: string | null;
    name?: string | null;
    barcode?: string | null;
    expiresAt?: string | null;
    faceValue?: number | null;
};

/* =========================
   Text utils
   ========================= */
function normalizeText(raw: string): string {
    return raw
        .replace(/\r/g, "")
        .replace(/[’`]/g, "'")
        .replace(/[“”]/g, '"')
        .replace(/[|]/g, "│")
        .replace(/[·•∙]/g, ".")
        .replace(/\s+[.,:;]\s+/g, (m) => m.trim())
        .replace(/[ \t]+\n/g, "\n")
        .replace(/\n{3,}/g, "\n\n")
        // 흔한 오인식 소규모 보정
        .replace(/크라움/g, "크라운")
        .trim();
}

/** 한 글자 토큰이 연속될 때 단어로 붙여줌 */
function collapseInnerSpacing(line: string): string {
    const tokens = line.split(/\s+/);
    const merged: string[] = [];
    let buf: string[] = [];

    const flush = () => {
        if (buf.length === 0) return;
        if (buf.every((t) => t.length === 1) && buf.length >= 3) {
            merged.push(buf.join("")); // 한 글자 다수 → 붙이기
        } else {
            merged.push(...buf);
        }
        buf = [];
    };

    for (const t of tokens) {
        if (t.length === 1) buf.push(t);
        else {
            flush();
            merged.push(t);
        }
    }
    flush();

    return merged.join(" ").replace(/\s{2,}/g, " ").trim();
}

/* =========================
   Field extractors
   ========================= */

/** 만료일: YYYY.MM.DD / YYYY- M- D / YYYY년 M월 D일 등 */
function extractExpiresAt(text: string): string | null {
    // 1) 숫자 구분자 버전
    const m1 = text.match(/(\d{4})[.\-/\s](\d{1,2})[.\-/\s](\d{1,2})/);
    if (m1) {
        const yyyy = m1[1];
        const mm = m1[2].padStart(2, "0");
        const dd = m1[3].padStart(2, "0");
        return `${yyyy}-${mm}-${dd}`;
    }
    // 2) 한글 표기
    const m2 = text.match(/(\d{4})\s*년\s*(\d{1,2})\s*월\s*(\d{1,2})\s*일/);
    if (m2) {
        const yyyy = m2[1];
        const mm = m2[2].padStart(2, "0");
        const dd = m2[3].padStart(2, "0");
        return `${yyyy}-${mm}-${dd}`;
    }
    return null;
}

function extractFaceValue(text: string): number | null {
    // 12,000원 / 12000원
    const m = text.match(/(\d{1,3}(?:,\d{3})+|\d{4,})\s*원/);
    if (!m) return null;
    const raw = m[1].replace(/,/g, "");
    const n = Number.parseInt(raw, 10);
    return Number.isFinite(n) ? n : null;
}

function extractFallbackBarcode(text: string): string | null {
    // 숫자 6자리 이상(공백/하이픈 허용)
    const candidates = text.match(/(?:\d[\s-]?){6,}/g);
    if (!candidates) return null;
    const compact = candidates
        .map((s) => s.replace(/[\s-]/g, ""))
        .find((s) => s.length >= 6);
    return compact ?? null;
}

/** 상품명/브랜드 추출 (개선 버전) */
function extractNameAndBrand(text: string): { name: string | null; brand: string | null } {
    // 1) 라인 전처리
    const rawLines = text
        .split(/\n+/)
        .map((l) => collapseInnerSpacing(l.trim()))
        .filter(Boolean);

    // 숫자 과다·금액·날짜·설명성 키워드 제거
    const isNoisy = (s: string): boolean => {
        const onlyDigits = s.replace(/\D/g, "").length;
        const ratio = onlyDigits / Math.max(1, s.length);
        return (
            ratio > 0.5 ||
            /원\b/.test(s) ||
            /바코드|barcode|쿠폰번호|코드|고객|사용|교환|유의/i.test(s) ||
            /(\d{2,4})[.\-\s](\d{1,2})[.\-\s](\d{1,2})/.test(s) ||
            /(\d{2,4})\/(\d{1,2})\/(\d{1,2})/.test(s)
        );
    };

    const lines = rawLines
        .filter((l) => l.length >= 2 && l.length <= 40)
        .filter((l) => /[가-힣]/.test(l)) // 한글 포함 우선
        .filter((l) => !isNoisy(l));

    if (lines.length === 0) return { name: null, brand: null };

    // 2) “브랜드)상품명 / 브랜드]상품명 / 브랜드>상품명” 최우선
    for (const l of lines) {
        const m = l.match(/^([가-힣A-Za-z0-9 .&()+\-']{2,})[)\]}>]\s*(.+)$/);
        if (m) {
            const brand = m[1].trim();
            const name = m[2].trim();
            if (brand.length >= 2 && name.length >= 2) {
                return { name, brand };
            }
        }
    }

    // 3) “브랜드 + 공백 + 상품명” 패턴
    for (const l of lines) {
        const tokens = l.split(/\s+/);
        if (tokens.length >= 2) {
            const head = tokens[0];
            const tail = tokens.slice(1).join(" ").trim();
            const headOk = /^[가-힣A-Za-z0-9.&()+\-']{2,10}$/.test(head);
            const tailLenOk = tail.length >= 2 && tail.length <= 25;
            const tailDigitsRatio = tail.replace(/\D/g, "").length / Math.max(1, tail.length);
            const tailHasKorean = /[가-힣]/.test(tail);

            if (headOk && tailLenOk && tailDigitsRatio < 0.3 && tailHasKorean) {
                return { name: tail, brand: head };
            }
        }
    }

    // 4) 스코어링: 글자↑, 숫자↓, 길이 페널티
    const score = (s: string) => {
        const letters = s.replace(/[^A-Za-z가-힣]/g, "").length;
        const digits = s.replace(/[^0-9]/g, "").length;
        const lenPenalty = Math.max(0, s.length - 28);
        return letters * 2 - digits - lenPenalty;
    };
    lines.sort((a, b) => score(b) - score(a));
    const best = lines[0];

    if (/\s/.test(best)) {
        const head = best.split(/\s+/)[0];
        const brand = head.length >= 2 ? head : null;
        return { name: best, brand };
    }
    return { name: best, brand: null };
}

/* =========================
   Barcode (ZXing)
   ========================= */
async function scanBarcode(file: File): Promise<string | null> {
    const reader = new BrowserMultiFormatReader();

    const hints: Map<DecodeHintType, unknown> = new Map();
    hints.set(DecodeHintType.TRY_HARDER, true);
    hints.set(DecodeHintType.POSSIBLE_FORMATS, [
        BarcodeFormat.CODE_128,
        BarcodeFormat.EAN_13,
        BarcodeFormat.EAN_8,
        BarcodeFormat.CODE_39,
        BarcodeFormat.QR_CODE,
    ]);
    reader.setHints(hints);

    const url = URL.createObjectURL(file);
    try {
        const result = await reader.decodeFromImageUrl(url);
        return typeof result.getText === "function" ? result.getText() : null;
    } catch (e) {
        if (!(e instanceof NotFoundException)) {
            console.warn("Barcode scan error:", e);
        }
        return null;
    } finally {
        URL.revokeObjectURL(url);
    }
}

/* =========================
   OCR (Tesseract v6) - 옵션 객체 제거로 TS2353 회피
   ========================= */
async function ocrText(file: File): Promise<string> {
    // 한글 우선
    const r1 = await Tesseract.recognize(file, "kor");
    const t1 = (r1.data?.text ?? "").trim();

    // 혼합 보완
    const r2 = await Tesseract.recognize(file, "kor+eng");
    const t2 = (r2.data?.text ?? "").trim();

    // 한글 비중 + 길이 점수로 더 나은 쪽 선택
    const scoreText = (s: string) => {
        const ko = s.replace(/[^가-힣]/g, "").length;
        const len = s.length;
        return ko * 2 + Math.min(200, len);
    };
    const picked = scoreText(t1) >= scoreText(t2) ? t1 : t2;

    return normalizeText(picked);
}

/* =========================
   Main
   ========================= */
export async function scanGifticon(file: File): Promise<ScanResult> {
    // 1) 바코드
    const barcode = await scanBarcode(file);

    // 2) OCR
    const text = await ocrText(file);

    // 3) 필드 추출
    const expiresAt = extractExpiresAt(text);
    const faceValue = extractFaceValue(text);
    const fallbackBarcode = extractFallbackBarcode(text);
    const { name, brand } = extractNameAndBrand(text);

    return {
        brand,
        name,
        barcode: barcode ?? fallbackBarcode,
        expiresAt,
        faceValue,
    };
}