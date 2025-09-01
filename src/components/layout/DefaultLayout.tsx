/* ===== DefaultLayout.tsx ===== */

import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import FooterNav from "@/components/layout/FooterNav.tsx";

const ViewWrapper = styled.div`
  display: flex;
  justify-content: center;
  width: 100%;
  min-height: 100vh;
  background-color: var(--theme-bg);
  padding: 2rem 0;
`;

const SmartphoneView = styled.div`
  width: 100%;
  max-width: 24rem;
  background-color: var(--theme-bg);
  display: flex;
  flex-direction: column;
  border-radius: 1.5rem;
  box-shadow: 0 25px 50px -12px rgb(0 0 0 / 0.25);
  overflow: hidden;
  position: relative;
  height: 844px;
  max-height: 90vh;
`;

// 콘텐츠가 헤더/푸터에 가리지 않도록 안전 여백
const Main = styled.main`
  flex:1 1 auto;
  padding-top:56px;   /* Header 높이 */
  padding-bottom:69px;/* Footer 높이 */
  overflow-y: auto;  /* 스크롤 처리 */ 
`;

const DefaultLayout: React.FC = () => {
    const location = useLocation();
    const isAuthPage = location.pathname.startsWith("/auth");
    return (
        <ViewWrapper>
            <SmartphoneView>
                <Main style={{paddingTop : isAuthPage ? 0 : "56px"}}>
                    <Outlet />
                </Main>

                {/* 고정 하단 네비게이션 */}
                {/* auth 페이지에는 FooterNav 숨기기 */}
                {!isAuthPage && <FooterNav />}
            </SmartphoneView>
        </ViewWrapper>
    );
};

export default DefaultLayout;

