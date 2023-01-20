import { ReactNode } from "react";
import styled from "styled-components";
import Wrap from "./Wrap";

interface Props {
    open: boolean;
    children: ReactNode;
    onClose: () => void;
}

const StyledModal = styled.div`
    position: fixed;
    z-index: 999;
    inset: 0px;
    display: flex;
`;

const SyltedWrap = styled(Wrap)`
    position: relative;
    height: 0;
`;

function Modal({ open, onClose, children }: Props) {
    if (!open) return null;
    return (
        <StyledModal onClick={onClose}>
            <SyltedWrap onClick={(e) => e.stopPropagation()}>{children}</SyltedWrap>
        </StyledModal>
    );
}

export default Modal;
