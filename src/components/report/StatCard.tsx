import React from 'react';

interface StatCardProps {
    title: string;
    value: string;
    titleColor?: string;
    valueColor?: string;
}

const StatCard: React.FC<StatCardProps> = ({
                                               title,
                                               value,
                                               titleColor = '#B47AD8',
                                               valueColor = '#793895'
                                           }) => {
    return (
        <div style={{
            width: 160,
            height: 70,
            background: '#F9F7FB',
            borderRadius: 9,
            border: '1px #E6D8F0 solid',
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 4
        }}>
            <div style={{
                color: valueColor,
                fontSize: 18.2,
                fontFamily: 'Roboto, sans-serif',
                fontWeight: '700',
                textAlign: 'center'
            }}>
                {value}
            </div>
            <div style={{
                color: titleColor,
                fontSize: 11.8,
                fontFamily: 'Roboto, sans-serif',
                fontWeight: '700',
                textAlign: 'center'
            }}>
                {title}
            </div>
        </div>
    );
};

export default StatCard;