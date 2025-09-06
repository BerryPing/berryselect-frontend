// 카드별 색상 매핑 (그라데이션 포함)
export const cardColors: Record<string, string> = {
    // KB
    "KB 국민카드 (T-economy)": "linear-gradient(145deg,#92400E 0%,#FEF3CD 100%)",

    // 신한
    "신한카드(파인애플)": "linear-gradient(145deg,#5F0080 0%,#9B4DCC 100%)",
    "신한카드(Deep Dream)": "linear-gradient(145deg,#3C1053 0%,#7B6EF6 100%)",
    "신한 Deep Dream 체크 카드": "linear-gradient(145deg,#3C1053 0%,#7B6EF6 100%)",
    "신한 Sol Travel": "linear-gradient(145deg,#5F0080 0%,#E5D5F0 100%)",

    // 현대
    "현대카드 ZERO Edition2(포인트형)": "linear-gradient(145deg,#0F766E 0%,#DCFCE7 100%)",
    "현대 M check 카드": "linear-gradient(145deg,#92400E 0%,#FEF3CD 100%)",

    // 우리
    "우리카드 카드의정석 EVERY DISCOUNT": "linear-gradient(145deg,#166534 0%,#22C55E 100%)",
    "우리카드 그린카드(서울형)": "linear-gradient(145deg,#0F766E 0%,#DCFCE7 100%)",

    // NH
    "NH 올원 체크카드": "linear-gradient(145deg,#166534 0%,#0F766E 100%)",

    // 동백전 (부산지역화폐)
    "동백전(부산지역화폐)": "linear-gradient(145deg, #FF0000 0%, #FF99AA 100%)",

    // 토스
    "토스 체크카드": "linear-gradient(145deg,#1E3A8A 0%,#3B82F6 100%)",
};

export function getCardColor(productName?: string): string {
    return productName && cardColors[productName]
        ? cardColors[productName]
        : "linear-gradient(145deg,#5F0080 0%,#9B4DCC 100%)";  // 기본값 (보라 계열)
}