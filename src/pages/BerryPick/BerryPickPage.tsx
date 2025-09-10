import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Header from '@/components/layout/Header.tsx';
import { InputPanel } from '@/components/berrypay/InputPanel.tsx';
import { OptionCard } from '@/components/berrypay/OptionCard.tsx';
import { OtherRecommendations } from '@/components/berrypay/OptionRecommendations.tsx';
import { WhyThisCard } from '@/components/berrypay/WhyThisCard.tsx';
import { recoApi } from '@/api/recoApi';
import type { Option, SessionResponse } from '@/types/reco';

const BerryPickPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const selectedMerchant = location.state?.selectedMerchant;

  const [sessionId, setSessionId] = useState<number | null>(null);
  const [options, setOptions] = useState<Option[]>([]);
  const [merchantId, setMerchantId] = useState<number | null>(null);
  const [paidAmount, setPaidAmount] = useState<number | null>(null);

  useEffect(() => {
    if (selectedMerchant) {
      setMerchantId(selectedMerchant.id);
    }
  }, [selectedMerchant]);

  const handleSearch = async (
    merchantId: number,
    amount: number,
    useGifticon: boolean
  ) => {
    try {
      const res = (await recoApi.createSession(
        merchantId,
        amount,
        useGifticon
      )) as { data: SessionResponse };

      setSessionId(res.data.sessionId);
      setOptions(res.data.options);
      setMerchantId(merchantId);
      setPaidAmount(amount);
    } catch (error) {
      console.error('세션 생성 실패:', error);
    }
  };

  const handleChoose = (optionId: number) => {
    if (!sessionId || !merchantId || !paidAmount) return;
    navigate('/checkout', {
      state: {
        sessionId,
        optionId,
        merchantId,
        paidAmount,

        merchantName: selectedMerchant?.name,
        merchantAddress: selectedMerchant?.address,
      },
    });
  };

  return (
    <>
      <Header title="베리픽" showBackButton={false} showHomeButton={false} />
      <div className="min-h-screen bg-gray-50 p-4">
        {/* 추천 검색 입력 패널 */}
        <div className="flex justify-center">
          <InputPanel
            onSearch={handleSearch}
            initialMerchantId={selectedMerchant?.id}
            initialMerchantName={selectedMerchant?.name}
          />
        </div>

        {/* ✅ 검색 결과가 있을 때만 밑에 컴포넌트 표시 */}
        {options.length > 0 && (
          <div className="mt-6 space-y-6">
            {/* 최적 결제 수단 */}
            {options.find((o) => o.rankOrder === 1) && (
              <OptionCard
                option={options.find((o) => o.rankOrder === 1)!}
                onChoose={handleChoose}
              />
            )}

            <OtherRecommendations
              recommendations={[
                // 예시 데이터: 스타벅스 시나리오 - 12000원 결제
                { rank: 1, cardName: 'KB국민카드', saveAmount: 1200 },
                { rank: 2, cardName: 'NH농협카드', saveAmount: 1000 },
                { rank: 3, cardName: '현대카드', saveAmount: 700 },
              ]}
              // recommendations={[ // 예시 데이터: GS25 시나리오 - 5000원 결제
              //   { rank: 1, cardName: 'NH농협카드', saveAmount: 1000 },
              //   { rank: 2, cardName: 'KB국민카드', saveAmount: 250 },
              //   { rank: 3, cardName: '현대카드', saveAmount: 150 },
              // ]}
            />

            <WhyThisCard
              reasons={[
                // 예시데이터 : 스타벅스 시나리오
                '카페 10% 즉시할인 혜택',
                '스타벅스 할인 혜택 적용 가능',
                '이번 달 실적 달성으로 티어 혜택 확대',
              ]}
              // reasons={[
              //   // 예시데이터 : GS25 시나리오
              //   '편의점 1000원 즉시할인 혜택',
              //   'GS25 할인 혜택 적용 가능',
              //   '이번 달 실적 달성으로 티어 혜택 확대',
              // ]}
            />
          </div>
        )}
      </div>
    </>
  );
};

export default BerryPickPage;
