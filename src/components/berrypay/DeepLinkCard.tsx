import styled from 'styled-components';
import { openDeepLink } from '@/utils/deepLink'; // 경로 확인
import { BANK_LOGOS } from '@/utils/bankLogos';

// ✅ 공통 텍스트 스타일
const Label = styled.p`
  margin: 0;
  color: white;
  font-size: 16px;
  font-weight: 700;
  flex: center;
`;

const SubLabel = styled.p`
  margin: 0;
  color: white;
  font-size: 12px;
  opacity: 0.85;
  text-align: center;
`;

const TextBox = styled.div`
  flex: 0.85; /* 남은 공간 전부 차지 */
  display: flex;
  flex-direction: column;
  align-items: center; /* 가로 가운데 */
  justify-content: center; /* 세로 가운데 */
  text-align: center; /* 글자도 가운데 */
`;

// ✅ 카드 버튼 스타일
const CardButton = styled.button<{ bg: string }>`
  width: 100%;
  padding: 16px;
  margin-bottom: 12px;
  background: ${({ bg }) => bg};
  border-radius: 16px;
  display: flex;
  text-align: center;
  gap: 12px;
  cursor: pointer;
  border: none;
`;

const IconBox = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden; /* 이미지가 넘치지 않게 */
  border: white;
`;

const IconImg = styled.img`
  width: 30px;
  height: 30px;
  object-fit: contain;
`;

const Container = styled.div`
  width: 300px;
  padding: 17px;
  background: white;
  margin: 0 auto; /* 좌우 가운데 */
  display: flex;
  flex-direction: column;
  align-items: center;
  border-radius: 16px;
  border: 1px solid #e5d5f0;
`;

export const CardPaymentBox = () => {
  return (
    <Container>
      <CardButton
        bg="#fab808"
        onClick={() =>
          openDeepLink({
            iosScheme: 'kbcardapp://',
            iosStore: 'https://apps.apple.com/kr/app/id370146475',
            androidScheme: 'kbcardapp://',
            androidStore:
              'https://play.google.com/store/apps/details?id=com.kbcard.kbkookmincard',
            web: 'https://card.kbcard.com/',
          })
        }
      >
        <IconBox>
          <IconImg src={BANK_LOGOS['KB국민']} alt="KB국민카드" />
        </IconBox>
        <TextBox>
          <Label>KB국민카드 앱</Label>
          <SubLabel>앱카드 다이렉트 결제</SubLabel>
        </TextBox>
      </CardButton>

      <CardButton
        bg="#1565b2"
        onClick={() =>
          openDeepLink({
            iosScheme: 'nonghyupcardapp://',
            iosStore: 'https://apps.apple.com/kr/app/id373742138',
            androidScheme: 'nonghyupcardapp://',
            androidStore:
              'https://play.google.com/store/apps/details?id=nh.smart.mobilecard',
            web: 'https://card.nonghyup.com/',
          })
        }
      >
        <IconBox>
          <IconImg src={BANK_LOGOS['NH농협']} alt="NH농협카드" />
        </IconBox>
        <TextBox>
          <Label>NH농협카드 앱</Label>
          <SubLabel>앱카드 다이렉트 결제</SubLabel>
        </TextBox>
      </CardButton>

      <CardButton
        bg="#000000"
        onClick={() =>
          openDeepLink({
            iosScheme: 'hyundaicardapp://',
            iosStore: 'https://apps.apple.com/kr/app/id369958957',
            androidScheme: 'hyundaicardapp://',
            androidStore:
              'https://play.google.com/store/apps/details?id=com.hyundaicard.appcard',
            web: 'https://www.hyundaicard.com/',
          })
        }
      >
        <IconBox>
          <IconImg src={BANK_LOGOS['현대']} alt="현대카드" />
        </IconBox>
        <TextBox>
          <Label>현대카드 앱</Label>
          <SubLabel>앱카드 다이렉트 결제</SubLabel>
        </TextBox>
      </CardButton>
    </Container>
  );
};
