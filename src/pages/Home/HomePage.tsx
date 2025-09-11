// src/pages/Home/HomePage.tsx
import { useState, useEffect } from 'react';
import HomeSearchBar from '@/components/home/HomeSearchBar.tsx';
import HomeGreetingCard from '@/components/home/HomeGreetingCard.tsx';
import StatItem from '@/components/home/StatItem.tsx';
import HomeAlertCard from '@/components/home/HomeAlertCard.tsx';
import RecentTransactionCard from '@/components/report/Transaction/RecentTransactionCard.tsx';
import { getRecentTransactions } from '@/api/transactionApi.ts';
import type { TransactionDetailResponse } from '@/types/transaction';
import { useNavigate } from 'react-router-dom';
import {
  getUnreadNotificationCount,
  getNotifications,
} from '@/api/notificationApi.ts';
import type { NotificationResponse } from '@/api/notificationApi.ts';
import { fetchMyProfile, type UserProfile } from '@/api/myberryApi.ts';
import type { MonthlyReportData } from '@/types/report';
import type { Budget } from '@/api/myberryApi.ts';
import { getMonthlyReportData } from '@/api/reportApi.ts';
import { fetchBudget } from '@/api/myberryApi.ts';

const HomePage = () => {
  const [searchValue, setSearchValue] = useState('');
  const [recentTransactions, setRecentTransactions] = useState<
    TransactionDetailResponse[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const [unreadNotificationCount, setUnreadNotificationCount] =
    useState<number>(0);

  const [latestAlert, setLatestAlert] = useState<NotificationResponse | null>(
    null
  );
  const [alertLoading, setAlertLoading] = useState(true);

  // 사용자 프로필 state 추가
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);

  const [reportData, setReportData] = useState<MonthlyReportData | null>(null);
  const [budgetData, setBudgetData] = useState<Budget | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState<string | null>(null);

  // 현재 년월 계산
  const getCurrentYearMonth = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
  };

  // StatItem용 데이터 생성
  const generateStatsData = () => {
    if (statsLoading) {
      return [
        {
          value: '로딩중...',
          label: '이번 달\n절감금액',
          color: 'var(--theme-text-light, #9B4DCC)',
        },
        {
          value: '로딩중...',
          label: '추천\n사용률',
          color: 'var(--theme-text-light, #9B4DCC)',
        },
        {
          value: '로딩중...',
          label: '이번 달\n잔여예산',
          color: 'var(--theme-text-light, #9B4DCC)',
        },
      ];
    }

    if (statsError || (!reportData && !budgetData)) {
      return [
        {
          value: '오류',
          label: '이번 달\n절감금액',
          color: 'var(--theme-text-light, #9B4DCC)',
        },
        {
          value: '오류',
          label: '추천\n사용률',
          color: 'var(--theme-text-light, #9B4DCC)',
        },
        {
          value: '오류',
          label: '이번 달\n잔여예산',
          color: 'var(--theme-text-light, #9B4DCC)',
        },
      ];
    }

    // 1. 절감금액
    const savedAmount = reportData?.totalSaved || 0;
    const savedAmountText =
      savedAmount > 0
        ? `+${savedAmount.toLocaleString()}원`
        : savedAmount < 0
        ? `${savedAmount.toLocaleString()}원`
        : '0원';
    const savedAmountColor =
      savedAmount > 0
        ? 'var(--theme-text-green, #059669)'
        : savedAmount < 0
        ? 'var(--theme-text-red, #DC2626)'
        : 'var(--theme-text, #3C1053)';

    // 2. 추천 사용률
    const usageRate = reportData?.recommendationUsageRate || 0;
    const usageRateText = `${Math.round(usageRate * 100)}%`;

    // 3. 잔여예산
    const remainingAmount = budgetData?.amountRemaining || 0;
    const remainingAmountText =
      remainingAmount > 0
        ? `${remainingAmount.toLocaleString()}원`
        : remainingAmount < 0
        ? `${Math.abs(remainingAmount).toLocaleString()}원 초과`
        : '0원';
    const remainingAmountColor =
      remainingAmount > 0
        ? 'var(--theme-text, #3C1053)'
        : remainingAmount < 0
        ? 'var(--theme-text-red, #DC2626)'
        : 'var(--theme-text-light, #9B4DCC)';

    return [
      {
        value: savedAmountText,
        label: '이번 달\n절감금액',
        color: savedAmountColor,
      },
      {
        value: usageRateText,
        label: '추천\n사용률',
        color: 'var(--theme-primary, #5F0080)',
      },
      {
        value: remainingAmountText,
        label: '이번 달\n잔여예산',
        color: remainingAmountColor,
      },
    ];
  };

  // StatItem용 데이터 조회
  const fetchStatsData = async () => {
    try {
      setStatsLoading(true);
      setStatsError(null);

      const currentYearMonth = getCurrentYearMonth();

      // 병렬로 데이터 조회
      const [reportResult, budgetResult] = await Promise.all([
        getMonthlyReportData(currentYearMonth).catch((err) => {
          console.warn('리포트 데이터 조회 실패:', err);
          return null;
        }),
        fetchBudget(currentYearMonth).catch((err) => {
          console.warn('예산 데이터 조회 실패:', err);
          return null;
        }),
      ]);

      setReportData(reportResult);
      setBudgetData(budgetResult);
    } catch (error) {
      console.error('StatItem 데이터 조회 실패:', error);
      setStatsError('통계 데이터를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setStatsLoading(false);
    }
  };

  const fetchLatestAlert = async () => {
    try {
      setAlertLoading(true);
      const response = await getNotifications({
        page: 0,
        size: 1,
        sort: 'createdAt,desc',
      });

      if (response.content && response.content.length > 0) {
        setLatestAlert(response.content[0]);
      } else {
        setLatestAlert(null);
      }
    } catch (error) {
      console.error('최신 알림 조회 중 오류:', error);
      setLatestAlert(null);
    } finally {
      setAlertLoading(false);
    }
  };

  const handleAlertClick = () => {
    console.log('알림 카드 클릭됨');
    navigate('/wallet');
  };

  const fetchUserProfile = async () => {
    try {
      setProfileLoading(true);
      const profile = await fetchMyProfile();
      setUserProfile(profile);
    } catch (error) {
      console.error('사용자 프로필 조회 중 오류:', error);
      setUserProfile(null);
    } finally {
      setProfileLoading(false);
    }
  };

  // 읽지 않은 알림 개수 조회 함수
  const fetchUnreadCount = async () => {
    try {
      console.log('읽지 않은 알림 개수 조회 중...');

      const count = await getUnreadNotificationCount();
      setUnreadNotificationCount(count);
      console.log('읽지 않은 알림 개수:', count);
    } catch (error) {
      console.error('알림 개수 조회 중 오류:', error);
      // 에러가 발생해도 0으로 설정하여 UI는 정상 표시
      setUnreadNotificationCount(0);
    }
  };

  // 최근 거래 내역 조회 함수
  const fetchRecentTransactions = async () => {
    setLoading(true);
    setError(null);

    try {
      console.log('최근 거래 내역 조회 중...');

      const transactions = await getRecentTransactions(undefined, 3);
      setRecentTransactions(transactions);
    } catch (error: unknown) {
      console.error('최근 거래 내역 로딩 실패:', error);

      // axios 에러 처리 (리포트 페이지와 동일한 패턴)
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { status?: number } };
        if (axiosError.response?.status === 401) {
          // http.ts에서 이미 토큰 갱신을 시도했지만 실패한 경우
          setError('인증이 만료되었습니다. 로그인 페이지로 이동합니다.');
        } else if (
          axiosError.response?.status &&
          axiosError.response.status >= 500
        ) {
          setError('서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
        } else {
          setError('거래 내역을 불러오는 중 오류가 발생했습니다.');
        }
      } else {
        setError('거래 내역을 불러오는 중 오류가 발생했습니다.');
      }
    } finally {
      setLoading(false);
    }
  };

  // 알림 타입에 따른 스타일 반환
  const getAlertStyle = (notificationType: string) => {
    const type = notificationType?.toLowerCase() || '';

    if (type.includes('기프티콘') || type.includes('gifticon')) {
      return {
        icon: '🎁',
        iconBgColor: '#FEF3CD', // 노란색
        iconTextColor: '#92400E',
      };
    } else if (type.includes('예산') || type.includes('budget')) {
      return {
        icon: '💰',
        iconBgColor: '#FEE2E2', // 빨간색
        iconTextColor: '#991B1B',
      };
    } else if (
      type.includes('혜택') ||
      type.includes('benefit') ||
      type.includes('이벤트')
    ) {
      return {
        icon: '✨',
        iconBgColor: '#E0E7FF', // 파란색
        iconTextColor: '#3730A3',
      };
    } else {
      return {
        icon: '🔔',
        iconBgColor: '#F3E8FF', // 보라색
        iconTextColor: '#6B21A8',
      };
    }
  };

  // 알림 제목을 간단하게 포맷팅하는 함수
  const formatAlertTitle = (notification: NotificationResponse) => {
    const type = notification.notificationType?.toLowerCase() || '';

    if (type.includes('기프티콘') || type.includes('gifticon')) {
      // 백엔드에서 "3일 후 만료 예정" 이런 텍스트가 온다면 파싱
      const bodyText = notification.body || '';

      // "3일 후" 패턴 찾기
      const daysMatch = bodyText.match(/(\d+)일\s*후/);
      if (daysMatch) {
        const days = daysMatch[1];
        return `기프티콘 만료 D-${days}`;
      }

      // 기본값
      return '기프티콘 만료 알림';
    }

    // 다른 알림 타입들
    return notification.title || '새로운 알림';
  };

  // 재시도 핸들러
  const handleRetry = () => {
    fetchRecentTransactions();
  };

  const handleGoalClick = () => {
    navigate('/myberry');
  };

  useEffect(() => {
    fetchRecentTransactions();
    fetchUnreadCount();
    fetchLatestAlert();
    fetchUserProfile();
    fetchStatsData();
  }, []);

  return (
    <>
      <HomeSearchBar
        searchPlaceholder="위치/가맹점 검색"
        searchValue={searchValue}
        onSearchChange={setSearchValue} // TODO: 검색 navigate 연결하기
      />
      {/* 헤더 높이만큼 여백 */}
      <div style={{ marginTop: '80px', padding: '16px' }}>
        {/* 인사 카드 */}
        <HomeGreetingCard
          userName={
            profileLoading ? '로딩 중...' : userProfile?.name || '베리 사용자'
          }
          unreadCount={unreadNotificationCount}
          onNotificationClick={() => {
            navigate('/notification');
          }}
        />

        {/* 통계 카드 */}
        <div style={{ marginTop: '16px' }}>
          <StatItem stats={generateStatsData()} onGoalClick={handleGoalClick} />
        </div>

        {/* 알림 카드 - 백엔드 연동 */}
        {!alertLoading && latestAlert && (
          <div style={{ marginTop: '16px' }}>
            <HomeAlertCard
              title={formatAlertTitle(latestAlert)}
              icon={getAlertStyle(latestAlert.notificationType || '').icon}
              iconBgColor={
                getAlertStyle(latestAlert.notificationType || '').iconBgColor
              }
              iconTextColor={
                getAlertStyle(latestAlert.notificationType || '').iconTextColor
              }
              onCardClick={handleAlertClick}
            />
          </div>
        )}

        {/* 최근 거래 카드 */}
        <div style={{ marginTop: '16px' }}>
          <style>
            {`
                            .homepage-transaction-override div[style*="width: 334"] {
                                width: 100% !important;
                            }
                            .homepage-transaction-override {
                                position: relative;
                            }
                            .homepage-transaction-override::after {
                                content: "전체보기";
                                position: absolute;
                                top: 4px;
                                right: 5px;
                                color: var(--theme-text-sub);
                                font-size: 12px;
                                font-family: inherit;
                                font-weight: 400;
                                cursor: pointer;
                            }
                        `}
          </style>

          <div
            className="homepage-transaction-override"
            onClick={(e) => {
              // "전체보기" 영역 클릭 감지
              const rect = e.currentTarget.getBoundingClientRect();
              const clickX = e.clientX - rect.left;
              const clickY = e.clientY - rect.top;

              // 오른쪽 상단 영역 클릭시
              if (clickX > rect.width - 60 && clickY < 25) {
                console.log('전체보기 클릭됨');
                navigate('/report');
              }
            }}
          >
            {/* 로딩 상태 */}
            {loading ? (
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  minHeight: '120px',
                  color: 'var(--theme-text-light)',
                  fontFamily: 'inherit',
                  backgroundColor: 'var(--color-white)',
                  borderRadius: '12px',
                  border: '1px solid var(--theme-border)',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                  }}
                >
                  <div
                    style={{
                      width: 16,
                      height: 16,
                      border: '2px solid var(--theme-secondary)',
                      borderTop: '2px solid var(--theme-primary)',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite',
                    }}
                  />
                  거래 내역을 불러오는 중...
                </div>
              </div>
            ) : error ? (
              /* 에러 상태 */
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  minHeight: '120px',
                  color: 'var(--theme-text-light)',
                  gap: 12,
                  padding: 20,
                  fontFamily: 'inherit',
                  backgroundColor: 'var(--color-white)',
                  borderRadius: '12px',
                  border: '1px solid var(--theme-border)',
                }}
              >
                <div style={{ textAlign: 'center', fontSize: '14px' }}>
                  {error}
                </div>

                <button
                  onClick={handleRetry}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: 'var(--theme-primary)',
                    color: 'var(--color-white)',
                    border: 'none',
                    borderRadius: 6,
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    fontSize: 12,
                    fontWeight: '600',
                    transition: 'opacity 0.2s',
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
              /* 정상 상태 - 거래 내역 표시 */
              <RecentTransactionCard
                title="최근 거래"
                transactions={recentTransactions}
              />
            )}
          </div>
        </div>
      </div>

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

export default HomePage;
