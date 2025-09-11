import http from './http';

export const recoApi = {
  // 세션 생성
  createSession: (merchantId: number, amount: number, useGifticon: boolean) =>
    http.post('/recommendations/sessions', {
      merchantId,
      amount,
      useGifticon,
    }),

  // 세션 상세 조회
  getSession: (sessionId: number) =>
    http.get(`/recommendations/sessions/${sessionId}`, {}),

  // 옵션 선택
  chooseOption: (sessionId: number, optionId: number) =>
    http.post(`/recommendations/options/${optionId}/choose`, null, {
      params: { sessionId },
    }),

  // 트랜잭션 확정
  createTransaction: (
    merchantId: number,
    paidAmount: number,
    sessionId: number,
    optionId: number,
    categoryId: number
  ) =>
    http.post('/transactions', {
      merchantId,
      paidAmount,
      sessionId,
      optionId,
      categoryId,
    }),
};
