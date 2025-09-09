import React from 'react';
import NotificationCard from './NotificationCard';

interface Notification {
    id: string;
    storeName: string;
    description: string;
    iconText: string;
    isRead: boolean;
}

interface NotificationListProps {
    // 알림 목록
    notifications?: Notification[];

    // 알림 클릭 핸들러
    onNotificationClick?: (id: string) => void;

    // 빈 상태 메시지
    emptyMessage?: string;
}

const NotificationList: React.FC<NotificationListProps> = ({
                                                               notifications = [
                                                                   {
                                                                       id: '1',
                                                                       storeName: 'GS25',
                                                                       description: '편의점 적립 5% + 쿠폰',
                                                                       iconText: 'GS',
                                                                       isRead: false
                                                                   },
                                                                   {
                                                                       id: '2',
                                                                       storeName: '스타벅스',
                                                                       description: '카페 할인 이벤트 진행 중',
                                                                       iconText: 'ST',
                                                                       isRead: true
                                                                   },
                                                                   {
                                                                       id: '3',
                                                                       storeName: '롯데마트',
                                                                       description: '생필품 20% 할인',
                                                                       iconText: 'LM',
                                                                       isRead: false
                                                                   },
                                                                   {
                                                                       id: '4',
                                                                       storeName: 'CU',
                                                                       description: '1+1 이벤트 상품',
                                                                       iconText: 'CU',
                                                                       isRead: true
                                                                   }
                                                               ],
                                                               onNotificationClick,
                                                               emptyMessage = '새로운 알림이 없습니다.'
                                                           }) => {
    if (!notifications || notifications.length === 0) {
        return (
            <div style={{
                width: '100%',
                padding: '40px',
                textAlign: 'center',
                color: 'var(--theme-text-light, #9B4DCC)',
                fontSize: 14,
                fontFamily: 'Roboto, sans-serif'
            }}>
                {emptyMessage}
            </div>
        );
    }

    return (
        <div style={{
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
            alignItems: 'center'
        }}>
            {notifications.map((notification) => (
                <NotificationCard
                    key={notification.id}
                    id={notification.id}
                    storeName={notification.storeName}
                    description={notification.description}
                    iconText={notification.iconText}
                    isRead={notification.isRead}
                    onCardClick={onNotificationClick}
                />
            ))}
        </div>
    );
};

export default NotificationList;