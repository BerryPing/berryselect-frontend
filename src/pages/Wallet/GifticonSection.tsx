import { useEffect, useState } from "react";
import SectionBox from "@/components/common/SectionBox";
import styles from "./WalletPage.module.css";
import { getGifticons, type Gifticon } from "@/api/walletApi";

export default function GifticonSection() {
    const [list, setList] = useState<Gifticon[]>([]);
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState<string | null>(null);

    useEffect(() => {
        (async () => {
            try {
                setLoading(true);
                setErr(null);
                setList(await getGifticons());
            } catch {
                setErr("기프티콘을 불러오지 못했습니다.");
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    return (
        <SectionBox width={352} padding={16} outlined shadow={false}>
            <div className={styles.sectionTitle}>보유 기프티콘</div>

            {loading && <div className={styles.loading}>불러오는 중…</div>}
            {err && !loading && <div className={styles.error}>{err}</div>}
            {!loading && !err && list.length === 0 && (
                <div className={styles.empty}>목록이 없습니다.</div>
            )}

            {!loading && !err && list.length > 0 && (
                <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
                    {list.map((g) => (
                        <li
                            key={g.gifticonId}
                            style={{
                                display: "flex",
                                justifyContent: "space-between",
                                padding: "10px 12px",
                                border: "1px solid var(--theme-secondary)",
                                borderRadius: 12,
                                background: "#fff",
                                marginTop: 8,
                            }}
                        >
                            <div>
                                <div style={{ fontWeight: 700 }}>{g.brand ?? "-"}</div>
                                <div style={{ fontSize: 12, color: "var(--theme-light-gray)" }}>
                                    {g.name ?? "-"}
                                </div>
                            </div>
                            <span style={{ fontSize: 12 }}>{g.status ?? "ACTIVE"}</span>
                        </li>
                    ))}
                </ul>
            )}
        </SectionBox>
    );
}