import React from 'react';
import styled from "styled-components";

interface HomeSearchBarProps {
    // 헤더 제목
    title?: string;

    // 검색 placeholder 텍스트
    searchPlaceholder?: string;

    // 검색 값 변경 핸들러
    onSearchChange?: (value: string) => void;

    // 검색 값
    searchValue?: string;
}

const Brand = styled.h1`
  font-size: 32px;
  font-weight: 600;
  font-family: Inter, sans-serif;
  color:var(--slogan-gray);
  margin: 0;
    width : 100%;
    text-align: center;
`;

const HomeSearchBar: React.FC<HomeSearchBarProps> = ({
                                                         title = '',
                                                         searchPlaceholder = '위치/가맹점 검색',
                                                         onSearchChange,
                                                         searchValue = ''
                                                     }) => {
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (onSearchChange) {
            onSearchChange(e.target.value);
        }
    };

    return (
        <div style={{
            position: 'absolute',
            top: 0,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 1000,
            display: 'flex',
            flexDirection: 'column',
            width: '100%',
            maxWidth: '24rem',
            height: '133px',
            backgroundColor: 'var(--theme-primary, #5F0080)',
            borderBottom: '1px solid var(--color-violet-89, #E5D5F0)',
            boxSizing: 'border-box'
        }}>
            {/* 상단 네비게이션 영역 */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                width: '100%',
                height: '56px',
                padding: '0 16px'
            }}>
                {/* 왼쪽 영역 (빈 공간) */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    flex: 1,
                    justifyContent: 'flex-start'
                }}>
                </div>

                {/* 중앙 영역 : 제목 */}
                <div style={{
                    textAlign: 'center',
                    flexShrink: 0
                }}>
                    {title && (
                        <h1 style={{
                            fontSize: '1.125rem',
                            fontWeight: 800,
                            color: '#ffffff',
                            whiteSpace: 'nowrap',
                            margin: 0
                        }}>
                            {title}
                        </h1>
                    )}
                </div>

                {/* 오른쪽 영역 (빈 공간) */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    flex: 1,
                    justifyContent: 'flex-end'
                }}>
                </div>
            </div>

            {/* 검색 영역 (항상 표시) */}
            <div style={{
                width: '100%',
                padding: '8px 32px 16px 0px',
            }}>
                <Brand>berryselect</Brand>
                <div style={{
                    width: '100%',
                    height: '44px',
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    marginTop: '18px'
                }}>
                    <div style={{
                        //flex: 1,
                        width: '325px',
                        height: '25px',
                        padding: '12.5px 12px 10.5px 17px',
                        background: 'var(--color-white-solid, white)',
                        borderRadius: '55px',
                        outline: '1px solid var(--color-violet-89, #E5D5F0)',
                        outlineOffset: '-1px',
                        display: 'flex',
                        alignItems: 'center',
                        overflow: 'hidden'
                    }}>
                        <input
                            type="text"
                            className="search-input"
                            placeholder={searchPlaceholder}
                            value={searchValue}
                            onChange={handleSearchChange}
                            style={{
                                width: '100%',
                                border: 'none',
                                outline: 'none',
                                background: 'transparent',
                                color: 'var(--color-violet-55, #9B4DCC)',
                                fontSize: '15.2px',
                                fontFamily: 'Inter, sans-serif',
                                fontWeight: 400
                            }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HomeSearchBar;
