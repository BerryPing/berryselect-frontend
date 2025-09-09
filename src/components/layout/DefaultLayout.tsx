/* ===== DefaultLayout.tsx ===== */

import React from 'react';
import { Outlet, useLocation, useMatches } from 'react-router-dom';
import styled from 'styled-components';
import FooterNav from '@/components/layout/FooterNav.tsx';

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
  flex: 1 1 auto;
  padding-top: 56px; /* Header 높이 */
  padding-bottom: 69px; /* Footer 높이 */

  /* 스크롤은 유지하되(항상 공간 확보) 스크롤바는 숨기기 */
  overflow-y: scroll; /* <- 항상 스크롤 영역 확보 */
  -ms-overflow-style: none; /* IE/Edge(레거시) */
  scrollbar-width: none; /* Firefox */
  &::-webkit-scrollbar {
    /* Chrome/Safari */
    width: 0;
    height: 0;
    display: none;
  }

  /* 탭 전환 시 가로폭 흔들림 방지(지원 브라우저에서 추가 안정화) */
  scrollbar-gutter: stable both-edges;
`;

type RouteHandle = {
  noHeader?: boolean;
};

const DefaultLayout: React.FC = () => {
  const location = useLocation();
  const matches = useMatches();
  const handle = matches.find(
    (m) => (m.handle as RouteHandle)?.noHeader !== undefined
  )?.handle as RouteHandle | undefined;
  const noHeader = handle?.noHeader ?? false;
  const isAuthPage = location.pathname.startsWith('/auth');

  return (
    <ViewWrapper>
      <SmartphoneView>
        <Main
          style={{
            paddingTop: noHeader || isAuthPage ? 0 : '56px',
            paddingBottom: isAuthPage ? 0 : '69px',
          }}
        >
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
