import { useState } from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";
import Wrap from "../common/Wrap";
import { useAppSelector } from "../../redux/store";
import HeaderMenu from "./HeaderMenu";

const StyledWrap = styled(Wrap)`
    display: flex;
    justify-content: space-between;
    height: 48px;
`;

const StyledList = styled.ul`
    display: flex;
    justify-content: center;
    align-items: center;
`;

const StyledItem = styled.li<{ padding?: string }>`
    padding: ${(props) => props.padding || "10px 24px"};
`;

const StyledLink = styled(Link)<{ bc?: string; color?: string }>`
    display: flex;
    align-items: center;
    border: 1px solid ${(props) => props.theme.color.main};
    height: 40px;
    font-weight: 500;
    font-size: 14px;
    padding: 0 32px;
    border-radius: 28px;
    background: ${(props) => props.bc};
    color: ${(props) => props.color};
`;

const StyledMenuButton = styled.button`
    width: 48px;
    height: 48px;
    display: flex;
    justify-content: center;
    align-items: center;

    svg {
        width: 24px;
        height: 24px;
        display: flex;
    }
`;

function HeaderComponent() {
    const [openModal, setOpenModal] = useState(false);
    const user = useAppSelector((state) => state.user);
    const onClose = () => setOpenModal(false);

    return (
        <>
            <StyledWrap>
                <StyledList>
                    <StyledItem>
                        <Link to="/">캐시미션</Link>
                    </StyledItem>
                    <StyledItem>
                        <Link to="/introduce">캐시미션 소개</Link>
                    </StyledItem>
                    <StyledItem>
                        <Link to="/contact">문의하기</Link>
                    </StyledItem>
                </StyledList>

                {user.isLoined ? (
                    <>
                        <StyledList>
                            <StyledMenuButton onClick={() => setOpenModal(true)}>
                                <div>
                                    <svg
                                        width="96"
                                        height="96"
                                        fill="rgba(26,26,26,0.8)"
                                        fillOpacity="1"
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 96 96"
                                    >
                                        <path
                                            fillRule="evenodd"
                                            clipRule="evenodd"
                                            d="M88 19a3 3 0 0 0-3-3H11a3 3 0 0 0 0 6h74a3 3 0 0 0 3-3Zm0 29a3 3 0 0 0-3-3H11a3 3 0 0 0 0 6h74a3 3 0 0 0 3-3Zm0 29a3 3 0 0 0-3-3H11a3 3 0 0 0 0 6h74a3 3 0 0 0 3-3Z"
                                        ></path>
                                    </svg>
                                </div>
                            </StyledMenuButton>
                        </StyledList>
                        <HeaderMenu openModal={openModal} onClose={onClose} user={user.value.email} />
                    </>
                ) : (
                    <StyledList>
                        <StyledItem padding="10px">
                            <StyledLink to="/signup">회원가입</StyledLink>
                        </StyledItem>
                        <StyledItem padding="10px">
                            <StyledLink to="/signin" bc="rgba(26, 26, 26)" color="#fff">
                                로그인
                            </StyledLink>
                        </StyledItem>
                    </StyledList>
                )}
            </StyledWrap>
        </>
    );
}

export default HeaderComponent;
