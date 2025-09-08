import SectionBox from "@/components/common/SectionBox";
import styles from "./WalletPage.module.css";

export default function MembershipSection() {
    return (
        <SectionBox width={352} padding={16} outlined shadow={false}>
            <div className={styles.sectionTitle}>보유 멤버십</div>
            <div className={styles.loading}>준비 중…</div>
        </SectionBox>
    );
}