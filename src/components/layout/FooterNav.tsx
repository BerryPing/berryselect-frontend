import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {House, Star, WalletMinimal, UserRound, type LucideIcon} from 'lucide-react';
import styled from 'styled-components';

interface NavItem {
    name: string;
    label: string;
    icon: LucideIcon;
    path: string;
}

interface FooterNavProps {
    className?: string;
}

const StyledFooter = styled.footer`
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100%;  
  height: 69px;
  background-color: #ffffff;
  border-top: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-around;
  align-items: center;
  font-family: 'IBM Plex Sans KR', sans-serif;
  z-index: 100;
  padding: 4px;
  box-sizing: border-box;
`;

const FooterItem = styled.div<{ $isActive: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  max-width: 80px;
  text-align: center;
  gap: 4px;
  font-size: 12px;
  color: ${props => props.$isActive
    ? 'var(--theme-primary, #fddf99)'
    : 'var(--theme-light-gray, #8d8d8d)'};
  font-weight: ${props => props.$isActive ? '700' : '400'};
  white-space: nowrap;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  padding: 8px 4px;
  border-radius: 8px;

  &:hover {
    background-color: rgba(0, 0, 0, 0.03);
  }

  &:active {
    transform: scale(0.95);
  }

  .icon {
    width: 24px;
    height: 24px;
    color: ${props => props.$isActive
    ? 'var(--theme-primary, #fddf99)'
    : 'var(--theme-light-gray, #8d8d8d)'};
    display: flex;
    align-items: center;
    justify-content: center;
    transition: color 0.2s ease-in-out;

    svg {
      width: 100%;
      height: 100%;
    }
  }
`;

const Label = styled.span`
  margin-top: 2px;
  user-select: none;
`;

const FooterNav: React.FC<FooterNavProps> = ({ className }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [hoveredTabName, setHoveredTabName] = useState<string | null>(null);

    const navItems: NavItem[] = [
        {
            name: 'home',
            label: '홈',
            icon: House,
            path: '/',
        },
        {
            name: 'berrypick',
            label: '베리픽',
            icon: Star,
            path: '/berrypick',
        },
        {
            name: 'wallet',
            label: '월렛',
            icon: WalletMinimal,
            path: '/wallet',
        },
        {
            name: 'myberry',
            label: '마이베리',
            icon: UserRound,
            path: '/myberry',
        },
    ];

    // 현재 경로와 정확히 매칭되는지 확인
    const isPathActive = (path: string) => {
        if (path === '/') {
            return location.pathname === '/';
        }
        return location.pathname.startsWith(path);
    };

    const handleTabClick = (item: NavItem) => {
        if (!isPathActive(item.path)) {
            navigate(item.path);
        }
    };

    return (
        <StyledFooter className={className}>
            {navItems.map((item) => {
                const Icon = item.icon;
                const isActive =
                    hoveredTabName === item.name ||
                    (hoveredTabName === null && isPathActive(item.path));

                return (
                    <FooterItem
                        key={item.name}
                        $isActive={isActive}
                        onClick={() => handleTabClick(item)}
                        onMouseEnter={() => setHoveredTabName(item.name)}
                        onMouseLeave={() => setHoveredTabName(null)}
                        role="button"
                        tabIndex={0}
                        aria-label={`${item.label} 페이지로 이동`}
                        aria-current={isPathActive(item.path) ? 'page' : undefined}
                    >
                        <div className="icon">
                            <Icon />
                        </div>
                        <Label>{item.label}</Label>
                    </FooterItem>
                );
            })}
        </StyledFooter>
    );
};

export default FooterNav;
