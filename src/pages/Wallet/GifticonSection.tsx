import { useEffect, useMemo, useRef, useState } from "react";
import SectionBox from "@/components/common/SectionBox";
import styles from "./WalletPage.module.css";
import Modal from "@/components/common/Modal";
import Button from "@/components/common/Button";
import {
    getGifticons,
    type Gifticon,
    createGifticonByImage,
    createGifticonByNumber,
    updateGifticonStatus,
} from "@/api/walletApi";
import { getGiftImage } from "@/components/wallet/GifticonCatalog";

/** 너가 walletApi에 추가해야 하는 함수 형태(예시)
 export type ScanResult = {
 brand?: string | null;
 name?: string | null;
 barcode?: string | null;
 expiresAt?: string | null; // 'YYYY-MM-DD'
 faceValue?: number | null;
 };

 export async function scanGifticon(file: File): Promise<ScanResult> { ... }

 export type CreateGifticonPayload = {
 brand?: string | null;
 name?: string | null;
 barcode?: string | null;
 expiresAt?: string | null;
 // 필요하면 issuer/faceValue 등 추가
 };

 export async function createGifticon(payload: CreateGifticonPayload): Promise<void> { ... }
 */

type Filter = "ACTIVE" | "EXPIRED" | "USED";

export default function GifticonSection() {
    // 목록
    const [list, setList] = useState<Gifticon[]>([]);
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState<string | null>(null);

    // 필터
    const [filter, setFilter] = useState<Filter>("ACTIVE");

    // 업로드 & 스캔
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [scanLoading, setScanLoading] = useState(false);
    const [scanError, setScanError] = useState<string | null>(null);
    const [openScanModal, setOpenScanModal] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [form, setForm] = useState<{
        brand?: string | null;
        name?: string | null;
        barcode?: string | null;
        expiresAt?: string | null;
    }>({});

    // 초기 로드
    const fetchList = async () => {
        try {
            setLoading(true);
            setErr(null);
            const res = await getGifticons();
            setList(res);
        } catch {
            setErr("기프티콘을 불러오지 못했습니다.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchList();
    }, []);

    // 필터링된 목록
    const filtered = useMemo(() => {
        return list.filter((g) => (g.status as Filter) === filter);
    }, [list, filter]);

    // 업로드 버튼 → 파일 선택
    const handleClickUpload = () => fileInputRef.current?.click();

    // 파일 선택 → OCR/바코드 스캔
    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setScanError(null);
        setScanLoading(true);
        setOpenScanModal(true);
        setPreviewUrl(URL.createObjectURL(file));

        try {
            // 너의 walletApi에 구현해둔 스캔 함수 호출
            const { scanGifticon } = await import("@/api/walletApi");
            const result = await scanGifticon(file);
            setForm({
                brand: result.brand ?? "",
                name: result.name ?? "",
                barcode: result.barcode ?? "",
                expiresAt: result.expiresAt ?? "",
            });
        } catch (e) {
            setScanError("스캔 중 오류가 발생했습니다. 수동으로 입력해 주세요.");
            setForm({});
        } finally {
            setScanLoading(false);
            // 같은 파일 다시 선택 가능하게 초기화
            e.target.value = "";
        }
    };

    // 스캔 모달에서 확정 → 등록 API
    const handleConfirmRegister = async () => {
        try {
            const { createGifticon } = await import("@/api/walletApi");
            await createGifticon({
                brand: form.brand?.trim() || null,
                name: form.name?.trim() || null,
                barcode: form.barcode?.trim() || null,
                expiresAt: form.expiresAt || null,
            });
            setOpenScanModal(false);
            setPreviewUrl(null);
            setForm({});
            await fetchList(); // 목록 갱신
        } catch {
            setScanError("등록 중 오류가 발생했습니다.");
        }
    };

    // 상태 뱃지
    const Badge = ({ status }: { status: string }) => {
        const map: Record<string, string> = {
            ACTIVE: "var(--theme-primary)",
            EXPIRED: "#999",
            USED: "#c04d7b",
        };
        return (
            <span
                style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: "#fff",
                    background: map[status] ?? "#999",
                    borderRadius: 999,
                    padding: "3px 8px",
                }}
            >
        {status === "ACTIVE" ? "사용가능" : status === "EXPIRED" ? "만료" : "사용완료"}
      </span>
        );
    };

    return (
        <SectionBox width={352} padding={16} outlined shadow={false}>
            <div className={styles.sectionTitle}>보유 기프티콘</div>

            {/* 필터 탭 */}
            <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                {([
                    { key: "ACTIVE", label: "사용가능" },
                    { key: "EXPIRED", label: "만료" },
                    { key: "USED", label: "사용완료" },
                ] as { key: Filter; label: string }[]).map((t) => (
                    <button
                        key={t.key}
                        onClick={() => setFilter(t.key)}
                        style={{
                            height: 28,
                            padding: "0 10px",
                            borderRadius: 999,
                            border:
                                filter === t.key
                                    ? "1px solid var(--theme-primary)"
                                    : "1px solid var(--theme-secondary)",
                            background: filter === t.key ? "var(--theme-bg)" : "#fff",
                            fontWeight: 700,
                        }}
                    >
                        {t.label}
                    </button>
                ))}
                <div style={{ marginLeft: "auto" }}>
                    <Button onClick={handleClickUpload}>기프티콘 등록하기</Button>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        style={{ display: "none" }}
                    />
                </div>
            </div>

            {loading && <div className={styles.loading}>불러오는 중…</div>}
            {err && !loading && <div className={styles.error}>{err}</div>}
            {!loading && !err && filtered.length === 0 && (
                <div className={styles.empty}>목록이 없습니다.</div>
            )}

            {!loading && !err && filtered.length > 0 && (
                <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "grid", gap: 8 }}>
                    {filtered.map((g) => {
                        const thumb = getGiftImage(g.name);
                        return (
                            <li
                                key={g.gifticonId}
                                style={{
                                    display: "flex",
                                    gap: 12,
                                    alignItems: "center",
                                    padding: "10px 12px",
                                    border: "1px solid var(--theme-secondary)",
                                    borderRadius: 12,
                                    background: "#fff",
                                }}
                            >
                                <div
                                    style={{
                                        width: 60,
                                        height: 60,
                                        borderRadius: 8,
                                        background: thumb
                                            ? `url(${thumb}) center/cover no-repeat`
                                            : "linear-gradient(145deg,#e9e9e9,#dcdcdc)",
                                        flexShrink: 0,
                                    }}
                                />
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ fontWeight: 700, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                        {g.brand ?? "-"}
                                    </div>
                                    <div
                                        style={{
                                            fontSize: 12,
                                            color: "var(--theme-light-gray)",
                                            whiteSpace: "nowrap",
                                            overflow: "hidden",
                                            textOverflow: "ellipsis",
                                        }}
                                        title={g.name ?? ""}
                                    >
                                        {g.name ?? "-"}
                                    </div>
                                </div>
                                <Badge status={g.status ?? "ACTIVE"} />
                            </li>
                        );
                    })}
                </ul>
            )}

            {/* 스캔 결과 확인 모달 */}
            <Modal open={openScanModal} onClose={() => setOpenScanModal(false)}>
                <div className={styles.modalHeader}>기프티콘 등록</div>
                <div className={styles.modalBody}>
                    {scanLoading && <div className={styles.loading}>스캔 중…</div>}
                    {scanError && <div className={styles.error} style={{ marginBottom: 8 }}>{scanError}</div>}

                    <div style={{ display: "flex", gap: 12 }}>
                        <div
                            style={{
                                width: 96,
                                height: 96,
                                borderRadius: 8,
                                background: previewUrl
                                    ? `url(${previewUrl}) center/cover no-repeat`
                                    : "linear-gradient(145deg,#e9e9e9,#dcdcdc)",
                                flexShrink: 0,
                            }}
                        />
                        <div style={{ flex: 1 }}>
                            <label style={{ fontSize: 12, color: "#888" }}>브랜드</label>
                            <input
                                value={form.brand ?? ""}
                                onChange={(e) => setForm((f) => ({ ...f, brand: e.target.value }))}
                                style={inputStyle}
                                placeholder="예) MEGACOFFEE"
                            />
                            <label style={{ fontSize: 12, color: "#888" }}>상품명</label>
                            <input
                                value={form.name ?? ""}
                                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                                style={inputStyle}
                                placeholder="예) 메가커피 복숭아아이스티"
                            />
                            <label style={{ fontSize: 12, color: "#888" }}>바코드</label>
                            <input
                                value={form.barcode ?? ""}
                                onChange={(e) => setForm((f) => ({ ...f, barcode: e.target.value }))}
                                style={inputStyle}
                                placeholder="숫자"
                            />
                            <label style={{ fontSize: 12, color: "#888" }}>유효기간</label>
                            <input
                                type="date"
                                value={form.expiresAt ?? ""}
                                onChange={(e) => setForm((f) => ({ ...f, expiresAt: e.target.value }))}
                                style={inputStyle}
                            />
                        </div>
                    </div>

                    <div style={{ display: "flex", gap: 8, marginTop: 12, justifyContent: "flex-end" }}>
                        <Button variant="secondary" onClick={() => setOpenScanModal(false)}>
                            취소
                        </Button>
                        <Button onClick={handleConfirmRegister} disabled={scanLoading}>
                            등록
                        </Button>
                    </div>
                </div>
            </Modal>
        </SectionBox>
    );
}

const inputStyle: React.CSSProperties = {
    width: "100%",
    height: 36,
    borderRadius: 8,
    border: "1px solid var(--theme-secondary)",
    padding: "0 10px",
    margin: "4px 0 10px",
    boxSizing: "border-box",
    background: "#fff",
};