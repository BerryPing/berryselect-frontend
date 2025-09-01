import React from "react";
import styled from "styled-components";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    fullWidth?: boolean;
}

const StyledButton = styled.button<{ fullWidth?: boolean }>`
  background-color: var(--theme-primary);
  color: white;
  font-weight: 600;
  font-size: 16px;
  border: none;
  border-radius: 8px;
  padding: 12px 16px;
  cursor: pointer;
  width: ${({ fullWidth }) => (fullWidth ? "100%" : "auto")};

  transition: background-color 0.2s ease;

  &:hover {
    background-color: #72009b;
  }

  &:active {
    background-color: #4b0063;
  }

  &:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }
`;

const Button: React.FC<ButtonProps> = ({ children, fullWidth, ...props }) => {
    return (
        <StyledButton fullWidth={fullWidth} {...props}>
            {children}
        </StyledButton>
    );
};

export default Button;
