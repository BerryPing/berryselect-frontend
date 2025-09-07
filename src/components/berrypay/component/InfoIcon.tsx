import React from 'react';

interface Props {
  className?: string;
  size?: number;
}

const infoIconStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

export const InfoIcon = ({ className = '', size = 24 }: Props) => {
  return (
    <svg
      className={`info-icon ${className}`}
      style={{ ...infoIconStyle, width: size, height: size }}
      fill="none"
      height={size}
      viewBox="0 0 24 24"
      width={size}
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect
        x="3"
        y="4"
        width="18"
        height="18"
        rx="2"
        ry="2"
        stroke="#3B82F6"
        strokeWidth="2"
      />
      <line
        x1="16"
        y1="2"
        x2="16"
        y2="6"
        stroke="#3B82F6"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <line
        x1="8"
        y1="2"
        x2="8"
        y2="6"
        stroke="#3B82F6"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <line x1="3" y1="10" x2="21" y2="10" stroke="#3B82F6" strokeWidth="2" />
    </svg>
  );
};
