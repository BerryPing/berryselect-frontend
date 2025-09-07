import React, { useState } from 'react';
import Modal from '../common/Modal';

interface MonthPickerModalProps {
    onSelect: (year: number, month: number) => void;
    onClose: () => void;
    initialYear?: number;
    initialMonth?: number;
}

const MonthPickerModal: React.FC<MonthPickerModalProps> = ({
                                                               onSelect,
                                                               onClose,
                                                               initialYear = new Date().getFullYear(),
                                                               initialMonth = new Date().getMonth() + 1
                                                           }) => {
    const [selectedYear, setSelectedYear] = useState(initialYear);
    const [selectedMonth, setSelectedMonth] = useState(initialMonth);

    const handleConfirm = () => {
        onSelect(selectedYear, selectedMonth);
    };

    // 년도와 월 옵션 생성
    const generateMonthOptions = () => {
        const options = [];
        const currentYear = new Date().getFullYear();

        // 현재 년도 기준 -1년 ~ +1년
        for (let year = currentYear - 1; year <= currentYear + 1; year++) {
            for (let month = 1; month <= 12; month++) {
                options.push({ year, month });
            }
        }
        return options;
    };

    const monthOptions = generateMonthOptions();

    return (
        <Modal open={true} onClose={onClose}>
            {/* 드래그 핸들 */}
            <div
                style={{
                    width: 48,
                    height: 6,
                    backgroundColor: '#D1D5DB',
                    borderRadius: 9999,
                    alignSelf: 'center',
                    margin: '8px auto 16px auto'
                }}
            />

            {/* 제목 */}
            <div
                style={{
                    marginBottom: 20,
                    textAlign: 'center'
                }}
            >
                <div
                    style={{
                        color: 'var(--theme-text)',
                        fontSize: 15.2,
                        fontFamily: 'inherit',
                        fontWeight: '700'
                    }}
                >
                    월 선택
                </div>
            </div>

            {/* 월 선택 영역 */}
            <div
                style={{
                    maxHeight: 200,
                    overflowY: 'auto',
                    marginBottom: 20
                }}
            >
                {monthOptions.map(({ year, month }) => (
                    <div
                        key={`${year}-${month}`}
                        style={{
                            padding: '12px 16px',
                            cursor: 'pointer',
                            backgroundColor: selectedYear === year && selectedMonth === month
                                ? 'var(--theme-secondary)'
                                : 'transparent',
                            borderRadius: 8,
                            marginBottom: 4,
                            transition: 'background-color 0.2s'
                        }}
                        onClick={() => {
                            setSelectedYear(year);
                            setSelectedMonth(month);
                        }}
                    >
                        <div
                            style={{
                                color: 'var(--theme-text)',
                                fontSize: 14.4,
                                fontFamily: 'inherit',
                                fontWeight: '600',
                                textAlign: 'center'
                            }}
                        >
                            {year}년 {month}월
                        </div>
                    </div>
                ))}
            </div>

            {/* 확인 버튼 */}
            <button
                style={{
                    width: '100%',
                    height: 43,
                    background: 'var(--theme-primary)',
                    borderRadius: 9,
                    border: '1px var(--theme-primary) solid',
                    color: 'var(--color-white)',
                    fontSize: 16,
                    fontFamily: 'inherit',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'opacity 0.2s'
                }}
                onClick={handleConfirm}
                onMouseEnter={(e) => {
                    e.currentTarget.style.opacity = '0.9';
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.opacity = '1';
                }}
            >
                확인
            </button>
        </Modal>
    );
};

export default MonthPickerModal;