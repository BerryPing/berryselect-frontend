import React from 'react';
import TransactionItem from './TransactionItem';

interface Transaction {
    id: string;
    storeName: string;
    amount: number;
    cardCompany: string;
    category: string;
    reward: number;
}

interface TransactionListProps {
    transactions: Transaction[];
}

const TransactionList: React.FC<TransactionListProps> = ({
                                                             transactions
                                                         }) => {
    return (
        <div style={{
            width: 334,
            height: 'auto',
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            gap: 8
        }}>
            {transactions.map((transaction) => (
                <TransactionItem
                    key={transaction.id}
                    storeName={transaction.storeName}
                    amount={transaction.amount}
                    cardCompany={transaction.cardCompany}
                    category={transaction.category}
                    reward={transaction.reward}
                />
            ))}
        </div>
    );
};

export default TransactionList;