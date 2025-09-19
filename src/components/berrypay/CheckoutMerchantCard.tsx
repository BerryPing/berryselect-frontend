// import styled from 'styled-components';

// const Wrapper = styled.div`
//   display: flex;
//   justify-content: center;
//   margin-top: 12px;
// `;

// const Card = styled.div`
//   width: 320px;
//   background: white;
//   border-radius: 16px;
//   border: 1px solid #e5d5f0;
//   box-shadow: 0px 8px 20px -12px rgba(0, 0, 0, 0.15);
//   padding: 20px 16px;
//   text-align: center;
// `;

// const Title = styled.div`
//   font-size: 18px;
//   font-weight: 800;
//   color: #3c1053;
// `;

// const Address = styled.div`
//   font-size: 14px;
//   color: #9b4dcc;
//   margin-top: 4px;
// `;

// const Amount = styled.div`
//   font-size: 24px;
//   font-weight: 700;
//   color: #5f0080;
//   margin-top: 12px;
// `;

// interface Props {
//   name: string;
//   address: string;
//   amount: number;
// }

// export const CheckoutMerchantCard = ({ name, address, amount }: Props) => (
//   <Wrapper>
//     <Card>
//       <Title>{name}</Title>
//       <Address>{address}</Address>
//       <Amount>{amount.toLocaleString()}원</Amount>
//     </Card>
//   </Wrapper>
// );

import styled from 'styled-components';

const Wrapper = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 12px;
`;

const Card = styled.div`
  width: 320px; /* 피그마 기준 */
  background: white;
  border-radius: 16px;
  border: 1px solid #e5d5f0;
  box-shadow: 0px 8px 20px -12px rgba(0, 0, 0, 0.15);
  padding: 20px 16px 25px;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const Title = styled.div`
  font-size: 19.2px;
  font-weight: 800;
  color: #3c1053;
`;

const Address = styled.div`
  font-size: 13.6px;
  color: #9b4dcc;
  margin-top: 6px;
`;

const Amount = styled.div`
  font-size: 28.8px;
  font-weight: 700;
  color: #5f0080;
  margin-top: 14px;
`;

interface Props {
  name: string;
  address: string;
  amount: number;
}

export const CheckoutMerchantCard = ({ name, address, amount }: Props) => (
  <Wrapper>
    <Card>
      <Title>{name}</Title>
      <Address>{address}</Address>
      <Amount>{amount.toLocaleString()}원</Amount>
    </Card>
  </Wrapper>
);
