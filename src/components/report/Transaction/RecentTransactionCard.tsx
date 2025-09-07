import React from 'react';
import TransactionList from './TransactionList';

interface Transaction {
    id: string;
    storeName: string;
    amount: number;
    cardCompany: string;
    category: string;
    reward: number;
}

interface RecentTransactionCardProps {
    transactions?: Transaction[];
    title?: string;
}

const RecentTransactionCard: React.FC<RecentTransactionCardProps> = ({
                                                                         transactions = [
                                                                             {
                                                                                 id: '1',
                                                                                 storeName: '스타벅스',
                                                                                 amount: 4800,
                                                                                 cardCompany: '신한카드',
                                                                                 category: '카페',
                                                                                 reward: 1300
                                                                             },
                                                                             {
                                                                                 id: '2',
                                                                                 storeName: 'GS25',
                                                                                 amount: 3200,
                                                                                 cardCompany: 'KB국민',
                                                                                 category: '편의점',
                                                                                 reward: 400
                                                                             }
                                                                         ],
                                                                         title = '최근 거래'
                                                                     }) => {
    return (
        <div style={{
            width: 334,
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
            alignItems: 'center'
        }}>
            {/* 제목 (옵션) */}
            {title && (
                <div style={{
                    color: 'var(--theme-text)',
                    fontSize: 15.2,
                    fontFamily: 'inherit',
                    fontWeight: '800',
                    wordWrap: 'break-word'
                }}>
                    {title}
                </div>
            )}

            {/* 거래 목록 */}
            <TransactionList transactions={transactions} />
        </div>
    );
};

export default RecentTransactionCard;