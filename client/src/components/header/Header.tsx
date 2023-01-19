import { Link } from "react-router-dom";
import styled from "styled-components";
import Wrap from "../common/Wrap";

const StyledWrap = styled(Wrap)`
    display: flex;
    justify-content: space-between;
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

function HeaderComponent() {
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

                <StyledList>
                    <StyledItem padding="10px">
                        <StyledLink to="/singup">회원가입</StyledLink>
                    </StyledItem>
                    <StyledItem padding="10px">
                        <StyledLink to="/singin" bc="rgba(26, 26, 26)" color="#fff">
                            로그인
                        </StyledLink>
                    </StyledItem>
                </StyledList>
            </StyledWrap>
        </>
    );
}

export default HeaderComponent;
