import React from "react";
import styled from "styled-components";

interface ModalProps {
    open: boolean;
    onClose: () => void;
    children: React.ReactNode;
}

const Overlay = styled.div`
    position: absolute;      
    inset: 0;             
    width: 100%;
    height: 100%;
    background: rgba(17, 17, 17, 0.45);
    display: flex;
    justify-content: center;
    align-items: flex-end;  
    z-index: 1000;          
    backdrop-filter: blur(1px);
`;

const ModalContainer = styled.div`
    width: 100%;
    max-width: 24rem;                 
    background: var(--color-white);
    border-radius: 1.5rem 1.5rem 0 0; 
    padding: 1rem;
    box-shadow: 0 -4px 16px rgba(0, 0, 0, 0.15);
    animation: slideUp 0.28s ease-out;
    transform: translateY(0);

    @keyframes slideUp {
        from {
            transform: translateY(12px);
            opacity: 0.96;
        }
        to {
            transform: translateY(0);
            opacity: 1;
        }
    }
`;

const Modal: React.FC<ModalProps> = ({ open, onClose, children }) => {
    if (!open) return null;

    return (
        <Overlay onClick={onClose}>
            {/* 모달 패널 클릭 시 닫힘 방지 */}
            <ModalContainer onClick={(e) => e.stopPropagation()}>
                {children}
            </ModalContainer>
        </Overlay>
    );
};

export default Modal;