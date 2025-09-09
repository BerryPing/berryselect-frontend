import styled from 'styled-components';

const HeaderWrapper = styled.div`
  width: 80%;
  padding: 12px 16px;
  background: var(--color-grey-98, #faf7fb);

  display: flex;
  align-items: center;
  gap: 12px;
`;

const BackButton = styled.div`
  flex: none;
  width: 32px;
  height: 32px;
  background: transparent;
  color: var(--color-violet-25, #5f0080);
  font-size: 18px;
  line-height: 1;
  cursor: pointer;

  display: flex;
  justify-content: center;
  align-items: center;

  padding: 0;
`;

const InputBlock = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
`;

const StyledInput = styled.input`
  width: 100%;
  height: 40px;

  padding: 0 16px;
  border-radius: 20px;
  border: 1px solid var(--color-violet-89, #e5d5f0);
  outline: none;
  background: white;

  font-size: 14px;
  color: var(--color-violet-19, #3c1053);

  &:focus {
    border-color: var(--color-violet-25, #5f0080);
  }
`;

const Subtitle = styled.div`
  margin-top: 4px;
  padding-left: 8px;
  font-size: 12px;
  color: var(--color-violet-55, #9b4dcc);
`;

export const SearchHeader = ({
  keyword,
  setKeyword,
  onSearch,
}: {
  keyword: string;
  setKeyword: (v: string) => void;
  onSearch: () => void;
}) => {
  return (
    <HeaderWrapper>
      <BackButton onClick={() => window.history.back()}>{'<'}</BackButton>
      <InputBlock>
        <StyledInput
          type="text"
          value={keyword}
          placeholder="검색어를 입력하세요"
          onChange={(e) => setKeyword(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && onSearch()}
        />
        <Subtitle>현재 위치 주변 검색 결과</Subtitle>
      </InputBlock>
    </HeaderWrapper>
  );
};
