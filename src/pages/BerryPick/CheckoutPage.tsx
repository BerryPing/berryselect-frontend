import { useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { recoApi } from '@/api/recoApi';
import { CheckoutMerchantCard } from '@/components/berrypay/CheckoutMerchantCard';
import { CheckoutCombinationCard } from '@/components/berrypay/CheckoutCombinationCard';
import { CheckoutDetailCard } from '@/components/berrypay/CheckoutDetailCard';
import Button from '@/components/common/Button';
import Modal from '@/components/common/Modal';
import AssetTabs from '@/components/wallet/AssetTabs';
import type { AssetTab } from '@/components/wallet/AssetTabs';
import type { Option, SessionResponse } from '@/types/reco';
import Header from '@/components/layout/Header';
import GifticonSection from '@/pages/Wallet/GifticonSection';
import MembershipSection from '@/pages/Wallet/MembershipSection';
import styles from '@/pages/BerryPick/CheckoutPage.module.css';
import { CardPaymentBox } from '@/components/berrypay/DeepLinkCard';

const CheckoutPage = () => {
  const location = useLocation();
  const {
    sessionId,
    optionId,
    merchantId,
    merchantName,
    merchantAddress,
    paidAmount,
    categoryId,
  } = location.state || {};

  const [showModal, setShowModal] = useState(false);
  const [session, setSession] = useState<SessionResponse | null>(null);
  const [selectedOption, setSelectedOption] = useState<Option | null>(null);
  const [tab, setTab] = useState<AssetTab>('card');

  // 세션 상세 불러오기
  useEffect(() => {
    if (!sessionId) return;
    const fetchSession = async () => {
      try {
        const res = await recoApi.getSession(sessionId);
        setSession(res.data);
        const opt = res.data.options.find(
          (o: Option) => o.optionId === optionId
        );
        setSelectedOption(opt || null);
      } catch (err) {
        console.error('세션 조회 실패:', err);
      }
    };
    fetchSession();
  }, [sessionId, optionId]);

  // 잘못된 접근 처리 (훅 아래로 옮김)
  if (!sessionId || !optionId || !merchantId || !paidAmount) {
    return <div>잘못된 접근입니다.</div>;
  }

  /** ✅ 결제 실행 (chooseOption → createTransaction) */
  const handlePayment = async () => {
    try {
      // 1. 옵션 확정
      await recoApi.chooseOption(sessionId, optionId);

      // 2. 트랜잭션 생성
      const res = await recoApi.createTransaction(
        merchantId,
        paidAmount,
        sessionId,
        optionId,
        categoryId
      );

      console.log(`결제 성공 🎉: ${JSON.stringify(res.data, null, 2)}`);
    } catch (error) {
      console.error('결제 실패:', error);
      alert('결제 처리 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <Header showBackButton={false} title={'베리픽'} />

      <CheckoutMerchantCard
        name={merchantName ?? '알 수 없는 가맹점'}
        address={merchantAddress ?? ''}
        amount={paidAmount}
      />

      {selectedOption && (
        <CheckoutCombinationCard
          items={selectedOption.items.map((item) => {
            let subtitle = item.subtitle;
            if (item.title.includes('노리2 체크카드')) subtitle = 'KB국민카드';
            else if (item.title.includes('KT 멤버십')) subtitle = 'VIP 등급';
            else if (item.title.includes('GS 멤버십'))
              subtitle = 'Welcome 등급';
            else if (item.title.includes('NH 올원 체크카드'))
              subtitle = 'NH농협카드';

            return { title: item.title, subtitle, value: item.appliedValue };
          })}
        />
      )}

      {selectedOption && (
        <CheckoutDetailCard
          original={session?.inputAmount ?? paidAmount}
          details={[
            ...selectedOption.items.map((item) => ({
              label: item.title,
              value: item.appliedValue,
              type: 'discount' as const,
            })),
            {
              label: '최종 결제 금액',
              value: selectedOption.expectedPay,
              type: 'final' as const,
            },
          ]}
          totalSave={selectedOption.expectedSave}
          percent={Math.round(
            (selectedOption.expectedSave /
              (session?.inputAmount ?? paidAmount)) *
              100
          )}
        />
      )}

      <div style={{ marginTop: '18px', marginBottom: '10px' }}>
        <Button onClick={() => setShowModal(true)}>결제하기</Button>
      </div>

      {/* ✅ 모달 */}
      <div className={styles.modalSheet}>
        <Modal open={showModal} onClose={() => setShowModal(false)}>
          <AssetTabs value={tab} onChange={setTab} />

          <div className={styles.modalBody}>
            <div className={styles.modalScroll}>
              {tab === 'gifticon' && (
                <div>
                  <GifticonSection />
                </div>
              )}
              {tab === 'membership' && (
                <div className={styles.sectionBox}>
                  <MembershipSection />
                </div>
              )}
              {tab === 'card' && (
                <div className={styles.sectionBox}>
                  <div style={{ padding: '12px' }}>
                    {' '}
                    <CardPaymentBox />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ✅ 하단 고정 버튼 */}
          <div style={{ marginTop: '16px' }}>
            <Button variant="purple" onClick={handlePayment}>
              결제 진행
            </Button>
          </div>
        </Modal>
      </div>
    </div>
  );
};

export default CheckoutPage;
