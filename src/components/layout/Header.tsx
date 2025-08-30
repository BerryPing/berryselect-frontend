import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Home } from 'lucide-react';
import styled from 'styled-components';

interface HeaderProps {
    // 헤더 제목
    title?: string;

    // 뒤로가기 버튼 표시 여부(기본: 표시)
    showBackButton?: boolean;

    // 뒤로가기 버튼 실행 시 액션(기본: 브라우저 뒤로가기)
    backAction?: () => void;

    // back 이벤트 (Vue의 emit 대체)
    onBack?: () => void;

    // 홈 버튼 표시 여부
    showHomeButton?: boolean;

    // 홈 버튼 클릭 액션
    onHome?: () => void;
}

const StyledHeader = styled.header`
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1000;

  display: flex;
  align-items: center;
  width: 100%;
  max-width: 24rem;

  height: 56px;
  padding: 0 16px;
  background-color: var(--theme-primary, #5F0080FF);
  border-bottom: none;
  box-sizing: border-box;
`;

const LeftSection = styled.div`
  display: flex;
  align-items: center;
  flex: 1;
  justify-content: flex-start;
`;

const RightSection = styled.div`
  display: flex;
  align-items: center;
  flex: 1;
  justify-content: flex-end;
`;

const CenterSection = styled.div`
  text-align: center;
  flex-shrink: 0;

  h1 {
    font-size: 1.125rem;
    font-weight: 800;
    color: #ffffff;
    white-space: nowrap;
    margin: 0;
  }
`;

const IconButton = styled.button`
  padding: 8px;
  border-radius: 9999px;
  transition: background-color 0.2s ease, transform 0.1s ease;
  cursor: pointer;
  border: none;
  background: none;

  &:hover {
    background-color: #f3f4f6;
  }

  &:active {
    background-color: #e5e7eb;
    transform: scale(0.95);
  }

  svg {
    width: 24px;
    height: 24px;
    color: var(--theme-text, #374151);
  }
`;

const Header: React.FC<HeaderProps> = ({
                                           title = '',
                                           showBackButton = true,
                                           backAction,
                                           onBack,
                                           showHomeButton = false,
                                           onHome
                                       }) => {
    const navigate = useNavigate();

    const handleBackClick = () => {
        console.log('🔙 뒤로가기 클릭됨');
        if (backAction) {
            backAction();
        } else if (onBack) {
            onBack();
        } else {
            // 기본 동작: React Router의 뒤로가기
            navigate(-1);
        }
    };

    const handleHomeClick = () => {
        console.log('🏠 홈 버튼 클릭됨');
        if (onHome) {
            onHome();
        } else {
            // 기본 동작: 홈으로 이동
            navigate('/');
        }
    };

    return (
        <StyledHeader>
            {/* 왼쪽 영역 : 뒤로가기 버튼 */}
            <LeftSection>
                {showBackButton && (
                    <IconButton onClick={handleBackClick} aria-label="뒤로가기">
                        <ChevronLeft />
                    </IconButton>
                )}
            </LeftSection>

            {/* 중앙 영역 : 제목 */}
            <CenterSection>
                {title && <h1>{title}</h1>}
            </CenterSection>

            {/* 오른쪽 영역 : 홈 버튼 (선택적) */}
            <RightSection>
                {showHomeButton && (
                    <IconButton onClick={handleHomeClick} aria-label="홈으로">
                        <Home />
                    </IconButton>
                )}
            </RightSection>
        </StyledHeader>
    );
};

export default Header;

