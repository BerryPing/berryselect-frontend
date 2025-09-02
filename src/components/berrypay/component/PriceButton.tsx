import React from 'react';

interface Props {
  text?: string;
  variant?: 'selected' | 'default' | 'transparent';
  className?: string;
}

// 스타일 상수들
const baseButton: React.CSSProperties = {
  alignItems: 'flex-start',
  backgroundColor: '#ffffff',
  border: '1px solid',
  borderColor: '#e5d5f0',
  borderRadius: '999px',
  // display: 'inline-flex',
  display: 'center',
  flexDirection: 'column',
  height: '17px',
  padding: '10px 11px 9px',
  position: 'relative',
  cursor: 'pointer',
};

const buttonText: React.CSSProperties = {
  color: '#5f0080',
  fontFamily: 'Roboto-Regular, Helvetica',
  fontSize: '13.6px',
  fontWeight: '400',
  letterSpacing: '0',
  lineHeight: 'normal',
  marginBottom: '-1.00px',
  marginTop: '-1.00px',
  position: 'relative',
  whiteSpace: 'nowrap',
  width: 'fit-content',
};

const baseHover: React.CSSProperties = {
  backgroundColor: '#faf7fb',
  borderColor: '#5f0080',
};

const selectedButton: React.CSSProperties = {
  backgroundColor: '#5f0080',
};

const selectedButtonText: React.CSSProperties = {
  color: '#ffffff',
};

const transparentButton: React.CSSProperties = {
  backgroundColor: '#ffffff33',
};

const selectedHover: React.CSSProperties = {
  backgroundColor: '#4a0066',
};

const transparentHover: React.CSSProperties = {
  backgroundColor: '#ffffff4c',
};

const defaultHover: React.CSSProperties = {
  backgroundColor: '#ffffff1a',
};

export const PriceButton = ({
  text = '₩5,000',
  variant = 'selected',
  className = '',
}: Props) => {
  // variant에 따른 스타일 선택
  const getButtonStyle = (): React.CSSProperties => {
    switch (variant) {
      case 'selected':
        return { ...baseButton, ...selectedButton };
      case 'transparent':
        return { ...baseButton, ...transparentButton };
      case 'default':
        return { ...baseButton };
      default:
        return baseButton;
    }
  };

  const getTextStyle = (): React.CSSProperties => {
    switch (variant) {
      case 'selected':
        return { ...buttonText, ...selectedButtonText };
      case 'transparent':
      case 'default':
        return buttonText;
      default:
        return buttonText;
    }
  };

  const getHoverStyle = (): React.CSSProperties => {
    switch (variant) {
      case 'selected':
        return selectedHover;
      case 'transparent':
        return transparentHover;
      case 'default':
        return defaultHover;
      default:
        return baseHover;
    }
  };

  return (
    <div
      className={`price-button ${variant} ${className}`}
      style={getButtonStyle()}
      onMouseEnter={(e) => {
        Object.assign(e.currentTarget.style, getHoverStyle());
      }}
      onMouseLeave={(e) => {
        Object.assign(e.currentTarget.style, getButtonStyle());
      }}
    >
      <div style={getTextStyle()}>{text}</div>
    </div>
  );
};
