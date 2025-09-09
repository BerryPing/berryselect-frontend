// src/types/notification.ts

// 알림 카테고리 타입
export type NotificationCategory = 'all' | 'budget' | 'gifticon' | 'benefit';

// 백엔드 NotificationResponse 타입 (실제 API 응답과 매핑)
export interface NotificationResponse {
    notificationId: number;        // 실제 응답: notificationId
    notificationType: string;      // 실제 응답: notificationType
    title: string;                 // 실제 응답: title
    body: string;                  // 실제 응답: body
    sentAt: string;               // 실제 응답: sentAt
    status: string;               // 실제 응답: status
    createdAt: string;            // 실제 응답: createdAt
    isRead: boolean;              // 실제 응답: isRead
}

// 프론트엔드 Notification 타입 (UI에서 사용)
export interface Notification {
    id: string;
    storeName: string;
    description: string;
    iconText: string;
    isRead: boolean;
    category: NotificationCategory;
    createdAt?: string;
}

// 알림 목록 조회 파라미터
export interface NotificationListParams {
    page?: number;
    size?: number;
    sort?: string;
}

// 페이지네이션 응답 타입 (공통으로 사용될 수 있음)
export interface PageResponse<T> {
    content: T[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
    numberOfElements: number;
    first: boolean;
    last: boolean;
    empty: boolean;
}

// API 응답 래퍼 타입 (공통으로 사용될 수 있음)
export interface ApiResponse<T> {
    data: T;
    success: boolean;
    message?: string;
}