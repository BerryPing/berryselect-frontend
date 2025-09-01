import React from "react";
import styled from "styled-components";

interface DividerProps {
    text?: string;
}

const DividerWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  margin: 20px 0;
`;

const Line = styled.span`
  flex: 1;
  height: 1px;
  background: #E5D5F0; /* var(--color-violet-89) */
`;

const Text = styled.span`
  padding: 0 16px;
  color: #9B4DCC; /* var(--color-violet-55) */
  font-size: 12.8px;
  font-family: Roboto, sans-serif;
  font-weight: 400;
  white-space: nowrap;
`;

const Divider: React.FC<DividerProps> = ({ text = "또는" }) => {
    return (
        <DividerWrapper>
            <Line />
            <Text>{text}</Text>
            <Line />
        </DividerWrapper>
    );
};

export default Divider;