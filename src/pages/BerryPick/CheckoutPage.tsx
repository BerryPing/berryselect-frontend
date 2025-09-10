import { useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { recoApi } from '@/api/recoApi';
import { CheckoutMerchantCard } from '@/components/berrypay/CheckoutMerchantCard';
import { CheckoutCombinationCard } from '@/components/berrypay/CheckoutCombinationCard';
import { CheckoutDetailCard } from '@/components/berrypay/CheckoutDetailCard';
import Button from '@/components/common/Button';
import type { Option, SessionResponse } from '@/types/reco';
import Header from '@/components/layout/Header';

const CheckoutPage = () => {
  const location = useLocation();
  const {
    sessionId,
    optionId,
    merchantId,
    merchantName,
    merchantAddress,
    paidAmount,
  } = location.state || {};

  const [showModal, setShowModal] = useState(false);
  const [session, setSession] = useState<SessionResponse | null>(null);
  const [selectedOption, setSelectedOption] = useState<Option | null>(null);

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

  const handlePayment = async (method: string) => {
    try {
      const res = await recoApi.createTransaction(
        merchantId,
        paidAmount,
        sessionId,
        optionId
      );
      alert(`${method} 결제 성공: ${JSON.stringify(res.data, null, 2)}`);
      setShowModal(false);
    } catch (error) {
      console.error('결제 실패:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <Header showBackButton={false} title={'베리픽'}></Header>
      {/* 가맹점 & 결제 금액 */}
      <CheckoutMerchantCard
        name={merchantName ?? '알 수 없는 가맹점'}
        address={merchantAddress ?? ''}
        amount={paidAmount}
      />

      {/* 추천 조합 */}
      {selectedOption && (
        <CheckoutCombinationCard
          items={selectedOption.items.map((item) => ({
            title: item.title,
            subtitle: item.subtitle,
            value: item.appliedValue,
          }))}
        />
      )}

      {/* 결제 상세 */}
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

      {/* 결제하기 버튼 */}
      <div
        style={{ marginTop: '20px', justifyContent: 'center' }}
        //  , display: 'flex',
      >
        <Button onClick={() => setShowModal(true)}>
          {/* fullWidth variant="purple" */}
          결제하기
        </Button>
      </div>

      {/* 결제 모달 */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg w-80">
            <h2 className="text-lg font-bold mb-4">결제 수단 선택</h2>
            <div className="space-y-2">
              <button
                className="w-full py-2 bg-purple-600 text-white rounded"
                onClick={() => handlePayment('기프티콘')}
              >
                기프티콘 결제
              </button>
              <button
                className="w-full py-2 bg-purple-600 text-white rounded"
                onClick={() => handlePayment('멤버십')}
              >
                멤버십 결제
              </button>
              <button
                className="w-full py-2 bg-purple-600 text-white rounded"
                onClick={() => handlePayment('카드')}
              >
                카드 결제
              </button>
            </div>
            <button
              className="mt-4 w-full py-2 border rounded"
              onClick={() => setShowModal(false)}
            >
              취소
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CheckoutPage;
