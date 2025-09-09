import styled from 'styled-components';
import { Wrapper, Card } from './component/CommonCardStyles';

interface Recommendation {
  rank: number;
  cardName: string;
  saveAmount: number;
}

interface Props {
  recommendations: Recommendation[];
}

const Title = styled.h3`
  font-size: 15px;
  font-weight: 700;
  color: #3c1053;
  margin-bottom: 12px;
  margin-top: 2px;
`;

const Row = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #e5d5f0;

  &:last-child {
    border-bottom: none;
  }
`;

const RankCircle = styled.div`
  width: 24px;
  height: 24px;
  border-radius: 12px;
  background: #faf7fb;
  color: #5f0080;
  font-size: 12.8px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 8px;
`;

const CardName = styled.div`
  font-size: 15px;
  font-weight: 600;
  color: #3c1053;
`;

const SaveAmount = styled.div`
  font-size: 14px;
  font-weight: 700;
  color: #0f766e;
`;

const Left = styled.div`
  display: flex;
  align-items: center;
`;

export const OtherRecommendations = ({ recommendations }: Props) => {
  return (
    <Wrapper>
      <Card>
        <Title>다른 추천 보기</Title>
        {recommendations.map((rec) => (
          <Row key={rec.rank}>
            <Left>
              <RankCircle>{rec.rank}</RankCircle>
              <CardName>{rec.cardName}</CardName>
            </Left>
            <SaveAmount>+{rec.saveAmount.toLocaleString()}원</SaveAmount>
          </Row>
        ))}
      </Card>
    </Wrapper>
  );
};
