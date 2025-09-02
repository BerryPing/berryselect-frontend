import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import berrylogo from "@/assets/imgs/berrylogo.png";

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  min-height: 100%;
  background: var(--theme-primary);
  color: var(--slogan-gray);
    padding-top : 40px;
    box-sizing : border-box;
`;

const Logo = styled.img`
  width: 384px;
  height: 384px;
  margin-bottom: -70px;
`;

const Brand = styled.h1`
  font-size: 37px;
  font-weight: 550;
  margin: 0;
`;

const Slogan = styled.p`
  font-size: 14px;
  margin: 8px 0 32px;
`;

const StartButton = styled.button`
  background: var(--color-white);
  color: var(--color-input-text);
  font-weight: 600;
  border-radius: 12px;
  padding: 9px 50px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
`;

export default function WelcomePage() {
    const navigate = useNavigate();
    return (
        <Wrapper>
            <Logo src={berrylogo} alt="berry logo" />
            <Brand>berryselect</Brand>
            <Slogan>내 지갑 속 딱 맞는 결제 순간</Slogan>
            <StartButton onClick={() => navigate("/auth/login")}>
                베리셀렉트 시작하기
            </StartButton>
        </Wrapper>
    );
}