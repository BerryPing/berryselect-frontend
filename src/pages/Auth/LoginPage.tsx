import styled from "styled-components";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import berrylogo from "@/assets/imgs/berrylogo.png";
import Header4Auth from "@/components/layout/Header4Auth.tsx";



export default function LoginPage() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    //이미 토큰 있으면 홈으로
    useEffect (() => {
        const access = localStorage.getItem("accessToken");
        if(access) navigate("/",{replace : true});
    }, [navigate]);

    const startKakaoAuth = () => {
        if(loading) return;
        setLoading(true);
        const base = import.meta.env.VITE_API_BASE_URL;
        if(!base){
            console.error("VITE_API_BASE_URL 미설정");
            setLoading(false);
            return;
        }
        // 카카오 인가 URL로 이동 (백엔드가 신규/기존 유저 모두 처리)
        window.location.href = `${base}/auth/kakao/authorize`;
    };

    return (
        <div>
            <Header4Auth />

            <Wrapper>
            <Logo src={berrylogo} alt="berry logo" />

            {/* 회원가입(카카오로 시작하기) */}
            <StartButton onClick={startKakaoAuth} disabled={loading}>
                베리셀렉트 시작하기
            </StartButton>

            <Inline>
                <InlineText>이미 계정이 있으신가요?</InlineText>
                <LinkButton onClick={startKakaoAuth} disabled={loading}> 로그인 </LinkButton>
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