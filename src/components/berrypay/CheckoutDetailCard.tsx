import styled from 'styled-components';

const Wrapper = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 18px;
`;

const Card = styled.div`
  width: 320px;
  background: white;
  border-radius: 16px;
  border: 1px solid #e5d5f0;
  box-shadow: 0px 8px 20px -12px rgba(0, 0, 0, 0.15);
  padding: 20px 16px;
`;

const Header = styled.div`
  font-size: 15px;
  font-weight: 700;
  margin-bottom: 12px;
  color: var(--theme-primary);
`;

const Row = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 6px 0;
  border-bottom: 1px solid #e5d5f0;

  &:last-child {
    border-bottom: none;
  }
`;

const Label = styled.div`
  font-size: 14px;
  color: #3c1053;
`;

// const Value = styled.div<{ highlight?: boolean }>`
//   font-size: ${(p) => (p.highlight ? '17px' : '14px')};
//   font-weight: ${(p) => (p.highlight ? 700 : 600)};
//   color: ${(p) => (p.highlight ? '#5f0080' : '#059669')};
// `;

const Value = styled.div<{ highlight?: boolean; strike?: boolean }>`
  font-size: ${(p) => (p.highlight ? '17px' : '14px')};
  font-weight: ${(p) => (p.highlight ? 700 : 600)};
  color: ${(p) =>
    p.highlight
      ? 'var(--theme-primary, #5f0080)'
      : p.strike
      ? 'var(--theme-primary, #5f0080)'
      : '#059669'};
  text-decoration: ${(p) => (p.strike ? 'line-through' : 'none')};
`;

const Footer = styled.div`
  margin-top: 12px;
  padding: 12px;
  background: #dcfce7;
  border-radius: 12px;
  text-align: center;
  font-weight: 700;
  color: #166534;
`;

interface Detail {
  label: string;
  value: number;
  type?: 'discount' | 'final';
}

interface Props {
  original: number;
  details: Detail[];
  totalSave: number;
  percent: number;
}

export const CheckoutDetailCard = ({
  original,
  details,
  totalSave,
  percent,
}: Props) => (
  <Wrapper>
    <Card>
      <Header>💰 결제 상세</Header>
      <Row>
        <Label>원가</Label>
        <Value strike>{original.toLocaleString()}원</Value>
      </Row>
      {details.map((d, idx) => (
        <Row key={idx}>
          <Label>{d.label}</Label>
          <Value highlight={d.type === 'final'}>
            {d.type === 'discount'
              ? `-${d.value.toLocaleString()}원`
              : `${d.value.toLocaleString()}원`}
          </Value>
        </Row>
      ))}
      <Footer>
        🎉 총 절약: {totalSave.toLocaleString()}원 ({percent}% 절약!)
      </Footer>
    </Card>
  </Wrapper>
);
