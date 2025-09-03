import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import berrylogo from "@/assets/imgs/berrylogo.png";
import Header4Auth from "@/components/layout/Header4Auth.tsx";



export default function LoginPage() {
    const navigate = useNavigate();
    return (
        <div>
            <Header4Auth />

            <Wrapper>
            <Logo src={berrylogo} alt="berry logo" />
            <StartButton onClick={() => navigate("/auth/login")}>
                베리셀렉트 시작하기
            </StartButton>

            <Inline>
                <InlineText>이미 계정이 있으신가요?</InlineText>
                <LinkButton onClick={() => navigate("/auth/login")}> 로그인 </LinkButton>
            </Inline>

        </Wrapper>
        </div>
    );
}

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  min-height: 100%;
  background: var(--theme-bg);
  color: var(--slogan-gray);
    padding-top : 40px;
    box-sizing : border-box;
`;

const Logo = styled.img`
  width: 384px;
  height: 384px;
  margin-bottom: -40px;
`;

const StartButton = styled.button`
  background: var(--theme-primary);
  color: var(--color-white);
  font-weight: 600;
  border-radius: 12px;
  padding: 9px 50px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
`;

const Inline = styled.div`
margin-top : 18px;
    display : flex;
    align-items : center;
    gap : 6px;
    margin-top : 0px;
`

const InlineText = styled.p`
color : var(--theme-primary);
    font-size: 14px;
`

const LinkButton = styled.button`
background-color : transparent;
    border : none;
    padding : 0;
    margin : 0;
    color : var(--theme-primary);
    font-weight : 800;
    font-size : 14px;
    cursor : pointer;
`