// src/api/notificationApi.ts
import  api  from '@/api/http';
import type { ApiResponse, PageResponse, NotificationResponse } from '@/types/notification';

// 알림 카테고리 타입
export type NotificationCategory = 'all' | 'budget' | 'gifticon' | 'benefit';

// 알림 응답 타입 (백엔드 NotificationResponse와 매핑)
export interface NotificationResponse {
    id: number;
    userId: number;
    title: string;
    message: string;
    type: string;
    isRead: boolean;
    createdAt: string;
    readAt?: string;
}

// 프론트엔드에서 사용할 알림 타입 (기존 인터페이스와 호환)
export interface Notification {
    id: string;
    storeName: string;
    description: string;
    iconText: string;
    isRead: boolean;
    category: NotificationCategory;
    createdAt?: string;
}

// 페이지네이션 파라미터
export interface NotificationListParams {
    page?: number;
    size?: number;
    sort?: string;
}

// 알림 목록 조회
export const getNotifications = async (
    params: NotificationListParams = {}
): Promise<PageResponse<NotificationResponse>> => {
    try {
        const queryParams = {
            page: params.page || 0,
            size: params.size || 20,
            sort: params.sort || 'createdAt,desc'
        };

        const response = await api.get<ApiResponse<PageResponse<NotificationResponse>>>(
            '/notifications',
            { params: queryParams }
        );

        return response.data.data;

    } catch (error) {
        console.error('알림 목록 조회 실패:', error);
        throw error;
    }
};

// 읽지 않은 알림 개수 조회
export const getUnreadNotificationCount = async (): Promise<number> => {
    try {
        const response = await api.get<ApiResponse<number>>('/notifications/unread-count');
        return response.data.data;

    } catch (error) {
        console.error('읽지 않은 알림 개수 조회 실패:', error);
        throw error;
    }
};

// 알림 읽음 처리
export const markNotificationAsRead = async (notificationId: number): Promise<void> => {
    try {
        await api.put<ApiResponse<void>>(`/notifications/${notificationId}/read`);

    } catch (error) {
        console.error('알림 읽음 처리 실패:', error);
        throw error;
    }
};

// 테스트 알림 발송
export const sendTestNotification = async (): Promise<NotificationResponse> => {
    try {
        const response = await api.post<ApiResponse<NotificationResponse>>('/notifications/test');
        return response.data.data;

    } catch (error) {
        console.error('테스트 알림 발송 실패:', error);
        throw error;
    }
};

// 백엔드 NotificationResponse를 프론트엔드 Notification으로 변환
export const mapNotificationResponse = (response: NotificationResponse): Notification => {
    // 알림 타입에 따른 매핑 로직 (실제 API 응답 기준)
    let category: NotificationCategory = 'benefit'; // 기본값
    let storeName = '알림';
    let iconText = '📢';

    // notificationType에 따른 카테고리 및 표시 정보 결정
    const typeKey = response.notificationType?.toLowerCase() || '';

    if (typeKey.includes('예산') || typeKey.includes('budget')) {
        category = 'budget';
        storeName = '예산 관리';
        iconText = '💰';
    } else if (typeKey.includes('기프티콘') || typeKey.includes('gifticon')) {
        category = 'gifticon';
        storeName = response.title || '기프티콘';
        iconText = '🎁';
    } else if (typeKey.includes('혜택') || typeKey.includes('이벤트') || typeKey.includes('benefit')) {
        category = 'benefit';
        storeName = response.title || '혜택';
        iconText = getStoreIcon(response.title || '');
    } else {
        category = 'benefit';
        storeName = response.title || '알림';
        iconText = '📢';
    }

    return {
        id: response.notificationId.toString(),        // notificationId → id
        storeName,
        description: response.body,                    // body → description
        iconText,
        isRead: response.isRead,
        category,
        createdAt: response.sentAt || response.createdAt // sentAt 우선, createdAt 백업
    };
};

// 매장명에 따른 아이콘 텍스트 생성
const getStoreIcon = (title: string): string => {
    const storeName = title.toLowerCase();

    if (storeName.includes('gs') || storeName.includes('gs25')) return 'GS';
    if (storeName.includes('cu')) return 'CU';
    if (storeName.includes('7-eleven') || storeName.includes('세븐일레븐')) return '7E';
    if (storeName.includes('스타벅스') || storeName.includes('starbucks')) return 'ST';
    if (storeName.includes('이마트') || storeName.includes('emart')) return 'EM';
    if (storeName.includes('롯데') || storeName.includes('lotte')) return 'LT';

    // 기본값: 첫 두 글자
    const firstTwoChars = title.substring(0, 2);
    return firstTwoChars || '📢';
};