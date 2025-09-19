import React from 'react';
import styled from 'styled-components';
import type { Option } from '@/types/reco';

interface OptionCardProps {
  option: Option;
  onChoose: (optionId: number) => void;
}

const Wrapper = styled.div`
  display: flex;
  width: 100%;
  justify-content: center;
  margin-top: 12px;
`;

const Card = styled.div`
  width: 320px;
  min-height: 130px;
  position: relative;
  background: linear-gradient(
    149deg,
    var(--color-violet-25, #5f0080) 0%,
    var(--color-violet-55, #9b4dcc) 100%
  );
  border-radius: 16px;
  box-shadow: 0px 8px 20px -12px rgba(0, 0, 0, 0.15);
  overflow: hidden;
  padding: 20px 16px;
  color: white;
  display: flex;
  flex-direction: column;
`;

const Title = styled.div`
  font-size: 12px;
  font-weight: 600;
  opacity: 0.9;
  margin-bottom: 8px;
`;

const Combo = styled.div`
  font-size: 18px;
  font-weight: 800;
  line-height: 1.4;
`;

const SaveText = styled.div`
  font-size: 20px;
  font-weight: 700;
  margin-top: 14px;
  margin-bottom: 10px;
  color: #ffed4a; /* 노란색 */
`;

const Summary = styled.div`
  font-size: 13px;
  font-weight: 500;
  line-height: 1.5;
  opacity: 0.95;
`;

const SelectButton = styled.button`
  position: absolute;
  top: 16px;
  right: 16px;
  padding: 6px 14px;
  font-size: 13px;
  font-weight: 600;
  border: 1px solid white;
  border-radius: 16px;
  background: transparent;
  color: white;
  cursor: pointer;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }

  &:active {
    transform: scale(0.97);
  }
`;

export const OptionCard: React.FC<OptionCardProps> = ({ option, onChoose }) => {
  if (!option) return null;

  // items 타이틀 합치기 → "신한카드 + 스타벅스 멤버십"
  const comboTitle = option.items.map((i) => i.title).join(' + ');

  // ✅ appliedValue 요약 만들기
  const appliedSummary = option.items
    .map((i) => {
      if (i.componentType === 'CARD')
        return `즉시할인 ${i.appliedValue.toLocaleString()}원`;
      if (i.componentType === 'MEMBERSHIP')
        return `멤버십 ${i.appliedValue.toLocaleString()}원`;
      if (i.componentType === 'GIFTICON')
        return `기프티콘 ${i.appliedValue.toLocaleString()}원`;
      return `${i.title} ${i.appliedValue.toLocaleString()}원`;
    })
    .join(' + ');

  return (
    <Wrapper>
      <Card>
        <Title>최적 결제 수단</Title>
        <Combo>{comboTitle}</Combo>

        <SaveText>
          예상 절감액: +{option.expectedSave.toLocaleString()}원
        </SaveText>

        <Summary>{appliedSummary}</Summary>

        <SelectButton onClick={() => onChoose(option.optionId)}>
          선택
        </SelectButton>
      </Card>
    </Wrapper>
  );
};
