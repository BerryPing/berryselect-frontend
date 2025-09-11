import http from '@/api/http';

const getAuthHeaders = () => {
  const token = localStorage.getItem('accessToken'); // 로그인 성공 시 저장한 토큰
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const recoApi = {
  // 세션 생성
  createSession: (merchantId: number, amount: number, useGifticon: boolean) =>
    http.post(
      '/recommendations/sessions',
      { merchantId, amount, useGifticon },
      { headers: { ...getAuthHeaders() } }
    ),

  // 세션 상세 조회
  getSession: (sessionId: number) =>
    http.get(`/recommendations/sessions/${sessionId}`, {
      headers: { ...getAuthHeaders() },
    }),

  // 옵션 선택
  chooseOption: (sessionId: number, optionId: number) =>
    http.post(`/recommendations/options/${optionId}/choose`, null, {
      params: { sessionId },
      headers: { ...getAuthHeaders() },
    }),

  // 트랜잭션 확정
  createTransaction: (
    merchantId: number,
    paidAmount: number,
    sessionId: number,
    optionId: number,
    categoryId: number
  ) =>
    http.post(
      '/transactions',
      { merchantId, paidAmount, sessionId, optionId, categoryId },
      { headers: { ...getAuthHeaders() } }
    ),
};
