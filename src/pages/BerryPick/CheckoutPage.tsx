import { useLocation } from 'react-router-dom';
import { useState } from 'react';
import { recoApi } from '@/api/recoApi';

const CheckoutPage = () => {
  const location = useLocation();
  const { sessionId, optionId, merchantId, paidAmount } = location.state || {};
  const [showModal, setShowModal] = useState(false);

  if (!sessionId || !optionId || !merchantId || !paidAmount) {
    return <div>잘못된 접근입니다.</div>;
  }

  const handlePayment = async (method: string) => {
    try {
      const res = await recoApi.createTransaction(
        merchantId,
        paidAmount,
        sessionId,
        optionId
      );
      alert(`${method} 결제 성공: ${JSON.stringify(res.data, null, 2)}`);
      setShowModal(false);
    } catch (error) {
      console.error('결제 실패:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <h1 className="text-xl font-bold mb-4">결제 준비</h1>

      {/* 선택된 가맹점 & 금액 */}
      <div className="bg-white p-4 rounded shadow mb-4">
        <p className="font-semibold">가맹점 ID: {merchantId}</p>
        <p>결제 금액: {paidAmount.toLocaleString()}원</p>
      </div>

      {/* 추천 조합 / 상세 내역 (TODO: recoApi.getSession으로 보강 가능) */}
      <div className="bg-purple-600 text-white p-4 rounded-lg mb-4">
        <p className="font-semibold">베리셀렉트 추천 조합</p>
        <p>세션 ID: {sessionId}</p>
        <p>옵션 ID: {optionId}</p>
      </div>

      <button
        onClick={() => setShowModal(true)}
        className="w-full bg-green-600 text-white py-2 rounded-md font-semibold"
      >
        결제하기
      </button>

      {/* 결제 모달 */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg w-80">
            <h2 className="text-lg font-bold mb-4">결제 수단 선택</h2>
            <div className="space-y-2">
              <button
                className="w-full py-2 bg-purple-600 text-white rounded"
                onClick={() => handlePayment('기프티콘')}
              >
                기프티콘 결제
              </button>
              <button
                className="w-full py-2 bg-purple-600 text-white rounded"
                onClick={() => handlePayment('멤버십')}
              >
                멤버십 결제
              </button>
              <button
                className="w-full py-2 bg-purple-600 text-white rounded"
                onClick={() => handlePayment('카드')}
              >
                카드 결제
              </button>
            </div>
            <button
              className="mt-4 w-full py-2 border rounded"
              onClick={() => setShowModal(false)}
            >
              취소
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CheckoutPage;
