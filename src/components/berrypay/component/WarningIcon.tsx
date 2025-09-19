import React from 'react';

interface Props {
  className?: string;
  size?: number;
}

const warningIconStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

export const WarningIcon = ({ className = '', size = 24 }: Props) => {
  return (
    <svg
      className={`warning-icon ${className}`}
      style={{ ...warningIconStyle, width: size, height: size }}
      fill="none"
      height={size}
      viewBox="0 0 24 24"
      width={size}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        className="warning-path"
        d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z"
        stroke="#D97706"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
      <line
        x1="12"
        y1="9"
        x2="12"
        y2="13"
        stroke="#D97706"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <circle cx="12" cy="17" r="1" fill="#D97706" />
    </svg>
  );
};
