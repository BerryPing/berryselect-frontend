import React, { useState } from 'react';
import MonthPickerModal from './MonthPickerModal';
import {ChevronLeft, ChevronRight} from "lucide-react";

interface MonthNavigatorProps {
    selectedMonth?: string;
    onMonthChange?: (year: number, month: number) => void;
}

const MonthNavigator: React.FC<MonthNavigatorProps> = ({
                                                           selectedMonth = '7월',
                                                           onMonthChange
                                                       }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleMonthClick = () => {
        setIsModalOpen(true);
    };

    const handleMonthSelect = (year: number, month: number) => {
        setIsModalOpen(false);
        if (onMonthChange) {
            onMonthChange(year, month);
        }
    };

    const handleModalClose = () => {
        setIsModalOpen(false);
    };

    return (
        <>
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 12,
                    cursor: 'pointer',
                    userSelect: 'none'
                }}
                onClick={handleMonthClick}
            >
                <ChevronLeft
                    size={20}
                    color="var(--theme-light-purple)"
                    style={{
                        cursor: 'pointer',
                        transition: 'opacity 0.2s'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.opacity = '0.7';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.opacity = '1';
                    }}
                />

                <div style={{
                    justifyContent: 'center',
                    display: 'flex',
                    flexDirection: 'column',
                    color: 'var(--theme-text)',
                    fontSize: 15.2,
                    fontFamily: 'inherit',
                    fontWeight: '800',
                    wordWrap: 'break-word'
                }}>
                    {selectedMonth}
                </div>

                <ChevronRight
                    size={20}
                    color="var(--theme-light-purple)"
                    style={{
                        cursor: 'pointer',
                        transition: 'opacity 0.2s'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.opacity = '0.7';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.opacity = '1';
                    }}
                />
            </div>

            {isModalOpen && (
                <MonthPickerModal
                    onSelect={handleMonthSelect}
                    onClose={handleModalClose}
                />
            )}
        </>
    );
};

// 사용 예시 컴포넌트
export const MonthNavigatorExample: React.FC = () => {
    const [currentMonth, setCurrentMonth] = useState('7월');

    const handleMonthChange = (year: number, month: number) => {
        setCurrentMonth(`${month}월`);
        console.log(`선택된 날짜: ${year}년 ${month}월`);
    };

    return (
        <div style={{ padding: 20 }}>
            <h3>현재 선택된 월:</h3>
            <MonthNavigator
                selectedMonth={currentMonth}
                onMonthChange={handleMonthChange}
            />
            <p style={{ marginTop: 16, color: 'var(--theme-text-light)' }}>
                월을 클릭하면 월 선택 모달이 열립니다.
            </p>
        </div>
    );
};

export default MonthNavigator;