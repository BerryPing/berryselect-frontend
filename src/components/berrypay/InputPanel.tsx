import React from 'react';
import { PriceButton } from './component/PriceButton';
import { WarningIcon } from './component/WarningIcon';
import { InfoIcon } from './component/InfoIcon';

export const InputPanel = () => {
  const section = {
    backgroundColor: '#ffffff',
    border: '1px solid #e5d5f0',
    borderRadius: '16px',
    padding: '16px',
    width: '350px',
    margin: '0 auto',
    marginTop: '8px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    boxSizing: 'border-box',
  } as React.CSSProperties;

  const heading = {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  } as React.CSSProperties;

  const title = {
    color: '#3c1053',
    fontFamily: 'var(--roboto-bold-font-family)',
    fontSize: '18px',
    fontWeight: 'bold',
    lineHeight: '1.4',
  } as React.CSSProperties;

  const inputSection = {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
  } as React.CSSProperties;

  const inputGroup = {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  } as React.CSSProperties;

  const label = {
    color: '#5f0080',
    fontFamily: 'var(--semantic-label-font-family)',
    fontSize: '14px',
    fontWeight: '700',
    lineHeight: '1.4',
  } as React.CSSProperties;

  const placeholderInput = {
    backgroundColor: '#ffffff',
    border: '1px solid #e5d5f0',
    borderRadius: '12px',
    padding: '10px 12px',
    fontSize: '14px',
    color: '#9b4dcc',
    minHeight: '20px',
    display: 'flex',
    alignItems: 'center',
    boxSizing: 'border-box',
  } as React.CSSProperties;

  const helperText = {
    color: '#9b4dcc',
    fontSize: '12px',
    marginTop: '2px',
  } as React.CSSProperties;

  const buttonGroup = {
    display: 'flex',
    gap: '6px',
    flexWrap: 'wrap',
  } as React.CSSProperties;

  const toggleSection = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '8px 0',
  } as React.CSSProperties;

  const toggleLabel = {
    color: '#3c1053',
    fontSize: '14px',
    fontWeight: '600',
  } as React.CSSProperties;

  const toggle = {
    position: 'relative',
    width: '48px',
    height: '20px',
    backgroundColor: '#5f0080',
    borderRadius: '14px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    padding: '2px',
  } as React.CSSProperties;

  const toggleKnob = {
    width: '20px',
    height: '20px',
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    boxShadow: '0px 2px 4px rgba(0,0,0,0.2)',
    marginRight: '2px',
  } as React.CSSProperties;

  const alertBox = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 12px',
    borderRadius: '12px',
    fontSize: '13px',
    lineHeight: '1.3',
  } as React.CSSProperties;

  const infoAlert = {
    ...alertBox,
    backgroundColor: '#eff6ff',
    border: '1px solid #bfdbfe',
    color: '#1e3a8a',
  } as React.CSSProperties;

  const warningAlert = {
    ...alertBox,
    backgroundColor: '#fff7ed',
    border: '1px solid #fed7aa',
    color: '#9a3412',
  } as React.CSSProperties;

  const iconWrapper = {
    width: '20px',
    height: '20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  } as React.CSSProperties;

  const submitButton = {
    width: '100%',
    padding: '12px',
    backgroundColor: '#5f0080',
    color: '#ffffff',
    border: 'none',
    borderRadius: '12px',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
    marginTop: '2px',
    boxSizing: 'border-box',
  } as React.CSSProperties;

  return (
    <div style={section}>
      {/* 제목 */}
      <div style={heading}>
        <div style={title}>결제 수단 추천</div>
      </div>

      {/* 가맹점 입력 */}
      <div style={inputSection}>
        <div style={inputGroup}>
          <div style={label}>가맹점</div>
          <div style={placeholderInput}>가맹점명 입력</div>
          <div style={helperText}>보유 카드/멤버십 기준으로 추천해요</div>
        </div>

        {/* 결제 금액 */}
        <div style={inputGroup}>
          <div style={label}>결제 금액</div>
          <div style={placeholderInput}>10,000</div>

          {/* 가격 버튼들 */}
          <div style={buttonGroup}>
            <PriceButton text="₩5,000" variant="selected" />
            <PriceButton text="₩10,000" variant="default" />
            <PriceButton text="₩30,000" variant="default" />
          </div>
        </div>

        {/* 기프티콘 사용 토글 */}
        <div style={toggleSection}>
          <div style={toggleLabel}>기프티콘 사용</div>
          <div style={toggle}>
            <div style={toggleKnob} />
          </div>
        </div>

        {/* 알림들 */}
        <div style={infoAlert}>
          <div style={iconWrapper}>
            <InfoIcon size={20} />
          </div>
          <div>기프티콘 만료 임박! 사용을 권장해요. (D-3)</div>
        </div>

        <div style={warningAlert}>
          <div style={iconWrapper}>
            <WarningIcon size={20} />
          </div>
          <div>이번 달 예산 초과 위험이에요. (87%)</div>
        </div>

        {/* 추천 검색 버튼 */}
        <button style={submitButton}>추천 검색하기</button>
      </div>
    </div>
  );
};
