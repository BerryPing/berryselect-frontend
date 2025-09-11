import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import type { Merchant } from '@/api/merchantApi';

const Container = styled.div`
  border-top: 1px solid var(--color-violet-89, #e5d5f0);
  padding: 16px;
`;

const HeaderRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
`;

const CountText = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: var(--color-violet-19, #3c1053);
`;

const FilterButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;

  gap: 4px;
  padding: 7px 13px;
  border-radius: 16px;
  border: 1px solid #e5d5f0;
  background: white;
  color: var(--color-violet-25, #5f0080);
  font-size: 12.8px;
  font-weight: 600;

  svg {
    width: 20px;
    height: 20px;
  }
`;

const Card = styled.div`
  background: white;
  border-radius: 16px;
  border: 1px solid #e5d5f0;
  box-shadow: 0px 4px 12px -4px rgba(0, 0, 0, 0.1);
  padding: 16px;
  margin-bottom: 12px;
`;

const Title = styled.div`
  font-size: 16px;
  font-weight: 700;
  color: var(--color-violet-19, #3c1053);
`;

const Brand = styled.div`
  font-size: 12.8px;
  color: var(--color-violet-55, #9b4dcc);
`;

const Address = styled.div`
  font-size: 12.8px;
  color: var(--color-violet-55, #9b4dcc);
`;

const Distance = styled.div`
  font-size: 11.8px;
  font-weight: 700;
  color: var(--color-violet-25, #5f0080);
  margin-left: auto;
`;

const TagRow = styled.div`
  display: flex;
  gap: 6px;
  margin-top: 8px;
`;

const Tag = styled.div<{ bg: string; color: string }>`
  padding: 4px 8px;
  border-radius: 8px;
  font-size: 11.2px;
  font-weight: 600;
  background: ${(p) => p.bg};
  color: ${(p) => p.color};
`;

const SelectButton = styled.div`
  margin-left: auto;
  padding: 7px 13px;
  border: 1px solid #5f0080;
  border-radius: 12px;
  font-size: 12.8px;
  font-weight: 600;
  color: var(--color-violet-25, #5f0080);
  cursor: pointer;
`;

const getDiscountInfo = (brandName: string) => {
  if (brandName.toUpperCase() === 'GS25') {
    return { discount: '3% 할인', membership: '멤버십' };
  }
  if (brandName.toUpperCase() === 'STARBUCKS') {
    return { discount: '10% 할인', membership: '멤버십' };
  }
  return { discount: null, membership: null };
};

export const MerchantList = ({ merchants }: { merchants: Merchant[] }) => {
  const navigate = useNavigate();

  const handleSelect = (merchant: Merchant) => {
    // ✅ BerryPickPage로 이동하면서 state 전달
    navigate('/berrypick', { state: { selectedMerchant: merchant } });
  };

  return (
    <Container>
      <HeaderRow>
        <CountText>총 {merchants.length}개 가맹점</CountText>
        <FilterButton>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            fill="currentColor"
            viewBox="0 0 16 16"
          >
            <path d="M6 10.5a.5.5 0 0 0 .8.4l2-1.5a.5.5 0 0 0 .2-.4V6.3l3.5-4.6A.5.5 0 0 0 12 1H4a.5.5 0 0 0-.4.8L7 6.3v4.2z" />
          </svg>
          필터
        </FilterButton>
      </HeaderRow>

      {merchants.map((m) => {
        const { discount, membership } = getDiscountInfo(m.brandName);

        return (
          <Card key={m.id}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div>
                <Title>{m.name}</Title>
                <Brand>{m.brandName}</Brand>
                <Address>{m.address ?? '주소 정보 없음'}</Address>
              </div>
              <Distance>{m.distanceText ?? `${m.distanceMeters}m`}</Distance>
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginTop: '12px',
                borderTop: '1px solid #e5d5f0',
                paddingTop: '8px',
              }}
            >
              <TagRow>
                <Tag bg="#F3E8FF" color="#5F0080">
                  {m.categoryName}
                </Tag>
                {discount && (
                  <Tag bg="#DCFCE7" color="#166534">
                    {discount}
                  </Tag>
                )}
                {membership && (
                  <Tag bg="#FEF3CD" color="#92400E">
                    {membership}
                  </Tag>
                )}
              </TagRow>
              {/* ✅ 클릭 시 BerryPick으로 이동 */}
              <SelectButton onClick={() => handleSelect(m)}>선택</SelectButton>
            </div>
          </Card>
        );
      })}
    </Container>
  );
};
