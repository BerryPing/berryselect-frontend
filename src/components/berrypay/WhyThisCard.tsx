import styled from 'styled-components';
import { Wrapper } from './component/CommonCardStyles';

interface Props {
  reasons: string[];
}

const Card = styled.div`
  width: 320px;
  background: white;
  border-radius: 16px;
  border: 1px solid #e5d5f0;
  box-shadow: 0px 8px 20px -12px rgba(0, 0, 0, 0.15);
  padding: 16px;
  color: #3c1053;
  display: flex;
  flex-direction: column;
  margin-bottom: 24px; /* ✅ 카드 하단에 여백 */
`;

const Title = styled.h3`
  font-size: 15px;
  font-weight: 700;
  color: #3c1053;
  margin-bottom: 12px;
  margin-top: 2px;
`;

const List = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const ListItem = styled.li`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14.4px;
  color: #5f0080;
  margin-bottom: 6px;

  &:last-child {
    margin-bottom: 0;
  }
`;

const Bullet = styled.div`
  width: 4px;
  height: 4px;
  border-radius: 2px;
  background: #5f0080;
`;

export const WhyThisCard = ({ reasons }: Props) => {
  return (
    <Wrapper>
      <Card>
        <Title>왜 이 카드인가요?</Title>
        <List>
          {reasons.map((reason, idx) => (
            <ListItem key={idx}>
              <Bullet /> {reason}
            </ListItem>
          ))}
        </List>
      </Card>
    </Wrapper>
  );
};
