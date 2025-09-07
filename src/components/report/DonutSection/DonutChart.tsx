import React, { useEffect, useRef } from 'react';
import * as Chart from 'chart.js';

// Chart.js 필요한 컴포넌트들 등록
Chart.Chart.register(
    Chart.ArcElement,
    Chart.Tooltip,
    Chart.Legend,
    Chart.DoughnutController
);

interface CategoryData {
    name: string;
    value: number;
    color: string;
}

interface DonutChartProps {
    data?: CategoryData[];
    size?: number;
    centerText?: string;
}

const DonutChart: React.FC<DonutChartProps> = ({
                                                   data = [
                                                       { name: '식비', value: 45000, color: '#5F0080' },
                                                       { name: '교통비', value: 32000, color: '#9B4DCC' },
                                                       { name: '쇼핑', value: 28000, color: '#B983DB' },
                                                       { name: '문화생활', value: 20000, color: '#E5D5F0' },
                                                       { name: '의료비', value: 15000, color: '#7B6EF6' },
                                                       { name: '기타', value: 12000, color: '#166534' }
                                                   ],
                                                   size = 300,
                                                   centerText
                                               }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const chartRef = useRef<Chart.Chart | null>(null);

    useEffect(() => {
        if (!canvasRef.current) return;

        // 기존 차트가 있으면 제거
        if (chartRef.current) {
            chartRef.current.destroy();
        }

        const ctx = canvasRef.current.getContext('2d');
        if (!ctx) return;

        // 총합 계산
        const total = data.reduce((sum, item) => sum + item.value, 0);

        chartRef.current = new Chart.Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: data.map(item => item.name),
                datasets: [{
                    data: data.map(item => item.value),
                    backgroundColor: data.map(item => item.color),
                    borderWidth: 0,
                    hoverBorderWidth: 3,
                    hoverBorderColor: '#ffffff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '60%', // 도넛 구멍 크기 (60%로 설정)
                plugins: {
                    legend: {
                        display: false // 기본 범례 숨김
                    },
                    tooltip: {
                        enabled: true,
                        backgroundColor: 'rgba(60, 16, 83, 0.9)',
                        titleColor: '#ffffff',
                        bodyColor: '#ffffff',
                        borderColor: 'var(--theme-secondary)',
                        borderWidth: 1,
                        cornerRadius: 8,
                        padding: 12,
                        displayColors: true,
                        callbacks: {
                            title: function(context) {
                                return context[0].label || '';
                            },
                            label: function(context) {
                                const value = context.parsed;
                                const percentage = ((value / total) * 100).toFixed(1);
                                return [
                                    `금액: ${value.toLocaleString()}원`,
                                    `비율: ${percentage}%`
                                ];
                            }
                        }
                    }
                },
                interaction: {
                    intersect: false,
                    mode: 'index' as const
                },
                animation: {
                    animateRotate: true,
                    animateScale: false,
                    duration: 800
                },
                onHover: (_event, elements) => {
                    if (canvasRef.current) {
                        canvasRef.current.style.cursor = elements.length > 0 ? 'pointer' : 'default';
                    }
                }
            }
        });

        return () => {
            if (chartRef.current) {
                chartRef.current.destroy();
            }
        };
    }, [data]);

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '100%'
        }}>
            <div style={{
                position: 'relative',
                width: size,
                height: size
            }}>
                <canvas
                    ref={canvasRef}
                    style={{
                        maxWidth: '100%',
                        maxHeight: '100%'
                    }}
                />

                {/* 중앙 텍스트 */}
                {centerText && (
                    <div style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        textAlign: 'center',
                        pointerEvents: 'none'
                    }}>
                        <div style={{
                            fontSize: 18,
                            fontWeight: '700',
                            color: 'var(--theme-text)',
                            fontFamily: 'inherit'
                        }}>
                            {centerText}
                        </div>
                        <div style={{
                            fontSize: 14,
                            color: 'var(--theme-text-light)',
                            fontFamily: 'inherit',
                            marginTop: 4
                        }}>
                            총 지출
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

// 사용 예시 컴포넌트
export const DonutChartExample: React.FC = () => {
    const sampleData = [
        { name: '식비', value: 45000, color: '#5F0080' },
        { name: '교통비', value: 32000, color: '#9B4DCC' },
        { name: '쇼핑', value: 28000, color: '#B983DB' },
        { name: '문화생활', value: 20000, color: '#E5D5F0' },
        { name: '의료비', value: 15000, color: '#7B6EF6' },
        { name: '기타', value: 12000, color: '#166534' }
    ];

    const total = sampleData.reduce((sum, item) => sum + item.value, 0);

    return (
        <div style={{ padding: 20 }}>
            <h3 style={{ marginBottom: 20 }}>카테고리별 지출 현황</h3>
            <DonutChart
                data={sampleData}
                size={300}
                centerText={`${total.toLocaleString()}원`}
            />
        </div>
    );
};

export default DonutChart;