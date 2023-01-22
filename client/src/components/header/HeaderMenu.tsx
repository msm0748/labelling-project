import { getAuth, signOut } from "firebase/auth";
import styled from "styled-components";
import Modal from "../common/Modal";

interface Props {
    openModal: boolean;
    onClose: () => void;
    user: string;
}

const StyledList = styled.ul`
    position: absolute;
    top: 50px;
    right: 0;
    width: 240px;
    box-shadow: 0 2px 10px 0 rgb(169 169 169 / 26%);
    border-radius: 4px;
    font-size: 14px;
    background: #fff;

    li {
        display: flex;
        align-items: center;

        &:last-child {
            border-top: 1px solid rgba(26, 26, 26, 0.12);
        }

        &:nth-child(n + 2):hover {
            background: rgba(26, 26, 26, 0.03);
        }

        * {
            display: flex;
            width: 100%;
            height: 48px;
            text-align: left;
            align-items: center;
            padding: 0 16px;
        }
    }
`;

function MainMenu({ openModal, onClose, user }: Props) {
    const auth = getAuth();
    const onLogOutClick = () => {
        signOut(auth);
    };
    return (
        <Modal open={openModal} onClose={onClose}>
            <StyledList>
                <li>
                    <span>{user} 요원님</span>
                </li>
                <li>
                    <button onClick={onLogOutClick}>로그아웃</button>
                </li>
            </StyledList>
        </Modal>
    );
}

export default MainMenu;
