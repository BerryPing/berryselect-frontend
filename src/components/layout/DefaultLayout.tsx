/* ===== DefaultLayout.tsx ===== */

import React from 'react';
import { Outlet } from 'react-router-dom';
import styled from 'styled-components';

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

const DefaultLayout: React.FC = () => {
  return (
    <ViewWrapper>
      <SmartphoneView>
        <Outlet />
      </SmartphoneView>
    </ViewWrapper>
  );
};

export default DefaultLayout;


/* main.tsx 또는 index.tsx에서 import */
/* import './global.css'; */
