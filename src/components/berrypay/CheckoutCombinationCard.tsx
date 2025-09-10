import React from 'react';
import styled from 'styled-components';

const Wrapper = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 20px;
`;

const Card = styled.div`
  width: 320px;
  background: linear-gradient(141deg, #5f0080 0%, #9b4dcc 100%);
  border-radius: 16px;
  box-shadow: 0px 8px 20px -12px rgba(0, 0, 0, 0.15);
  color: white;
  padding: 20px 16px;
`;

const Title = styled.div`
  font-size: 16px;
  font-weight: 700;
  margin-bottom: 12px;
`;

const Item = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 12px;
  margin-bottom: 10px;
`;

const Left = styled.div`
  display: flex;
  flex-direction: column;
`;

const Label = styled.div`
  font-size: 15px;
  font-weight: 700;
`;

const SubLabel = styled.div`
  font-size: 13px;
  opacity: 0.8;
`;

const Value = styled.div`
  font-size: 14px;
  font-weight: 700;
  color: #ffed4a;
  white-space: nowrap;
`;

interface ItemType {
  title: string;
  subtitle: string;
  value: number;
}

interface Props {
  items: ItemType[];
}

export const CheckoutCombinationCard = ({ items }: Props) => (
  <Wrapper>
    <Card>
      <Title>🎯 베리셀렉트 추천 조합</Title>
      {items.map((item, idx) => (
        <Item key={idx}>
          <Left>
            <Label>{item.title}</Label>
            <SubLabel>{item.subtitle}</SubLabel>
          </Left>
          <Value>-{item.value.toLocaleString()}원</Value>
        </Item>
      ))}
    </Card>
  </Wrapper>
);
