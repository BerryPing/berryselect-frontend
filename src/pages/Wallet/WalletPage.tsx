// src/pages/Wallet/MyBerryPage.tsx
import { useState } from "react";
import Header from "@/components/layout/Header";
import Button from "@/components/common/Button";
import SectionBox from "@/components/common/SectionBox";
import AssetTabs, { type AssetTab } from "@/components/wallet/AssetTabs";
import CardItem from "@/components/wallet/CardItem";
import Modal from "@/components/common/Modal"; // ✅ 공통 모달

export default function MyBerryPage() {
    const [tab, setTab] = useState<AssetTab>("card");
    const [open, setOpen] = useState(false);

    const cards = [
        { id: 1, name: "KB국민카드", benefit: "주유 10%", limit: "8/10만원",
            color: "linear-gradient(145deg,#FDE68A 0%,#F59E0B 100%)" },
    ];

    return (
        <>
            <Header title="월렛" showBackButton={false} showHomeButton={false} />

            <div style={{ padding: "12px 0 80px" }}>
                <AssetTabs value={tab} onChange={setTab} />

                <div style={{ marginTop: 12 }}>
                    <Button onClick={() => setOpen(true)}>실적 모달 열기</Button>
                </div>

                <SectionBox tab="card" currentTab={tab} width={352} padding={16} outlined shadow={false}>
                    <div style={{ fontWeight: 700, marginBottom: 8 }}>보유 카드</div>
                    <div style={{ display: "flex", gap: 16, overflowX: "auto", padding: "8px 2px", scrollbarWidth: "thin" }}>
                        {cards.map((c) => (
                            <CardItem key={c.id} cardId={c.id} name={c.name} benefit={c.benefit}
                                      limit={c.limit} color={c.color} onClick={() => console.log(`card ${c.id}`)} />
                        ))}
                    </div>
                </SectionBox>

                <SectionBox tab="membership" currentTab={tab} width={352} padding={16} outlined shadow={false}>
                    <div style={{ fontWeight: 700 }}>보유 멤버십</div>
                    <div style={{ marginTop: 8, color: "var(--theme-light-gray)" }}>준비 중…</div>
                </SectionBox>

                <SectionBox tab="gifticon" currentTab={tab} width={352} padding={16} outlined shadow={false}>
                    <div style={{ fontWeight: 700 }}>보유 기프티콘</div>
                    <div style={{ marginTop: 8, color: "var(--theme-light-gray)" }}>준비 중…</div>
                </SectionBox>
            </div>

            {/* ✅ 제목은 children 안에서 렌더링 */}
            <Modal open={open} onClose={() => setOpen(false)}>
                <div style={{ padding: "14px 16px", fontWeight: 700, borderBottom: "1px solid var(--theme-secondary)" }}>
                    실적 모달
                </div>
                <div style={{ padding: 16 }}>
                    이 모달은 Button을 눌렀을 때 열립니다.
                </div>
            </Modal>
        </>
    );
}