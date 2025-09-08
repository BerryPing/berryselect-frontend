import { Calendar } from "lucide-react";
import type { ReactNode } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import SectionBox from "@/components/common/SectionBox";
import Modal from "@/components/common/Modal";
import Button from "@/components/common/Button";
import {
    getGifticons,
    type Gifticon,
    createGifticon,
    createGifticonByImage,
    type GifticonCreateReq,
} from "@/api/walletApi";
import { getGiftImage } from "@/components/wallet/GifticonCatalog";
import { scanGifticon } from "@/components/wallet/GifticonScan";
import JsBarcode from "jsbarcode";
import styles from "./WalletPage.module.css";

type Filter = "ACTIVE" | "EXPIRED" | "USED";
type DateInputWithPicker = HTMLInputElement & { showPicker?: () => void };

/** 신규 등록 건에만 고정 표시값 적용 */
const FORCED_BRAND = "스타벅스";
const FORCED_PRODUCT = "아이스 아메리카노 T 2잔";

/** products(id) 더미 고정 */
const DEFAULT_PRODUCT_ID = 13;

/** "브랜드 상품명" -> 브랜드/상품 분리(fallback용) */
function splitName(fullName?: string | null) {
    const s = (fullName ?? "").trim();
    if (!s) return { brand: "-", product: "" };
    const parts = s.split(/\s+/);
    if (parts.length === 1) return { brand: parts[0], product: "" };
    return { brand: parts[0], product: parts.slice(1).join(" ") };
}

/** 표시용 데이터 만들기: brand가 있으면 우선 사용, 없으면 name 파싱 */
function deriveDisplay(g: { name?: string | null; brand?: string | null }) {
    const rawName = (g.name ?? "").trim();
    const brand = (g.brand ?? "").trim();

    if (brand) {
        const product = rawName.startsWith(brand)
            ? rawName.slice(brand.length).trim()
            : rawName;
        const fullForImage = product ? `${brand} ${product}` : brand;
        return { brand, product, fullForImage };
    }

    const { brand: b2, product: p2 } = splitName(rawName);
    const fullForImage = p2 ? `${b2} ${p2}` : b2;
    return { brand: b2, product: p2, fullForImage };
}

export default function GifticonSection() {
    // 목록/상태
    const [list, setList] = useState<Gifticon[]>([]);
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState<string | null>(null);

    // 필터
    const [filter, setFilter] = useState<Filter>("ACTIVE");

    // 선택된 기프티콘
    const [selected, setSelected] = useState<Gifticon | null>(null);

    // 업로드 & 스캔
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const [scanLoading, setScanLoading] = useState(false);
    const [scanError, setScanError] = useState<string | null>(null);
    const [openScanModal, setOpenScanModal] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [form, setForm] = useState<{
        productId?: number | null;
        brand?: string | null;
        name?: string | null;
        barcode?: string | null;
        expiresAt?: string | null; // yyyy-MM-dd
        amount?: number | null; // balance
    }>({ productId: DEFAULT_PRODUCT_ID });

    // 바코드 캔버스
    const barcodeCanvasRef = useRef<HTMLCanvasElement | null>(null);

    // 선택 미리보기(선택한 아이템의 brand/name 기준 표시)
    const { brand: previewBrand, product: previewProduct, fullForImage: previewFull } =
        useMemo(
            () =>
                deriveDisplay({
                    name: selected?.name,
                    brand: (selected?.brand as string | undefined) ?? null,
                }),
            [selected?.name, selected?.brand]
        );

    // 바코드 + 숫자 표시
    useEffect(() => {
        const code = (selected?.code ?? "").trim();
        const canvas = barcodeCanvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!code || !ctx) {
            if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
            return;
        }

        try {
            const format = /^\d{13}$/.test(code) ? "EAN13" : "CODE128";
            JsBarcode(canvas, code, {
                format,
                margin: 8,
                width: 2,
                height: 64,
                displayValue: true,
                textMargin: 6,
                font: "14px system-ui",
                fontOptions: "bold",
            });
        } catch {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
    }, [selected?.code]);

    // 초기 목록 로드
    const fetchList = async () => {
        try {
            setLoading(true);
            setErr(null);
            const res = await getGifticons();
            // (선택) 아주 좁은 보정: 서버가 brand를 주지 않는 경우 표시만 보정
            const normalized = (Array.isArray(res) ? res : []).map((it) => {
                if (!it.brand && (it.name ?? "").trim() === FORCED_PRODUCT) {
                    return { ...it, brand: FORCED_BRAND };
                }
                return it;
            });
            setList(normalized);
        } catch {
            setErr("기프티콘을 불러오지 못했습니다.");
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        fetchList();
    }, []);

    // 목록 변경 시 기본 선택
    useEffect(() => {
        if (Array.isArray(list) && list.length > 0) setSelected(list[0]);
        else setSelected(null);
    }, [list]);

    // 미리보기 URL 정리
    useEffect(() => {
        return () => {
            if (previewUrl) URL.revokeObjectURL(previewUrl);
        };
    }, [previewUrl]);

    const closeScanModal = () => {
        setOpenScanModal(false);
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
        setSelectedFile(null);
        setForm({ productId: DEFAULT_PRODUCT_ID }); // 기본값 유지
        setScanError(null);
    };

    // 필터링 목록
    const filtered = useMemo(
        () =>
            Array.isArray(list)
                ? list.filter((g) => ((g.status ?? "ACTIVE") as Filter) === filter)
                : [],
        [list, filter]
    );

    const handleClickUpload = () => fileInputRef.current?.click();

    // 파일 선택 → 스캔 실행(바코드/만료일/금액), 이름/브랜드는 강제값
    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] ?? null;
        if (!file) return;

        if (!file.type.startsWith("image/")) {
            setScanError("이미지 파일만 업로드해 주세요.");
            e.target.value = "";
            return;
        }
        const MAX = 8 * 1024 * 1024;
        if (file.size > MAX) {
            setScanError("이미지 용량이 너무 큽니다. 8MB 이하로 올려주세요.");
            e.target.value = "";
            return;
        }

        setSelectedFile(file);
        setScanError(null);
        setScanLoading(true);
        setOpenScanModal(true);
        setPreviewUrl(URL.createObjectURL(file));

        try {
            const r = await scanGifticon(file);
            setForm((f) => ({
                ...f,
                productId: DEFAULT_PRODUCT_ID,
                brand: FORCED_BRAND, // 고정
                name: FORCED_PRODUCT, // 고정
                barcode: r.barcode ?? "",
                expiresAt: r.expiresAt ?? "",
                amount: r.faceValue ?? null,
            }));
        } catch {
            setScanError("스캔 중 오류가 발생했습니다. 수동으로 입력해 주세요.");
            setForm({
                productId: DEFAULT_PRODUCT_ID,
                brand: FORCED_BRAND,
                name: FORCED_PRODUCT,
                barcode: "",
                expiresAt: "",
                amount: null,
            });
        } finally {
            setScanLoading(false);
            e.target.value = "";
        }
    };

    // 등록
    const handleConfirmRegister = async () => {
        setScanError(null);

        if (!form.barcode && !form.name && !form.brand) {
            setScanError("바코드 또는 브랜드/상품명 중 하나는 입력해 주세요.");
            return;
        }
        if (form.barcode && !/^\d{6,}$/.test(form.barcode)) {
            setScanError("바코드는 숫자 6자리 이상이어야 합니다.");
            return;
        }

        try {
            const pid = form.productId ?? DEFAULT_PRODUCT_ID;
            if (!pid) {
                setScanError("상품(productId)을 선택해 주세요.");
                return;
            }

            const barcode = (form.barcode ?? "").trim();
            let created: Gifticon;

            if (selectedFile) {
                // 파일 있으면 multipart
                created = await createGifticonByImage({
                    file: selectedFile,
                    productId: pid,
                    barcode: barcode || undefined,
                    balance: form.amount ?? undefined,
                    expiresAt: form.expiresAt || undefined,
                });
            } else {
                // 파일 없으면 JSON
                const payload: GifticonCreateReq = { productId: pid, barcode };
                if (form.amount != null) payload.balance = form.amount;
                if (form.expiresAt) payload.expiresAt = form.expiresAt;
                created = await createGifticon(payload);
            }

            // 방금 생성한 한 건만 강제 표기명으로 보이도록(표시 일관성)
            const createdForced: Gifticon = {
                ...created,
                name: FORCED_PRODUCT,
                brand: FORCED_BRAND,
            };

            setList((prev) => [createdForced, ...prev]);
            setSelected(createdForced);
            closeScanModal();
        } catch (e) {
            // 개발 중 원인 파악에 도움
            // eslint-disable-next-line no-console
            console.error("create gifticon error:", e);

            const httpErr = e as {
                response?: { status?: number; data?: { message?: string; error?: string } };
                message?: string;
            };
            const serverMsg =
                httpErr.response?.data?.message ||
                httpErr.response?.data?.error ||
                (httpErr.response?.status ? `HTTP ${httpErr.response.status}` : "") ||
                httpErr.message;
            setScanError(serverMsg || "등록 중 오류가 발생했습니다.");
        }
    };

    // 만료일 입력 ref (아이콘으로 네이티브 date 열기)
    const expireInputRef = useRef<HTMLInputElement | null>(null);

    return (
        <>
            {/* 상단 미리보기 카드 */}
            <SectionBox width={352} padding="0px 2px 0px" outlined shadow={false}>
                <div className={styles.previewCard}>
                    <div
                        className={styles.previewThumb}
                        style={{
                            background: selected
                                ? `url(${getGiftImage(previewFull) ?? ""}) center/cover no-repeat`
                                : "var(--theme-bg)",
                        }}
                    />
                    <div className={styles.previewTexts}>
                        <div className={styles.previewBrand}>{previewBrand}</div>
                        <div className={styles.previewName}>{previewProduct}</div>
                    </div>

                    <div className={styles.previewBarcodeWrap}>
                        <canvas ref={barcodeCanvasRef} className={styles.previewBarcodeCanvas} />
                    </div>
                </div>
            </SectionBox>

            {/* 업로드 버튼 */}
            <div className={styles.uploadRow}>
                <Button onClick={handleClickUpload}>기프티콘 등록하기</Button>
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,image/heic,image/heif"
                    onChange={handleFileChange}
                    className={styles.hiddenFile}
                />
            </div>

            {/* 등록된 기프티콘 리스트 */}
            <SectionBox width={352} padding="0px 16px 23px" outlined shadow={false}>
                <div className={styles.sectionTitle}>
                    <br />
                    등록된 기프티콘
                </div>

                {/* 필터 탭 */}
                <div className={styles.filterRow}>
                    {([
                        { key: "ACTIVE", label: "사용 가능" },
                        { key: "EXPIRED", label: "만료" },
                        { key: "USED", label: "사용 완료" },
                    ] as { key: Filter; label: string }[]).map((t) => {
                        const isSelected = filter === t.key;
                        return (
                            <button
                                key={t.key}
                                onClick={() => setFilter(t.key)}
                                className={`${styles.pill} ${isSelected ? styles.pillSelected : ""}`}
                            >
                                {t.label}
                            </button>
                        );
                    })}
                </div>

                {loading && <div className={styles.loading}>불러오는 중…</div>}
                {err && !loading && <div className={styles.error}>{err}</div>}
                {!loading && !err && filtered.length === 0 && (
                    <div className={styles.empty}>목록이 없습니다.</div>
                )}

                {!loading && !err && filtered.length > 0 && (
                    <ul className={styles.gifticonList}>
                        {filtered.map((g) => {
                            // 각 아이템은 **자기 자신의 brand/name**으로 표시
                            const { brand, product, fullForImage } = deriveDisplay({
                                name: g.name,
                                brand: (g.brand as string | undefined) ?? null,
                            });
                            const thumb = getGiftImage(fullForImage);

                            const safeKey =
                                g.gifticonId ??
                                `${g.code ?? "no-code"}__${g.name ?? "no-name"}__${g.expireDate ?? "no-exp"}`;

                            return (
                                <li
                                    key={String(safeKey)}
                                    className={styles.gifticonItem}
                                    onClick={() => setSelected(g)}
                                >
                                    <div
                                        className={styles.thumb}
                                        style={{
                                            background: thumb ? `url(${thumb}) center/cover no-repeat` : "var(--theme-bg)",
                                        }}
                                        title={fullForImage}
                                    />
                                    <div className={styles.itemText}>
                                        <div className={styles.brand} title={brand}>
                                            {brand}
                                        </div>
                                        <div className={styles.name} title={product}>
                                            {product}
                                        </div>
                                    </div>
                                    <StatusPill status={(g.status as string) ?? "ACTIVE"} />
                                </li>
                            );
                        })}
                    </ul>
                )}
            </SectionBox>

            {/* 스캔/수동입력 모달 */}
            <Modal open={openScanModal} onClose={closeScanModal}>
                <div className={styles.modalGrip} />
                <div className={styles.modalHeaderNoBorder}>사진함</div>

                <div className={styles.modalBody}>
                    {/* 미리보기 */}
                    <div className={styles.previewWrap}>
                        <div
                            className={styles.previewBox}
                            style={{
                                background: previewUrl ? `url(${previewUrl}) center/cover no-repeat` : "#D9D9D9",
                            }}
                        />
                    </div>

                    {/* 입력 영역 */}
                    <div className={styles.modalScroll}>
                        {scanLoading && <div className={styles.loading}>스캔 중…</div>}
                        {scanError && <div className={styles.error}>{scanError}</div>}

                        <Field label="상품명">
                            <input
                                value={form.name ?? ""}
                                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                                className={styles.input}
                                placeholder="상품명을 입력해 주세요"
                            />
                        </Field>

                        <Field label="기프티콘 번호">
                            <input
                                value={form.barcode ?? ""}
                                onChange={(e) => setForm((f) => ({ ...f, barcode: e.target.value }))}
                                className={styles.input}
                                placeholder="기프티콘 번호를 입력해 주세요"
                            />
                        </Field>

                        <Field label="교환처/브랜드">
                            <input
                                value={form.brand ?? ""}
                                onChange={(e) => setForm((f) => ({ ...f, brand: e.target.value }))}
                                className={styles.input}
                                placeholder="교환처/브랜드를 입력해 주세요"
                            />
                        </Field>

                        <Field label="만료일">
                            <div className={styles.dateField}>
                                <input
                                    ref={expireInputRef}
                                    type="date"
                                    required
                                    value={form.expiresAt ?? ""}
                                    onChange={(e) => setForm((f) => ({ ...f, expiresAt: e.target.value }))}
                                    className={`${styles.input} ${styles.inputDate}`}
                                />
                                <button
                                    type="button"
                                    className={styles.dateIconBtn}
                                    onClick={() => {
                                        const el = expireInputRef.current as DateInputWithPicker | null;
                                        if (!el) return;
                                        if (typeof el.showPicker === "function") el.showPicker();
                                        else {
                                            el.focus();
                                            el.click?.();
                                        }
                                    }}
                                    onMouseDown={(e) => {
                                        e.preventDefault();
                                        expireInputRef.current?.focus();
                                    }}
                                    aria-label="만료일 선택"
                                >
                                    <Calendar size={18} />
                                </button>
                            </div>
                        </Field>
                    </div>

                    {/* 하단 고정 버튼 */}
                    <div className={styles.modalActionsSticky}>
                        <Button variant="gray" fullWidth onClick={closeScanModal}>
                            취소
                        </Button>
                        <Button fullWidth onClick={handleConfirmRegister} disabled={scanLoading}>
                            등록하기
                        </Button>
                    </div>
                </div>
            </Modal>
        </>
    );
}

/* ───────── Sub Components ───────── */

function StatusPill({ status }: { status: string }) {
    const map: Record<string, { cls: string; label: string }> = {
        ACTIVE: { cls: "active", label: "사용 가능" },
        EXPIRED: { cls: "expired", label: "만료" },
        USED: { cls: "used", label: "사용 완료" },
    };
    const s = map[status] ?? map.ACTIVE;
    return <span className={`${styles.statusPill} ${styles[`status_${s.cls}`]}`}>{s.label}</span>;
}

function Field({ label, children }: { label: string; children: ReactNode }) {
    return (
        <div className={styles.field}>
            <div className={styles.fieldLabel}>{label}</div>
            {children}
        </div>
    );
}