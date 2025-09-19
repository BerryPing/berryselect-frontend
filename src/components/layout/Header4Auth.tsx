import styled from "styled-components";

const AuthHeaderWrapper = styled.header`
  width: 100%;
  max-width: 24rem;
  background-color: var(--theme-primary);

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  height: 141px; 
  gap: 8px;
`;

const Brand = styled.h1`
  font-size: 32px;
  font-weight: 600;
  font-family: Inter, sans-serif;
  color:var(--slogan-gray);
  margin: 0;
    width : 100%;
    text-align: center;
`;

const Slogan = styled.p`
  font-size: 14.4px;
  font-weight: 500;
  font-family: Roboto, sans-serif;
  color: var(--slogan-gray);
  margin: 0;
  text-align: center;
    width : 100%;
`;

const Header4Auth: React.FC = () => {
    return (
        <AuthHeaderWrapper>
            <Brand>berryselect</Brand>
            <Slogan>내 지갑 속 딱 맞는 결제 순간</Slogan>
        </AuthHeaderWrapper>
    );
};

export default Header4Auth;