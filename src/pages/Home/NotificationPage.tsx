// src/pages/NotificationPage.tsx
import { useState, useEffect } from 'react';
import NotificationList from '@/components/home/notification/NotificationList.tsx';
import Header from '@/components/layout/Header';
import { ChevronDown } from 'lucide-react';
import {
    getNotifications,
    markNotificationAsRead,
    mapNotificationResponse,
} from '@/api/notificationApi';

import type {Notification, NotificationCategory} from "@/types/notification";

const NotificationPage = () => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedFilter, setSelectedFilter] = useState<NotificationCategory>('all');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const filterOptions: { value: NotificationCategory; label: string }[] = [
        { value: 'all', label: '전체' },
        { value: 'budget', label: '예산' },
        { value: 'gifticon', label: '기프티콘' },
        { value: 'benefit', label: '혜택/이벤트' }
    ];

    // 알림 목록 조회 함수 (리포트 페이지 패턴 적용)
    const fetchNotifications = async () => {
        setLoading(true);
        setError(null);

        try {
            console.log('알림 목록 조회 중...');

            const pageResponse = await getNotifications({
                page: 0,
                size: 100, // 전체 알림을 가져와서 프론트에서 필터링
                sort: 'createdAt,desc'
            });

            // 백엔드 응답을 프론트엔드 형식으로 변환
            const mappedNotifications = pageResponse.content.map(mapNotificationResponse);
            setNotifications(mappedNotifications);

            console.log('알림 목록 조회 완료:', mappedNotifications.length, '개');

        } catch (error: unknown) {
            console.error('알림 목록 로딩 실패:', error);

            // axios 에러 처리 (리포트 페이지와 동일한 패턴)
            if (error && typeof error === 'object' && 'response' in error) {
                const axiosError = error as { response?: { status?: number } };
                if (axiosError.response?.status === 401) {
                    setError('인증이 만료되었습니다. 로그인 페이지로 이동합니다.');
                } else if (axiosError.response?.status && axiosError.response.status >= 500) {
                    setError('서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
                } else {
                    setError('알림을 불러오는 중 오류가 발생했습니다.');
                }
            } else {
                setError('알림을 불러오는 중 오류가 발생했습니다.');
            }
        } finally {
            setLoading(false);
        }
    };

    // 재시도 핸들러
    const handleRetry = () => {
        fetchNotifications();
    };

    // 컴포넌트 마운트 시 알림 목록 로드
    useEffect(() => {
        fetchNotifications();
    }, []);

    // 필터링된 알림 목록
    const filteredNotifications = selectedFilter === 'all'
        ? notifications
        : notifications.filter(n => n.category === selectedFilter);

    // 알림 클릭 핸들러 (API 호출 추가)
    const handleNotificationClick = async (id: string) => {
        try {
            const notification = notifications.find(n => n.id === id);
            if (!notification || notification.isRead) return;

            console.log(`알림 읽음 처리: ${id}`);

            // 백엔드에 읽음 처리 요청
            await markNotificationAsRead(Number(id));

            // 로컬 상태 업데이트
            setNotifications(prev =>
                prev.map(notification =>
                    notification.id === id
                        ? { ...notification, isRead: true }
                        : notification
                )
            );

            console.log(`알림 읽음 처리 완료: ${id}`);

        } catch (error) {
            console.error('알림 읽음 처리 실패:', error);
            // 에러가 발생해도 UI는 업데이트 (사용자 경험 향상)
            setNotifications(prev =>
                prev.map(notification =>
                    notification.id === id
                        ? { ...notification, isRead: true }
                        : notification
                )
            );
        }
    };

    const handleFilterSelect = (filter: NotificationCategory) => {
        setSelectedFilter(filter);
        setIsDropdownOpen(false);
    };

    const selectedLabel = filterOptions.find(option => option.value === selectedFilter)?.label || '전체';

    return (
        <>
            <Header
                title="알림"
                showBackButton={false}
            />

            <div style={{
                padding: '16px',
                minHeight: 'calc(100vh - 56px)'
            }}>
                {/* 로딩 상태 */}
                {loading ? (
                    <div style={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        minHeight: '200px',
                        color: 'var(--theme-text-light)',
                        fontFamily: 'inherit'
                    }}>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 12
                        }}>
                            <div style={{
                                width: 20,
                                height: 20,
                                border: '2px solid var(--theme-secondary)',
                                borderTop: '2px solid var(--theme-primary)',
                                borderRadius: '50%',
                                animation: 'spin 1s linear infinite'
                            }} />
                            알림을 불러오는 중...
                        </div>
                    </div>
                ) : error ? (
                    /* 에러 상태 */
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        minHeight: '200px',
                        color: 'var(--theme-text-light)',
                        gap: 16,
                        padding: 20,
                        fontFamily: 'inherit'
                    }}>
                        <div style={{ textAlign: 'center' }}>
                            {error}
                        </div>

                        <button
                            onClick={handleRetry}
                            style={{
                                padding: '12px 24px',
                                backgroundColor: 'var(--theme-primary)',
                                color: 'var(--color-white)',
                                border: 'none',
                                borderRadius: 8,
                                cursor: 'pointer',
                                fontFamily: 'inherit',
                                fontSize: 14,
                                fontWeight: '600',
                                transition: 'opacity 0.2s'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.opacity = '0.9';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.opacity = '1';
                            }}
                        >
                            다시 시도
                        </button>
                    </div>
                ) : (
                    /* 정상 상태 - 알림 목록 */
                    <>
                        {/* 드롭다운 필터 */}
                        <div style={{
                            position: 'relative',
                            display: 'flex',
                            justifyContent: 'flex-start',
                        }}>
                            <div style={{ position: 'relative', marginBottom: 5 }}>
                                {/* 트리거 버튼 */}
                                <button
                                    type="button"
                                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        gap: 8,
                                        width: 352,
                                        padding: '6px 10px',
                                        borderRadius: 10,
                                        fontWeight: 800,
                                        color: '#3C1053',
                                        cursor: 'pointer',
                                        fontSize: 14,
                                        fontFamily: 'Roboto, sans-serif',
                                        border: 'none',
                                        background: 'transparent'
                                    }}
                                    aria-haspopup="listbox"
                                    aria-expanded={isDropdownOpen}
                                >
                                    <span>{selectedLabel}</span>
                                    <span
                                        style={{
                                            display: 'inline-flex',
                                            transition: 'transform .2s ease',
                                            transform: isDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)'
                                        }}
                                    >
                                        <ChevronDown size={16} color="#3C1053" />
                                    </span>
                                </button>

                                {/* 드롭다운 메뉴 */}
                                {isDropdownOpen && (
                                    <div
                                        role="listbox"
                                        style={{
                                            position: 'absolute',
                                            top: 0,
                                            left: 0,
                                            zIndex: 1000,
                                            width: 120,
                                            background: '#fff',
                                            borderRadius: 10,
                                            border: '1px solid #E5D5F0',
                                            boxShadow: '0 6px 20px rgba(0,0,0,0.06)',
                                            overflow: 'hidden'
                                        }}
                                    >
                                        {filterOptions.map((option) => {
                                            const isActive = option.value === selectedFilter;
                                            return (
                                                <button
                                                    key={option.value}
                                                    role="option"
                                                    aria-selected={isActive}
                                                    onClick={() => handleFilterSelect(option.value)}
                                                    style={{
                                                        width: '100%',
                                                        textAlign: 'left',
                                                        padding: '10px 12px',
                                                        fontWeight: 800,
                                                        fontSize: 14,
                                                        fontFamily: 'Roboto, sans-serif',
                                                        color: '#3C1053',
                                                        background: isActive ? '#FAF7FB' : '#fff',
                                                        border: 'none',
                                                        outline: 'none',
                                                        cursor: 'pointer'
                                                    }}
                                                    onMouseEnter={(e) => {
                                                        if (!isActive) e.currentTarget.style.backgroundColor = '#f5f5f5';
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        if (!isActive) e.currentTarget.style.backgroundColor = '#fff';
                                                    }}
                                                >
                                                    {option.label}
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>

                        <hr
                            style={{
                                border: 'none',
                                borderTop: '1px solid #E5D5F0',
                                margin: '0 0 20px 0'
                            }}
                        />

                        {/* 알림 목록 */}
                        <NotificationList
                            notifications={filteredNotifications}
                            onNotificationClick={handleNotificationClick}
                            emptyMessage={`${selectedLabel} 알림이 없습니다.`}
                        />
                    </>
                )}
            </div>

            {/* 드롭다운 외부 클릭 시 닫기 */}
            {isDropdownOpen && (
                <div
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        zIndex: 999
                    }}
                    onClick={() => setIsDropdownOpen(false)}
                />
            )}

            {/* 스피너 애니메이션 스타일 */}
            <style>{`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `}</style>
        </>
    );
};

export default NotificationPage;