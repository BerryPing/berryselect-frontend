import { useState } from "react";
import Header from "@/components/layout/Header";
import AssetTabs, { type AssetTab } from "@/components/wallet/AssetTabs";
import styles from "./WalletPage.module.css";

import CardSection from "./CardSection";
import MembershipSection from "./MembershipSection";
import GifticonSection from "./GifticonSection";

export default function WalletPage() {
    const [tab, setTab] = useState<AssetTab>("card");

    return (
        <>
            <Header title="월렛" showBackButton={false} showHomeButton={false} />

            <div className={styles.pageWrap}>
                <AssetTabs value={tab} onChange={setTab} />

                {tab === "card" && <CardSection />}
                {tab === "membership" && <MembershipSection />}
                {tab === "gifticon" && <GifticonSection />}
            </div>
        </>
    );
}