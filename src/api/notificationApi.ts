// src/api/notificationApi.ts
import  api  from '@/api/http';
import type { ApiResponse, PageResponse, NotificationResponse, Notification, NotificationCategory, NotificationListParams } from '@/types/notification';
import {AxiosError} from "axios";

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

        console.log('🔍 알림 API 요청:', '/notifications', queryParams);

        const response = await api.get<PageResponse<NotificationResponse>>(
            '/notifications',
            { params: queryParams }
        );

        console.log('📦 전체 응답:', response);
        console.log('📋 응답 데이터:', response.data);

        // 2단계: response.data 검증
        if (!response.data) {
            throw new Error('응답에 data 필드가 없습니다');
        }

        const pageData = response.data;

        console.log('📄 페이지 데이터:', pageData);
        console.log('📝 컨텐츠 배열:', pageData?.content);

        // 4단계: content 배열 검증
        if (!pageData.content) {
            console.warn('⚠️ PageResponse에 content 필드가 없습니다. 전체 pageData:', pageData);

            return {
                content: [],
                totalElements: 0,
                totalPages: 0,
                size: params.size || 20,
                number: params.page || 0,
                numberOfElements: 0,
                first: true,
                last: true,
                empty: true
            };
        }

        if (!Array.isArray(pageData.content)) {
            console.warn('⚠️ content가 배열이 아닙니다:', typeof pageData.content, pageData.content);

            // content가 배열이 아니면 빈 배열로 처리
            return {
                ...pageData,
                content: []
            };
        }

        console.log('✅ 알림 데이터 검증 완료, 알림 개수:', pageData.content.length);

        return pageData;

    } catch (error) {
        console.error('❌ 알림 목록 조회 실패:', error);

        // axios 에러인 경우 상세 정보 출력
        if (error instanceof AxiosError) {
            console.error('HTTP 상태:', error.response?.status);
            console.error('응답 헤더:', error.response?.headers);
            console.error('응답 데이터:', error.response?.data);
            console.error('요청 URL:', error.config?.url);
        }

        throw error;
    }
};

// 읽지 않은 알림 개수 조회
export const getUnreadNotificationCount = async (): Promise<number> => {
    try {
        const response = await api.get<number>('/notifications/unread-count');
        return response.data;

    } catch (error) {
        console.error('읽지 않은 알림 개수 조회 실패:', error);
        throw error;
    }
};

// 알림 읽음 처리
export const markNotificationAsRead = async (notificationId: number): Promise<void> => {
    try {
        await api.put<void>(`/notifications/${notificationId}/read`);

    } catch (error) {
        console.error('알림 읽음 처리 실패:', error);
        throw error;
    }
};

// 테스트 알림 발송
export const sendTestNotification = async (): Promise<NotificationResponse> => {
    try {
        const response = await api.post<NotificationResponse>('/notifications/test');
        return response.data;

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

export type {
    NotificationResponse,
    Notification,
    NotificationCategory,
    NotificationListParams,
    PageResponse,
    ApiResponse
};